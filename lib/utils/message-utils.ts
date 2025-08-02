import type { CoreAssistantMessage, CoreToolMessage, Message } from 'ai';

export const MessageFilters = {
  hasContent: (message: Message): boolean => {
    return message.content.length > 0;
  },

  hasToolInvocations: (message: Message): boolean => {
    return !!(message.toolInvocations && message.toolInvocations.length > 0);
  },

  isToolMessage: (
    message: CoreToolMessage | CoreAssistantMessage,
  ): message is CoreToolMessage => {
    return message.role === 'tool';
  },

  isAssistantMessage: (
    message: CoreToolMessage | CoreAssistantMessage,
  ): message is CoreAssistantMessage => {
    return message.role === 'assistant';
  },

  hasValidToolContent: (content: any[]): boolean => {
    return content.some(
      (c) =>
        c.type === 'tool-result' || (c.type === 'text' && c.text?.length > 0),
    );
  },
};

export const collectToolResultIds = (
  messages: Array<CoreToolMessage | CoreAssistantMessage>,
): string[] => {
  const toolResultIds: string[] = [];

  for (const message of messages) {
    if (MessageFilters.isToolMessage(message)) {
      for (const content of message.content) {
        if (content.type === 'tool-result') {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  return toolResultIds;
};

export const sanitizeAssistantContent = (
  message: CoreAssistantMessage,
  toolResultIds: string[],
) => {
  if (typeof message.content === 'string') return message;

  const sanitizedContent = message.content.filter((content) =>
    content.type === 'tool-call'
      ? toolResultIds.includes(content.toolCallId)
      : content.type === 'text'
        ? content.text.length > 0
        : true,
  );

  return {
    ...message,
    content: sanitizedContent,
  };
};

export const sanitizeToolInvocations = (message: Message) => {
  if (message.role !== 'assistant' || !message.toolInvocations) return message;

  const toolResultIds: string[] = [];

  for (const toolInvocation of message.toolInvocations) {
    if (toolInvocation.state === 'result') {
      toolResultIds.push(toolInvocation.toolCallId);
    }
  }

  const sanitizedToolInvocations = message.toolInvocations.filter(
    (toolInvocation) =>
      toolInvocation.state === 'result' ||
      toolResultIds.includes(toolInvocation.toolCallId),
  );

  return {
    ...message,
    toolInvocations: sanitizedToolInvocations,
  };
};

export const sanitizeMessages = {
  response: (messages: Array<CoreToolMessage | CoreAssistantMessage>) => {
    const toolResultIds = collectToolResultIds(messages);

    const sanitizedMessages = messages.map((message) =>
      MessageFilters.isAssistantMessage(message)
        ? sanitizeAssistantContent(message, toolResultIds)
        : message,
    );

    return sanitizedMessages.filter((message) => {
      if (MessageFilters.isToolMessage(message)) {
        return message.content.length > 0;
      }

      if (MessageFilters.isAssistantMessage(message)) {
        if (typeof message.content === 'string') {
          return message.content.length > 0;
        }

        if (Array.isArray(message.content)) {
          return message.content.length > 0;
        }
      }

      return true;
    });
  },

  ui: (messages: Array<Message>) => {
    const sanitizedByToolInvocations = messages.map(sanitizeToolInvocations);

    return sanitizedByToolInvocations.filter(
      (message) =>
        MessageFilters.hasContent(message) ||
        MessageFilters.hasToolInvocations(message),
    );
  },
};

export const MessageTransformers = {
  addToolResult: (messages: Array<Message>, toolMessage: CoreToolMessage) => {
    return messages.map((message) => {
      if (message.toolInvocations) {
        return {
          ...message,
          toolInvocations: message.toolInvocations.map((toolInvocation) => {
            const toolResult = toolMessage.content.find(
              (tool) => tool.toolCallId === toolInvocation.toolCallId,
            );

            if (toolResult) {
              return {
                ...toolInvocation,
                state: 'result' as const,
                result: toolResult.result,
              };
            }

            return toolInvocation;
          }),
        };
      }

      return message;
    });
  },
};
