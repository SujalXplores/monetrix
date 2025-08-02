'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import type { Vote } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import { FinancialsTable } from './financials-table';
import { CopyIcon, PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { MessageEditor } from './message-editor';
import { PreviewAttachment } from './preview-attachment';
import { StockScreenerTable } from './stock-screener-table';
import { Button } from './ui/button';
import { News } from './ui/news';
import ShinyText from './ui/shiny-text';
import { StockChart } from './ui/stock-chart';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const TOOL_NAMES = {
  GET_STOCK_PRICES: 'getStockPrices',
  GET_NEWS: 'getNews',
  GET_INCOME_STATEMENTS: 'getIncomeStatements',
  GET_BALANCE_SHEETS: 'getBalanceSheets',
  GET_CASH_FLOW_STATEMENTS: 'getCashFlowStatements',
  GET_FINANCIAL_METRICS: 'getFinancialMetrics',
  SEARCH_STOCKS_BY_FILTERS: 'searchStocksByFilters',
} as const;

interface PreviewMessageProps {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  focusInput: () => void;
}

/**
 * @description Renders the appropriate component based on the tool name and result
 * @param toolName - The name of the tool that was invoked
 * @param result - The result data from the tool invocation
 * @returns The rendered tool result component
 */
const renderToolResult = (toolName: string, result: any) => {
  switch (toolName) {
    case TOOL_NAMES.GET_STOCK_PRICES:
      return <StockChart ticker={result.ticker} result={result} />;
    case TOOL_NAMES.GET_NEWS:
      return <News data={result} />;
    case TOOL_NAMES.GET_INCOME_STATEMENTS:
      return (
        <FinancialsTable
          data={result.income_statements}
          title="Income Statements"
        />
      );
    case TOOL_NAMES.GET_BALANCE_SHEETS:
      return (
        <FinancialsTable data={result.balance_sheets} title="Balance Sheets" />
      );
    case TOOL_NAMES.GET_CASH_FLOW_STATEMENTS:
      return (
        <FinancialsTable
          data={result.cash_flow_statements}
          title="Cash Flow Statements"
        />
      );
    case TOOL_NAMES.GET_FINANCIAL_METRICS:
      return (
        <FinancialsTable
          data={result.financial_metrics}
          title="Financial Metrics"
        />
      );
    case TOOL_NAMES.SEARCH_STOCKS_BY_FILTERS:
      return <StockScreenerTable data={result.search_results} />;
    default:
      return <div />;
  }
};

/**
 * Props for the UserActionButtons component
 */
interface UserActionButtonsProps {
  onEdit: () => void;
  onCopy: () => void;
}

/**
 * Action buttons for user messages (edit and copy)
 */
const UserActionButtons = ({ onEdit, onCopy }: UserActionButtonsProps) => (
  <div className="flex flex-row gap-1">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
          onClick={onEdit}
        >
          <PencilEditIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Edit message</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
          onClick={onCopy}
        >
          <CopyIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy message</TooltipContent>
    </Tooltip>
  </div>
);

interface MessageContentProps {
  message: Message;
  mode: 'view' | 'edit';
  isReadonly: boolean;
  onEdit: () => void;
  onCopy: () => void;
  setMode: React.Dispatch<React.SetStateAction<'view' | 'edit'>>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  focusInput: () => void;
}

/**
 * Renders message content based on current mode (view/edit)
 */
const MessageContent = ({
  message,
  mode,
  isReadonly,
  onEdit,
  onCopy,
  setMode,
  setMessages,
  reload,
  focusInput,
}: MessageContentProps) => {
  if (!message.content) return null;

  if (mode === 'edit') {
    return (
      <div className="flex flex-row gap-2 items-start">
        <div className="size-8" />
        <MessageEditor
          key={message.id}
          message={message}
          setMode={setMode}
          setMessages={setMessages}
          reload={reload}
          focusInput={focusInput}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 items-start">
      {message.role === 'assistant' && (
        <div className="flex items-center mt-1">
          <SparklesIcon size={16} className="text-yellow-500" />
        </div>
      )}
      {message.role === 'user' && !isReadonly && (
        <UserActionButtons onEdit={onEdit} onCopy={onCopy} />
      )}
      <div
        className={cn('flex flex-col gap-4', {
          'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
            message.role === 'user',
        })}
      >
        <Markdown>{message.content as string}</Markdown>
      </div>
    </div>
  );
};

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  focusInput,
}: PreviewMessageProps) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [_, copyToClipboard] = useCopyToClipboard();

  const handleEdit = () => {
    setMode('edit');
  };

  const handleCopy = async () => {
    await copyToClipboard(message.content as string);
    toast.success('Copied to clipboard!');
  };

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          <div className="flex flex-col gap-2 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            <MessageContent
              message={message}
              mode={mode}
              isReadonly={isReadonly}
              onEdit={handleEdit}
              onCopy={handleCopy}
              setMode={setMode}
              setMessages={setMessages}
              reload={reload}
              focusInput={focusInput}
            />

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state } = toolInvocation;

                  if (state === 'result') {
                    const { result } = toolInvocation;
                    return (
                      <div key={toolCallId}>
                        {renderToolResult(toolName, result)}
                      </div>
                    );
                  }
                  return <div key={toolCallId} />;
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role="assistant"
    >
      <div className="flex items-center gap-2">
        <div className="size-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent text-[#9FA2A5] align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <ShinyText text="Researching" className="text-sm" speed={3} />
      </div>
    </motion.div>
  );
};

export const LoadingMessage = ({
  loadingMessages,
}: {
  loadingMessages: string[];
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role="assistant"
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            {loadingMessages.map((message) => (
              <div key={message} className="flex items-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent text-[#9FA2A5] align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <ShinyText text={message} className="text-sm" speed={3} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
