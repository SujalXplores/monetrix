import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Base styles with improved spacing and typography
        'flex min-h-[80px] w-full rounded-xl border transition-all duration-200',
        // Background and text styling with enhanced visibility
        'bg-card/90 backdrop-blur-md px-4 py-3 text-base leading-relaxed',
        // Border and shadow styling with improved visual depth
        'border-border/80 shadow-md hover:shadow-lg',
        // Hover state with enhanced background change
        'hover:bg-card hover:border-border',
        // Focus state with enhanced ring and border
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/70',
        'focus-visible:bg-card focus-visible:shadow-xl',
        // Placeholder styling
        'placeholder:text-muted-foreground/80 placeholder:font-normal',
        // Disabled state
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30',
        // Dark mode optimizations with enhanced contrast
        'dark:bg-card/80 dark:hover:bg-card dark:focus-visible:bg-card/95',
        'dark:border-border/70 dark:hover:border-border dark:focus-visible:border-primary/60',
        'dark:shadow-black/20 dark:hover:shadow-black/30 dark:focus-visible:shadow-black/40',
        'dark:backdrop-blur-lg',
        // Responsive text sizing
        'md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
