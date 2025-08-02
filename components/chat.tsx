'use client';

import type { Attachment, ChatRequestOptions, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ApiKeysModal } from '@/components/api-keys-modal';
import { ChatHeader } from '@/components/chat-header';
import { useBlockSelector } from '@/hooks/use-block';
import { useInputFocus } from '@/hooks/use-input-focus';
import { useQueryLoading } from '@/hooks/use-query-loading';
import { useToolLoading } from '@/hooks/use-tool-loading';
import type { Vote } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { fetcher } from '@/lib/utils';
import { isApiKeyError, isPaymentError } from '@/lib/utils/api-error-patterns';
import { Block } from './block';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import type { VisibilityType } from './visibility-selector';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [apiKeyModalType, setApiKeyModalType] = useState<
    'api-key' | 'payment-error'
  >('api-key');
  const { setQueryLoading } = useQueryLoading();
  const { setToolLoading } = useToolLoading();
  const { registerInputRef, focusInput } = useInputFocus();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: {
      id,
      modelId: selectedModelId,
    },
    initialMessages,
    experimental_throttle: 100,
    onFinish: () => {
      mutate('/api/history');
    },
    onError: (error) => {
      logger.error('Chat error', { error });

      // Reset loading states when there's an error
      setQueryLoading(false, []);
      setToolLoading('searchStocksByFilters', false);
      setToolLoading('getCurrentStockPrice', false);
      setToolLoading('getStockPrices', false);
      setToolLoading('getIncomeStatements', false);
      setToolLoading('getBalanceSheets', false);
      setToolLoading('getCashFlowStatements', false);
      setToolLoading('getFinancialMetrics', false);

      // Only show API modal for specific API-related errors
      const errorMessage = error.message || '';
      const statusCode = (error as any).status || 0;

      // Payment/credit related errors
      if (isPaymentError(statusCode, errorMessage)) {
        setApiKeyModalType('payment-error');
        setShowApiKeysModal(true);
      }
      // API key related errors
      else if (isApiKeyError(statusCode, errorMessage)) {
        setApiKeyModalType('api-key');
        setShowApiKeysModal(true);
      }
      // For other errors (like 500), don't show the API modal - just log them
      // The user will see the error in the chat interface
    },
  });

  const handleFormSubmit = async (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    try {
      // Check if user has configured API keys
      const apiKeyResponse = await fetch('/api/api-keys?provider=openai');
      const apiKeyData = await apiKeyResponse.json();

      if (!apiKeyData.hasKey) {
        setApiKeyModalType('api-key');
        setShowApiKeysModal(true);
        return;
      }

      handleSubmit(event, chatRequestOptions);
    } catch (error) {
      logger.error('Error checking API key', { error });
      setApiKeyModalType('api-key');
      setShowApiKeysModal(true);
    }
  };

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isBlockVisible={isBlockVisible}
          focusInput={focusInput}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              ref={registerInputRef}
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleFormSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleFormSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />

      <ApiKeysModal
        open={showApiKeysModal}
        onOpenChange={setShowApiKeysModal}
        title={
          apiKeyModalType === 'payment-error'
            ? 'API Credits Exhausted'
            : 'Message Limit Reached'
        }
        description={
          apiKeyModalType === 'payment-error'
            ? 'Your financial data API credits have been exhausted. Please add more credits to your account or configure a new API key.'
            : 'You have reached your free message limit. Please add your OpenAI API key to continue using the chat.'
        }
      />
    </>
  );
}
