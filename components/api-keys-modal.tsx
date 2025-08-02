'use client';

import { RiEyeLine, RiEyeOffLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ApiKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ApiKeysModal({
  open,
  onOpenChange,
  title = 'Configure API keys',
  description,
}: ApiKeysModalProps) {
  const [openAIKey, setOpenAIKey] = useState('');
  const [financialKey, setFinancialKey] = useState('');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showFinancialKey, setShowFinancialKey] = useState(false);
  const [openAIError, setOpenAIError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load existing API key status when modal opens
  useEffect(() => {
    if (open) {
      loadApiKeyStatus();
    }
  }, [open]);

  const loadApiKeyStatus = async () => {
    try {
      const [openAIResponse, financialResponse] = await Promise.all([
        fetch('/api/api-keys?provider=openai'),
        fetch('/api/api-keys?provider=financial-datasets'),
      ]);

      if (openAIResponse.ok) {
        const openAIData = await openAIResponse.json();
        if (openAIData.hasKey && openAIData.maskedKey) {
          setOpenAIKey(openAIData.maskedKey);
        }
      }

      if (financialResponse.ok) {
        const financialData = await financialResponse.json();
        if (financialData.hasKey && financialData.maskedKey) {
          setFinancialKey(financialData.maskedKey);
        }
      }
    } catch (error) {
      console.error('Error loading API key status:', error);
    }
  };

  const validateAndSaveKeys = async () => {
    try {
      setIsLoading(true);
      setOpenAIError('');

      // Only validate if user entered a new OpenAI key (not masked)
      if (openAIKey && !openAIKey.includes('...')) {
        const validationResponse = await fetch('/api/validate-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: openAIKey }),
        });

        const validationResult = await validationResponse.json();

        if (!validationResult.isValid) {
          setOpenAIError(validationResult.error ?? 'Invalid OpenAI API key');
          return;
        }

        // Save OpenAI key
        const saveOpenAIResponse = await fetch('/api/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider: 'openai', apiKey: openAIKey }),
        });

        if (!saveOpenAIResponse.ok) {
          setOpenAIError('Failed to save OpenAI API key');
          return;
        }
      }

      // Save Financial Datasets key if provided and not masked
      if (financialKey && !financialKey.includes('...')) {
        const saveFinancialResponse = await fetch('/api/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'financial-datasets',
            apiKey: financialKey,
          }),
        });

        if (!saveFinancialResponse.ok) {
          console.error('Failed to save Financial Datasets API key');
          // Don't block success for financial datasets key failure
        }
      }

      onOpenChange(false);
    } catch (error) {
      setOpenAIError('An unexpected error occurred. Please try again.');
      console.error('Error saving API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="openai-key" className="text-sm font-medium">
              OpenAI API Key
            </label>
            <div className="relative">
              <Input
                id="openai-key"
                type={showOpenAIKey ? 'text' : 'password'}
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="sk-..."
              />
              <button
                type="button"
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showOpenAIKey ? (
                  <RiEyeOffLine size={16} />
                ) : (
                  <RiEyeLine size={16} />
                )}
              </button>
            </div>
            {openAIError && (
              <p className="text-sm text-red-500 mt-1">{openAIError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="financial-key" className="text-sm font-medium">
              Financial Datasets API Key
            </label>
            <div className="relative">
              <Input
                id="financial-key"
                type={showFinancialKey ? 'text' : 'password'}
                value={financialKey}
                onChange={(e) => setFinancialKey(e.target.value)}
                placeholder="Enter your Financial Datasets API key"
              />
              <button
                type="button"
                onClick={() => setShowFinancialKey(!showFinancialKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showFinancialKey ? (
                  <RiEyeOffLine size={16} />
                ) : (
                  <RiEyeLine size={16} />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://financialdatasets.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                financialdatasets.ai
              </a>
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={validateAndSaveKeys}
            disabled={isLoading}
            variant="shimmer"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
