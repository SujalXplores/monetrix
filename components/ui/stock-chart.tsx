import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiCheckboxCircleFill,
} from '@remixicon/react';
import { format, parseISO } from 'date-fns';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { NumberTicker } from '@/components/ui/number-ticker';
import { cn } from '@/lib/utils';

export interface Price {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  time: string;
}

export interface Snapshot {
  ticker: string;
  price: number;
  day_change: number;
  day_change_percent: number;
  market_cap: number;
  volume: number;
  time: string;
}

export interface HistoricalResult {
  ticker: string;
  prices: Price[];
}

export interface SnapshotResult {
  snapshot: Snapshot;
}

export interface StockPriceResult {
  ticker: string;
  snapshot: SnapshotResult | null;
  historical: HistoricalResult | null;
}

export interface StockChartProps {
  result: StockPriceResult;
  ticker: string;
}

export function StockChart(props: StockChartProps) {
  const hasChartData =
    props.result.historical?.prices &&
    props.result.historical.prices.length > 0;

  return (
    <Accordion type="single" collapsible={hasChartData} className="w-full">
      <AccordionItem value="stock-chart" className="border-none">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/5" />

          <AccordionTrigger
            className={cn(
              'relative w-full px-6 py-4 hover:no-underline transition-all duration-300 rounded-t-2xl group',
              hasChartData
                ? 'hover:bg-muted/20'
                : '[&>svg]:hidden cursor-default opacity-75',
            )}
            disabled={!hasChartData}
          >
            <div className="flex flex-row items-center gap-3">
              <div className="p-1.5 rounded-full bg-financial-positive/10 group-hover:bg-financial-positive/20 transition-colors">
                <RiCheckboxCircleFill
                  size={16}
                  className="text-financial-positive"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">
                  Stock Data Retrieved
                </span>
                <span className="text-xs text-muted-foreground">
                  {props.ticker} •{' '}
                  {hasChartData
                    ? 'Live pricing data'
                    : 'No chart data available'}
                </span>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="relative p-6 space-y-6 max-w-[800px]">
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,_theme(colors.foreground)_1px,_transparent_0)] bg-[size:20px_20px]" />
              </div>

              <ChartHeader
                ticker={props.ticker}
                prices={props.result.historical?.prices || []}
                snapshot={props.result.snapshot?.snapshot || null}
              />

              <div className="relative">
                <Chart
                  data={
                    props.result.historical?.prices?.map((price) => ({
                      date: formatDate(price.time),
                      value: price.close,
                    })) || []
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  };
  return date.toLocaleDateString('en-US', options);
}

type ChartProps = {
  data: ChartData[];
};

interface ChartData {
  value: number;
  date: string;
  date_label?: string;
}

function Chart({ data }: ChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
        <div className="text-center space-y-2">
          <div className="text-sm">No chart data available</div>
          <div className="text-xs opacity-60">Please check back later</div>
        </div>
      </div>
    );
  }

  const startValue = data[0].value;
  const endValue = data[data.length - 1].value;
  const isPositive = endValue > startValue;

  const strokeColor = isPositive
    ? 'hsl(var(--financial-positive))'
    : 'hsl(var(--financial-negative))';
  const fillColor = isPositive
    ? 'url(#positiveGradient)'
    : 'url(#negativeGradient)';

  return (
    <div className="relative">
      {/* Chart container with beautiful styling */}
      <div className="rounded-xl bg-gradient-to-br from-card/50 to-muted/20 p-4 border border-border/20 backdrop-blur-sm">
        <ResponsiveContainer
          width="100%"
          height={320}
          initialDimension={{ width: 600, height: 320 }}
        >
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            accessibilityLayer={true}
          >
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--financial-positive))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="50%"
                  stopColor="hsl(var(--financial-positive))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--financial-positive))"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--financial-negative))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="50%"
                  stopColor="hsl(var(--financial-negative))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--financial-negative))"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(var(--border))"
                  stopOpacity={0.1}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(var(--border))"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>

            <Area
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2.5}
              fill={fillColor}
              type="monotone"
              dot={false}
              activeDot={{
                r: 4,
                fill: strokeColor,
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
              connectNulls={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: 'hsl(var(--muted-foreground))',
                dy: 10,
              }}
              tickFormatter={(str) => {
                try {
                  const date = parseISO(str);
                  return format(date, 'MMM d');
                } catch {
                  return str;
                }
              }}
            />

            <YAxis
              width={20}
              axisLine={false}
              tickLine={false}
              tick={false}
              domain={['dataMin - 5%', 'dataMax + 5%']}
            />

            <Tooltip content={<CustomTooltip />} />

            <CartesianGrid
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
              vertical={false}
              strokeDasharray="2 2"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Floating trend indicator */}
      <div
        className={`absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border transition-all duration-300 ${
          isPositive
            ? 'bg-financial-positive/10 text-financial-positive border-financial-positive/20'
            : 'bg-financial-negative/10 text-financial-negative border-financial-negative/20'
        }`}
      >
        <div className="flex items-center gap-1">
          {isPositive ? (
            <RiArrowUpSFill size={12} />
          ) : (
            <RiArrowDownSFill size={12} />
          )}
          <span>{isPositive ? 'Trending Up' : 'Trending Down'}</span>
        </div>
      </div>
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      date: string;
    };
  }>;
  label?: string | number | undefined;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const date = payload[0].payload.date;

    return (
      <div className="animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="px-4 py-3 bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-foreground">
              $
              {value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {date}
            </div>
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-financial-positive/10 to-financial-negative/10 blur-md" />
        </div>
      </div>
    );
  }
  return null;
};

export const getDomainBuffer = (maxValue: number) => {
  if (maxValue >= 100000) {
    return 1000;
  }

  if (maxValue >= 100000) {
    return 10;
  }

  if (maxValue >= 1000) {
    return 1;
  }

  return 0.1;
};

interface ChartHeaderProps {
  ticker: string;
  prices: Price[];
  snapshot: Snapshot | null;
}

function formatLargeNumber(num: number): string {
  const trillion = 1000000000000;
  const billion = 1000000000;
  const million = 1000000;
  const thousand = 1000;

  if (num >= trillion) {
    return `${(num / trillion).toFixed(2)}T`;
  }
  if (num >= billion) {
    return `${(num / billion).toFixed(2)}B`;
  }
  if (num >= million) {
    return `${(num / million).toFixed(2)}M`;
  }
  if (num >= thousand) {
    return `${(num / thousand).toFixed(2)}k`;
  }
  return num.toString();
}

function ChartHeader({ ticker, prices, snapshot }: ChartHeaderProps) {
  // Return null only if both prices and snapshot are missing
  if ((!prices || prices.length === 0) && !snapshot) {
    return null;
  }

  // Default values in case snapshot is null
  const dayChange = snapshot?.day_change ?? 0;
  const dayChangePercent = snapshot?.day_change_percent ?? 0;
  const marketCap = snapshot?.market_cap ?? 0;

  // Get current price from either snapshot or last price in prices array
  const currentPrice =
    snapshot?.price ??
    (prices && prices.length > 0 ? prices[prices.length - 1].close : 0);

  const isPositive = dayChangePercent > 0;
  const isNegative = dayChangePercent < 0;

  return (
    <div className="space-y-4">
      {/* Header with ticker and main price */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {ticker}
            </h3>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                isPositive
                  ? 'bg-financial-positive/10 text-financial-positive border border-financial-positive/20'
                  : isNegative
                    ? 'bg-financial-negative/10 text-financial-negative border border-financial-negative/20'
                    : 'bg-muted/50 text-muted-foreground border border-border/30'
              }`}
            >
              {isPositive ? 'Bullish' : isNegative ? 'Bearish' : 'Neutral'}
            </div>
          </div>

          <div className="space-y-1">
            <NumberTicker
              value={currentPrice}
              className={`text-4xl font-bold transition-all duration-300 ${
                isPositive
                  ? 'text-financial-positive'
                  : isNegative
                    ? 'text-financial-negative'
                    : 'text-financial-neutral'
              }`}
              decimalPlaces={2}
              format="currency"
            />
          </div>
        </div>

        {/* Market cap info card */}
        <div className="text-right space-y-1">
          <div className="text-xs text-muted-foreground font-medium">
            Market Cap
          </div>
          <div className="text-sm font-semibold text-foreground">
            ${formatLargeNumber(marketCap)}
          </div>
        </div>
      </div>

      {/* Performance indicators */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-full transition-colors ${
              isPositive
                ? 'bg-financial-positive/10 text-financial-positive'
                : 'bg-financial-negative/10 text-financial-negative'
            }`}
          >
            {isPositive ? (
              <RiArrowUpSFill size={14} />
            ) : (
              <RiArrowDownSFill size={14} />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`font-semibold ${
                  isPositive
                    ? 'text-financial-positive'
                    : 'text-financial-negative'
                }`}
              >
                {dayChange > 0 ? '+' : ''}${dayChange.toFixed(2)}
              </span>
              <span
                className={`font-medium ${
                  isPositive
                    ? 'text-financial-positive'
                    : 'text-financial-negative'
                }`}
              >
                ({dayChangePercent > 0 ? '+' : ''}
                {dayChangePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              Today's Change
            </div>
          </div>
        </div>

        {/* Performance bar */}
        <div className="flex-1 max-w-24">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                isPositive ? 'bg-financial-positive' : 'bg-financial-negative'
              }`}
              style={{
                width: `${Math.min(Math.abs(dayChangePercent) * 10, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
