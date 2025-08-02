import { cx } from 'class-variance-authority';
import * as React from 'react';

interface TickerSuggestionsProps {
  suggestions: string[];
  onSelect: (ticker: string) => void;
  position: { top: number; left: number } | null;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
}

export function TickerSuggestions({
  suggestions,
  onSelect,
  position,
  selectedIndex = 0,
  onSelectedIndexChange,
}: TickerSuggestionsProps) {
  if (!position || suggestions.length === 0) return null;

  // Calculate safer positioning to avoid going off-screen
  const viewport = {
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  };

  // Make the menu width more responsive - smaller but not too small
  const menuWidth = Math.min(280, Math.max(240, viewport.width * 0.25));

  const adjustedPosition = { ...position };

  // Adjust horizontal position if menu would go off-screen
  if (adjustedPosition.left + menuWidth > viewport.width - 20) {
    adjustedPosition.left = viewport.width - menuWidth - 20;
  }
  if (adjustedPosition.left < 20) {
    adjustedPosition.left = 20;
  }

  return (
    <div
      className={cx(
        // Base styling matching the input design more closely
        'fixed z-50',
        'rounded-2xl bg-card/90 backdrop-blur-md',
        'border border-border/80 shadow-lg',
        'overflow-hidden',
        // Dark mode enhancements to match input exactly
        'dark:bg-card/80 dark:border-border/70',
        'dark:shadow-black/30 dark:backdrop-blur-lg',
        // More subtle animation with slight scale
        'animate-slide-up',
        // Add subtle glow effect like the input
        'shadow-md',
        'dark:shadow-black/20',
        // Subtle transform for a more polished feel
        'transform-gpu',
      )}
      style={{
        bottom: `calc(100vh - ${adjustedPosition.top}px)`,
        left: `${adjustedPosition.left}px`,
        width: `${menuWidth}px`,
      }}
      role="listbox"
      aria-label="Ticker suggestions"
      id="ticker-suggestions"
    >
      <div className="py-1.5">
        {suggestions.map((ticker, index) => (
          <button
            key={ticker}
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            id={`ticker-option-${index}`}
            className={cx(
              // Base button styling with better spacing
              'w-full px-4 py-3 text-left',
              'transition-all duration-150 ease-out',
              'focus:outline-none relative',
              'group transform-gpu',
              // Selected state (keyboard navigation) - more subtle
              index === selectedIndex && [
                'bg-accent/60 text-accent-foreground',
                'dark:bg-accent/40',
              ],
              // Hover state - matches input hover feel
              'hover:bg-accent/80 hover:text-accent-foreground',
              'dark:hover:bg-accent/50',
              // Focus state for accessibility
              'focus-visible:bg-accent focus-visible:text-accent-foreground',
              'focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-inset',
              // Active state for better feedback
              'active:scale-[0.99] active:bg-accent/90',
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(ticker);
            }}
            onMouseEnter={() => {
              // Update selected index on hover for better UX
              onSelectedIndexChange?.(index);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Ticker symbol with better typography */}
                <span className="font-mono text-sm font-semibold tracking-wider text-foreground">
                  {ticker}
                </span>
                {/* Subtle indicator dot */}
                <div
                  className={cx(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    index === selectedIndex
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30',
                  )}
                />
              </div>
              {/* Right side label - more subtle */}
              <span
                className={cx(
                  'text-xs transition-colors font-medium',
                  index === selectedIndex
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/70',
                )}
              >
                Stock
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer with keyboard hint - more minimal and polished */}
      <div
        className={cx(
          'px-4 py-2.5 border-t border-border/30',
          'bg-muted/20 dark:bg-muted/10',
          'text-xs text-muted-foreground/80',
        )}
      >
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] bg-background/50 rounded border border-border/40">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] bg-background/50 rounded border border-border/40">
              ↵
            </kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] bg-background/50 rounded border border-border/40">
              Esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
