'use client';

import type { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { motion } from 'framer-motion';
import { memo, useState } from 'react';
import { ApiKeysModal } from './api-keys-modal';
import { Button } from './ui/button';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);

  const suggestedActions = [
    {
      title: 'Explain how to build',
      label: 'a balanced investment portfolio',
      mobileTitle: 'Build portfolio',
      mobileLabel: 'investment strategy',
      action:
        'Explain how to build a balanced investment portfolio for a beginner, including asset allocation, risk management, and diversification strategies with practical examples',
    },
    {
      title: 'What is the latest news',
      label: 'for Tesla?',
      mobileTitle: 'Latest news',
      mobileLabel: 'for TSLA',
      action: 'What is the latest news for Tesla?',
    },
    {
      title: "How has Nvidia's price",
      label: 'changed year to date?',
      mobileTitle: 'Price history',
      mobileLabel: 'of NVDA year to date',
      action: "How has Nvidia's price changed year to date?",
    },
    {
      title: 'Compare the financial metrics',
      label: 'of Microsoft and Google',
      mobileTitle: 'Compare metrics',
      mobileLabel: 'MSFT vs GOOGL',
      action: 'Compare the financial metrics of Microsoft and Google',
    },
  ];

  return (
    <>
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 w-full">
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
            className="block"
          >
            <Button
              variant="ghost"
              type="button"
              onClick={async () => {
                try {
                  // Check if user has configured API keys
                  const apiKeyResponse = await fetch(
                    '/api/api-keys?provider=openai',
                  );
                  const apiKeyData = await apiKeyResponse.json();

                  if (!apiKeyData.hasKey) {
                    setShowApiKeysModal(true);
                    return;
                  }

                  window.history.replaceState({}, '', `/chat/${chatId}`);
                  append({
                    role: 'user',
                    content: suggestedAction.action,
                  });
                } catch (error) {
                  console.error('Error checking API key:', error);
                  setShowApiKeysModal(true);
                }
              }}
              className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full max-w-[calc(100vw-2rem)] h-auto justify-start items-start break-words"
            >
              <span className="font-medium break-words">
                <span className="hidden sm:inline">
                  {suggestedAction.title}
                </span>
                <span className="sm:hidden">{suggestedAction.mobileTitle}</span>
              </span>
              <span className="text-muted-foreground break-words">
                <span className="hidden sm:inline">
                  {suggestedAction.label}
                </span>
                <span className="sm:hidden">{suggestedAction.mobileLabel}</span>
              </span>
            </Button>
          </motion.div>
        ))}
      </div>

      <ApiKeysModal
        open={showApiKeysModal}
        onOpenChange={setShowApiKeysModal}
        title="Message Limit Reached"
        description="You have reached your free message limit. Please add your OpenAI API key to continue using the chat."
      />
    </>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
