'use client';

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from 'ai';
import cx from 'classnames';
import equal from 'fast-deep-equal';
import type React from 'react';
import {
  type ChangeEvent,
  type Dispatch,
  forwardRef,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import type { InputFocusControls } from '@/hooks/use-input-focus';
import { useQueryLoading } from '@/hooks/use-query-loading';
import { sanitizeUIMessages } from '@/lib/utils';
import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { SuggestedActions } from './suggested-actions';
import { TickerSuggestions } from './ticker-suggestions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const TICKER_SUGGESTIONS = ['AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA'];

const PureMultimodalInput = forwardRef<
  InputFocusControls,
  {
    chatId: string;
    input: string;
    setInput: (value: string) => void;
    isLoading: boolean;
    stop: () => void;
    attachments: Array<Attachment>;
    setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
    messages: Array<Message>;
    setMessages: Dispatch<SetStateAction<Array<Message>>>;
    append: (
      message: Message | CreateMessage,
      chatRequestOptions?: ChatRequestOptions,
    ) => Promise<string | null | undefined>;
    handleSubmit: (
      event?: {
        preventDefault?: () => void;
      },
      chatRequestOptions?: ChatRequestOptions,
    ) => void;
    className?: string;
  }
>(function PureMultimodalInput(
  {
    chatId,
    input,
    setInput,
    isLoading,
    stop,
    attachments,
    setAttachments,
    messages,
    setMessages,
    append,
    handleSubmit,
    className,
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }),
    [],
  );

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setInput(newValue);
    adjustHeight();

    // Handle ticker suggestions
    const lastAtIndex = newValue.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = newValue.slice(lastAtIndex + 1);
      const match = textAfterAt.match(/^[A-Za-z]*$/);

      if (match) {
        setShowTickerSuggestions(true);
        setTickerFilter(textAfterAt);
        setSelectedIndex(0); // Reset selection when filter changes

        // Calculate menu position - improved to feel more connected
        const textarea = textareaRef.current;
        if (textarea) {
          const rect = textarea.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(textarea);
          const paddingLeft = Number.parseInt(computedStyle.paddingLeft);

          // Create a more precise positioning
          setMenuPosition({
            // Position the menu above the textarea with a small gap
            top: rect.top + window.scrollY - 12,
            // Align with the left edge of the textarea content (accounting for padding)
            left: rect.left + paddingLeft,
          });
        }
      } else {
        setShowTickerSuggestions(false);
      }
    } else {
      setShowTickerSuggestions(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput('');

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (_error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const [showTickerSuggestions, setShowTickerSuggestions] = useState(false);
  const [tickerFilter, setTickerFilter] = useState('');
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleTickerSelect = (ticker: string) => {
    const parts = input.split('@');
    const newInput = `${parts.slice(0, -1).join('@') + ticker} `;
    setInput(newInput);
    setShowTickerSuggestions(false);
    setTickerFilter('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const filteredSuggestions = TICKER_SUGGESTIONS.filter((ticker) =>
    ticker.toLowerCase().startsWith(tickerFilter.toLowerCase()),
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showTickerSuggestions && filteredSuggestions.length > 0) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
          );
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
          );
          break;
        case 'Enter':
          if (!event.shiftKey) {
            event.preventDefault();
            handleTickerSelect(filteredSuggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setShowTickerSuggestions(false);
          break;
      }
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (isLoading) {
        toast.error('Please wait for the model to finish its response!');
      } else {
        submitForm();
      }
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions append={append} chatId={chatId} />
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-3 overflow-x-scroll items-end pb-2">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      {showTickerSuggestions && (
        <TickerSuggestions
          suggestions={filteredSuggestions}
          onSelect={handleTickerSelect}
          position={menuPosition}
          selectedIndex={selectedIndex}
          onSelectedIndexChange={setSelectedIndex}
        />
      )}

      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder="Send a message...type @ to include tickers"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          aria-describedby={
            showTickerSuggestions ? 'ticker-suggestions' : undefined
          }
          aria-expanded={showTickerSuggestions}
          aria-haspopup="listbox"
          aria-activedescendant={
            showTickerSuggestions ? `ticker-option-${selectedIndex}` : undefined
          }
          role="combobox"
          className={cx(
            'min-h-[52px] max-h-[calc(75dvh)] overflow-hidden resize-none',
            'rounded-2xl !text-base bg-card/90 backdrop-blur-md',
            'border-border/80 hover:border-border focus-visible:border-primary/70',
            'hover:bg-card focus-visible:bg-card',
            'shadow-md hover:shadow-lg focus-visible:shadow-xl',
            'transition-all duration-200 ease-out',
            'pb-12 pt-4 px-4',
            // Dark mode enhancements with enhanced contrast
            'dark:bg-card/80 dark:hover:bg-card dark:focus-visible:bg-card/95',
            'dark:border-border/70 dark:hover:border-border dark:focus-visible:border-primary/60',
            'dark:shadow-black/20 dark:hover:shadow-black/30 dark:focus-visible:shadow-black/40',
            'dark:backdrop-blur-lg',
            className,
          )}
          rows={2}
          autoFocus
        />

        <div className="absolute bottom-2 left-2 flex flex-row justify-start">
          <AttachmentsButton
            fileInputRef={fileInputRef}
            isLoading={isLoading}
          />
        </div>

        <div className="absolute bottom-2 right-2 flex flex-row justify-end">
          {isLoading ? (
            <StopButton stop={stop} setMessages={setMessages} />
          ) : (
            <SendButton
              input={input}
              submitForm={submitForm}
              uploadQueue={uploadQueue}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  isLoading,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  isLoading: boolean;
}) {
  return (
    <Button
      className={cx(
        'rounded-xl p-2.5 h-10 w-10',
        'bg-background/90 hover:bg-background border border-border/80',
        'hover:border-border hover:shadow-md',
        'transition-all duration-200 ease-out',
        'backdrop-blur-md',
        // Dark mode with enhanced contrast
        'dark:bg-background/70 dark:hover:bg-background/90',
        'dark:border-border/70 dark:hover:border-border',
        'dark:hover:shadow-black/25',
        // Focus state
        'focus-visible:ring-2 focus-visible:ring-primary/30',
        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={isLoading}
      variant="ghost"
    >
      <PaperclipIcon size={16} className="text-muted-foreground" />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
}) {
  const { setQueryLoading } = useQueryLoading();

  return (
    <Button
      className={cx(
        'rounded-full p-2.5 h-10 w-10',
        'bg-destructive/15 hover:bg-destructive/25 border border-destructive/40',
        'hover:border-destructive/60 hover:shadow-sm',
        'transition-all duration-200 ease-out',
        'backdrop-blur-sm',
        // Dark mode with softer colors
        'dark:bg-destructive/15 dark:hover:bg-destructive/25',
        'dark:border-destructive/30 dark:hover:border-destructive/50',
        'dark:hover:shadow-black/20',
        // Focus state
        'focus-visible:ring-2 focus-visible:ring-destructive/25',
      )}
      onClick={(event) => {
        event.preventDefault();
        stop();
        setQueryLoading(false, []);
        setMessages((messages) => sanitizeUIMessages(messages));
      }}
    >
      <StopIcon size={16} className="text-destructive" />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  const isDisabled = input.length === 0 || uploadQueue.length > 0;

  return (
    <Button
      className={cx(
        'rounded-full p-2.5 h-10 w-10',
        'transition-all duration-200 ease-out',
        'backdrop-blur-sm',
        // Enabled state
        !isDisabled && [
          'bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md',
          'border border-primary/25 hover:border-primary/40',
          'focus-visible:ring-2 focus-visible:ring-primary/25',
          'hover:scale-105 active:scale-95',
          // Dark mode with better contrast
          'dark:bg-primary dark:hover:bg-primary/90',
          'dark:shadow-black/20 dark:hover:shadow-black/30',
          'dark:border-primary/30 dark:hover:border-primary/50',
        ],
        // Disabled state with improved styling
        isDisabled && [
          'bg-muted/50 border border-border/50 shadow-sm',
          'cursor-not-allowed',
          'dark:bg-muted/30 dark:border-border/40',
          'hover:bg-muted/50 hover:border-border/50 hover:shadow-sm',
          'dark:hover:bg-muted/30 dark:hover:border-border/40',
        ],
      )}
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={isDisabled}
    >
      <ArrowUpIcon
        size={16}
        className={cx(
          'transition-colors duration-200',
          !isDisabled ? 'text-primary-foreground' : 'text-muted-foreground/60',
        )}
      />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
