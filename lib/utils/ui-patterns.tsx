import { nanoid } from 'nanoid';
import React from 'react';
import { cn } from '@/lib/utils';

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export const createLoadingComponent = (
  LoadingIcon: React.ComponentType<{ size?: number; className?: string }>,
) => {
  return ({
    size = 16,
    className,
    text = 'Loading...',
  }: {
    size?: number;
    className?: string;
    text?: string;
  }) => (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="animate-spin">
        <LoadingIcon size={size} />
      </div>
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// Button variant factory for consistent styling
export const createButtonVariant = (baseClasses: string) => {
  return (extraClasses?: string) => cn(baseClasses, extraClasses);
};

// Form field wrapper to reduce repetition
export const FormField = ({
  label,
  error,
  children,
  className,
  htmlFor,
}: {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) => (
  <div className={cn('space-y-2', className)}>
    {label && (
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
    )}
    {children}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

// Error boundary pattern
export const ErrorDisplay = ({
  error,
  retry,
  className,
}: {
  error: string | Error;
  retry?: () => void;
  className?: string;
}) => (
  <div
    className={cn(
      'p-4 border border-destructive/20 bg-destructive/5 rounded-md',
      className,
    )}
  >
    <p className="text-sm text-destructive mb-2">
      {typeof error === 'string' ? error : error.message}
    </p>
    {retry && (
      <button
        type="button"
        onClick={retry}
        className="text-xs text-destructive hover:text-destructive/80 underline"
      >
        Try again
      </button>
    )}
  </div>
);

// Skeleton loader pattern
export const createSkeletonLoader = (count: number = 3) => {
  return ({ className }: { className?: string }) => {
    const items = Array.from({ length: count }, () => nanoid());

    return (
      <div className={cn('space-y-3', className)}>
        {items.map((id) => (
          <div key={id} className="animate-pulse space-y-2">
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  };
};

// Modal/Dialog content wrapper
export const ModalContent = ({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('space-y-4', className)}>
    {title && (
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    )}
    {children}
  </div>
);

// Table pattern for financial data
export const FinancialDataTable = ({
  headers,
  data,
  className,
}: {
  headers: string[];
  data: Record<string, any>[];
  className?: string;
}) => (
  <div className={cn('rounded-md border', className)}>
    <table className="w-full">
      <thead className="border-b bg-muted/50">
        <tr>
          {headers.map((header) => (
            <th
              key={`header-${header}`}
              className="px-3 py-2 text-left text-sm font-medium"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={`row-${row.id || i}`} className="border-b last:border-0">
            {headers.map((header) => (
              <td
                key={`cell-${row.id || i}-${header}`}
                className="px-3 py-2 text-sm"
              >
                {row[header.toLowerCase().replace(' ', '_')] || '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Status indicator pattern
export const StatusIndicator = ({
  status,
  className,
}: {
  status: 'loading' | 'success' | 'error' | 'idle';
  className?: string;
}) => {
  const statusConfig = {
    loading: { color: 'bg-blue-500', label: 'Loading' },
    success: { color: 'bg-green-500', label: 'Success' },
    error: { color: 'bg-red-500', label: 'Error' },
    idle: { color: 'bg-gray-500', label: 'Idle' },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('w-2 h-2 rounded-full', config.color)} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  );
};
