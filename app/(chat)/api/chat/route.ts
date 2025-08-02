import { auth } from '@clerk/nextjs/server';
import {
  convertToCoreMessages,
  createDataStreamResponse,
  generateObject,
  type Message,
  streamText,
} from 'ai';
import { AISDKExporter } from 'langsmith/vercel';
import { z } from 'zod';
import { customModel } from '@/lib/ai';
import {
  type AllowedTools,
  FinancialToolsManager,
  financialTools,
} from '@/lib/ai/financial-tools';
import { models } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import { STREAM_DELAYS } from '@/lib/constants';
import { getUserApiKey } from '@/lib/db/api-key-storage';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { logger } from '@/lib/logger';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const allTools: AllowedTools[] = [...financialTools];

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
  } = await request.json();

  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  // Retrieve API keys securely from the database
  const openAIApiKey =
    (await getUserApiKey({
      userId,
      provider: 'openai',
    })) || process.env.OPENAI_API_KEY;

  const financialDatasetsApiKey =
    (await getUserApiKey({
      userId,
      provider: 'financial-datasets',
    })) || process.env.FINANCIAL_DATASETS_API_KEY;

  if (!openAIApiKey) {
    return new Response(
      'OpenAI API key is required. Please configure your API key in settings.',
      { status: 400 },
    );
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({
      message: userMessage,
    });
    await saveChat({ id, userId, title });
  }

  const userMessageId = generateUUID();

  await saveMessages({
    messages: [
      { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
    ],
  });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Initialize the financial tools manager
      const financialToolsManager = new FinancialToolsManager({
        financialDatasetsApiKey: financialDatasetsApiKey || '',
        dataStream,
      });
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      dataStream.writeData({
        type: 'query-loading',
        content: {
          isLoading: true,
          taskNames: [],
        },
      });

      const { object } = await generateObject({
        model: customModel('gpt-4.1-nano-2025-04-14', openAIApiKey),
        output: 'array',
        schema: z.object({
          task_name: z.string(),
          class: z.string().describe('The name of the sub-task'),
        }),
        prompt: `You are a reasoning agent.
        Given the following user query: ${userMessage.content},
        break it down to small, tightly-scoped sub-tasks
        that need to be taken to answer the query.

        Your task breakdown should:
        - Be comprehensive and cover all aspects needed to fully answer the query
        - Follow a logical research sequence from basic information to deeper analysis
        - Include 1-3 tasks maximum - fewer is better as long as they cover the complete question
        - Prioritize the most essential research steps and consolidate similar actions
        - Start with gathering fundamental data before moving to analysis and comparison
        - Make thought processes transparent to users who will see these tasks
        - Show a clear progression of reasoning that builds toward the answer

        Format requirements:
        - Include the ticker or company name where appropriate
        - Use present progressive tense (e.g., "Analyzing", "Retrieving", "Comparing")
        - Keep task names short (3-7 words) but specific and informative
        - Make tasks distinct with no overlap or redundancy
        - Begin with data collection tasks, then move to analysis tasks

        Your output will guide another LLM in executing these tasks, and users will see these steps as the system works.
        Ensure tasks are optimally structured for the available financial tools and clearly communicate the research approach.
        Focus on minimizing the number of steps while maintaining comprehensiveness.

        Examples of good task sequences:
        - "Retrieving AAPL financial", "Analyzing AAPL performance trends"
        - "Finding top tech stocks", "Evaluating financial health"`,
      });

      // Stream the tasks in the query loading state
      dataStream.writeData({
        type: 'query-loading',
        content: {
          isLoading: true,
          taskNames: object.map((task: any) => task.task_name),
        },
      });

      let receivedFirstChunk = false;

      // Create a transient version of coreMessages with task names
      const coreMessagesWithTaskNames = [...coreMessages];
      // Replace the last user message content with task names
      const lastMessage =
        coreMessagesWithTaskNames[coreMessagesWithTaskNames.length - 1];
      if (
        coreMessagesWithTaskNames.length > 0 &&
        lastMessage?.role === 'user'
      ) {
        const taskList = object.map((task: any) => task.task_name).join('\n');
        coreMessagesWithTaskNames[coreMessagesWithTaskNames.length - 1] = {
          role: 'user',
          content: taskList,
        };
      }

      const result = streamText({
        model: customModel(model.apiIdentifier, openAIApiKey),
        system: systemPrompt,
        messages: coreMessagesWithTaskNames,
        maxSteps: 10,
        experimental_activeTools: allTools,
        experimental_telemetry: AISDKExporter.getSettings(),
        onChunk: (event) => {
          const isToolCall = event.chunk.type === 'tool-call';
          if (!receivedFirstChunk && !isToolCall) {
            receivedFirstChunk = true;
            // Set query-loading to false on first token
            dataStream.writeData({
              type: 'query-loading',
              content: {
                isLoading: false,
                taskNames: [],
              },
            });
          }
        },
        onFinish: async ({ response }) => {
          // CAUTION: this is a hack to prevent stream from being cut off
          // TODO: find a better solution by implementing proper stream completion detection
          await new Promise((resolve) =>
            setTimeout(resolve, STREAM_DELAYS.FINISH_DELAY_MS),
          );

          // Ensure query loading is reset in case it wasn't reset during streaming
          dataStream.writeData({
            type: 'query-loading',
            content: {
              isLoading: false,
              taskNames: [],
            },
          });

          // Reset all tool loading states
          dataStream.writeData({
            type: 'tool-loading',
            content: {
              tool: 'searchStocksByFilters',
              isLoading: false,
              message: null,
            },
          });

          // save the response
          if (userId) {
            try {
              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages(response.messages);

              if (responseMessagesWithoutIncompleteToolCalls.length > 0) {
                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === 'assistant') {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content,
                        createdAt: new Date(),
                      };
                    },
                  ),
                });
              } else {
                logger.debug('No valid messages to save');
                // Even if no messages to save, we need to write a message annotation
                // to let the frontend know the conversation completed
                const messageId = generateUUID();
                dataStream.writeMessageAnnotation({
                  messageIdFromServer: messageId,
                });
              }
            } catch (error) {
              logger.error('Failed to save chat', { error });
            }
          }
        },
        onStepFinish: async ({ stepType }) => {
          // Reset loading states when a step finishes, especially if it's a tool step that failed
          if (stepType === 'tool-result') {
            // Reset query loading state
            dataStream.writeData({
              type: 'query-loading',
              content: {
                isLoading: false,
                taskNames: [],
              },
            });

            // Reset tool loading states
            dataStream.writeData({
              type: 'tool-loading',
              content: {
                tool: 'searchStocksByFilters',
                isLoading: false,
                message: null,
              },
            });
          }
        },
        tools: financialToolsManager.getTools(),
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (_error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
