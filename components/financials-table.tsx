'use client';

import { RiCheckboxCircleFill } from '@remixicon/react';
import { cx } from 'class-variance-authority';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { NumberTicker } from '@/components/ui/number-ticker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Green } from './styles/colors';

interface FinancialData {
  [key: string]: any;
  report_period: string;
}

interface FinancialsTableProps {
  data: FinancialData[];
  excludeFields?: string[];
  title?: string;
}

export function FinancialsTable({
  data,
  excludeFields = [
    'ticker',
    'calendar_date',
    'report_period',
    'period',
    'currency',
  ],
  title,
}: FinancialsTableProps) {
  if (!data || data.length === 0) return null;

  // Get ticker from first data item
  const ticker = data[0].ticker;

  // Get all unique keys from the data, excluding specified fields
  const lineItems = Object.keys(data[0]).filter(
    (key) => !excludeFields.includes(key),
  );

  // Format period label
  const formatPeriod = (period: string) => {
    switch (period) {
      case 'ttm':
        return 'TTM';
      case 'quarterly':
        return 'Quarterly';
      case 'annual':
        return 'Annual';
      default:
        return period;
    }
  };

  // Format number values with NumberTicker
  const formatValue = (value: any, delay: number = 0) => {
    if (typeof value === 'number') {
      // Determine if it's a large number that should use suffix format
      if (Math.abs(value) >= 1e9) {
        return (
          <NumberTicker
            value={value / 1e9}
            format="number"
            decimalPlaces={2}
            delay={delay}
            className="font-mono"
          />
        );
      }
      if (Math.abs(value) >= 1e6) {
        return (
          <NumberTicker
            value={value / 1e6}
            format="number"
            decimalPlaces={2}
            delay={delay}
            className="font-mono"
          />
        );
      }
      return (
        <NumberTicker
          value={value}
          format="number"
          decimalPlaces={2}
          delay={delay}
          className="font-mono"
        />
      );
    }
    return value;
  };

  // Get unit suffix for large numbers
  const getValueSuffix = (value: any) => {
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1e9) return 'B';
      if (Math.abs(value) >= 1e6) return 'M';
    }
    return '';
  };

  // Convert snake_case to Title Case
  const formatLabel = (key: string) => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const headerTitle = title
    ? `${ticker} (${title} • ${formatPeriod(data[0].period)})`
    : `${ticker} (${formatPeriod(data[0].period)})`;

  return (
    <div className="w-full border rounded-lg">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="financials-table" className="border-none">
          <AccordionTrigger className="w-full px-4 py-3 hover:no-underline hover:bg-muted rounded-t-lg">
            <span className="flex flex-row items-center gap-2">
              <RiCheckboxCircleFill size={14} color={Green} />
              <span className="text-sm">Retrieved data:</span>{' '}
              <span className="text-sm font-medium">{headerTitle}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="bg-muted">
                  <TableHead className="w-[300px] min-w-[300px] border-r whitespace-nowrap bg-muted left-0">
                    Line Items
                  </TableHead>
                  {data.map((period, index) => (
                    <TableHead
                      key={period.report_period}
                      className={cx(
                        'text-right font-bold whitespace-nowrap min-w-[120px] hover:bg-muted',
                        { 'border-r': index !== data.length - 1 },
                      )}
                    >
                      {format(new Date(period.report_period), 'MMM d, yyyy')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, itemIndex) => (
                  <TableRow key={item}>
                    <TableCell className="font-medium border-r w-[300px] min-w-[300px]">
                      {formatLabel(item)}
                    </TableCell>
                    {data.map((period, index) => (
                      <TableCell
                        key={period.report_period}
                        className={cx('text-right', {
                          'border-r': index !== data.length - 1,
                        })}
                      >
                        <span className="inline-flex items-center gap-1">
                          {formatValue(
                            period[item],
                            itemIndex * 0.1 + index * 0.05,
                          )}
                          <span className="text-xs text-muted-foreground">
                            {getValueSuffix(period[item])}
                          </span>
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
