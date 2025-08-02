import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
  delay?: number;
  decimalPlaces?: number;
  format?: 'currency' | 'percentage' | 'number';
  currency?: string;
}

export function NumberTicker({
  value,
  direction = 'up',
  className,
  delay = 0,
  decimalPlaces = 0,
  format = 'number',
  currency = 'USD',
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const formatValue = (val: number) => {
      if (format === 'currency') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(val);
      }
      if (format === 'percentage') {
        return `${val.toFixed(decimalPlaces)}%`;
      }
      return val.toFixed(decimalPlaces);
    };

    const startValue = direction === 'down' ? value : 0;
    const endValue = direction === 'down' ? 0 : value;

    let startTimestamp: number | null = null;
    const duration = 2000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easedProgress;

      if (ref.current) {
        ref.current.textContent = formatValue(currentValue);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, direction, delay, decimalPlaces, format, currency]);

  return (
    <span
      ref={ref}
      className={cn(
        'font-mono tabular-nums transition-colors duration-300',
        direction === 'up' && 'text-financial-positive',
        direction === 'down' && 'text-financial-negative',
        className,
      )}
    >
      {format === 'currency'
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(0)
        : format === 'percentage'
          ? `${(0).toFixed(decimalPlaces)}%`
          : (0).toFixed(decimalPlaces)}
    </span>
  );
}
