'use client';

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckboxCircleFill,
  RiExternalLinkLine,
  RiImageLine,
} from '@remixicon/react';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

import { Button } from './button';

interface NewsItem {
  ticker: string;
  title: string;
  author: string;
  source: string;
  date: string;
  url: string;
  image_url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface NewsProps {
  data: {
    news: NewsItem[];
  };
}

// Helper function to format dates in a more human-readable way
const formatNewsDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours =
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return format(date, 'MMM d, yyyy');
};

const NewsCard = ({ item }: { item: NewsItem }) => (
  <Link
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex-shrink-0 w-72 snap-start"
  >
    <article
      className={cn(
        'h-full rounded-xl border bg-card overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:border-border/60 hover:-translate-y-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="relative aspect-video bg-muted">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <RiImageLine className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="rounded-full bg-background/90 p-1.5 backdrop-blur-sm">
            <RiExternalLinkLine className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <time dateTime={item.date} className="font-medium">
            {formatNewsDate(item.date)}
          </time>
          <span className="truncate max-w-20">{item.source}</span>
        </div>

        <h3 className="font-semibold leading-tight line-clamp-3 group-hover:text-primary transition-colors duration-200">
          {item.title}
        </h3>

        {item.author && (
          <p className="text-xs text-muted-foreground truncate">
            By {item.author}
          </p>
        )}
      </div>
    </article>
  </Link>
);

const ScrollNavigation = ({
  onScrollLeft,
  onScrollRight,
  showNavigation,
}: {
  onScrollLeft: () => void;
  onScrollRight: () => void;
  showNavigation: boolean;
}) => {
  if (!showNavigation) return null;

  return (
    <>
      <Button
        onClick={onScrollLeft}
        size="icon"
        variant="outline"
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 z-10',
          'h-9 w-9 rounded-full bg-background/95 backdrop-blur-sm',
          'shadow-md border-border/50 hover:bg-accent',
          'transition-all duration-200',
        )}
        aria-label="Scroll left"
      >
        <RiArrowLeftSLine className="h-4 w-4" />
      </Button>

      <Button
        onClick={onScrollRight}
        size="icon"
        variant="outline"
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 z-10',
          'h-9 w-9 rounded-full bg-background/95 backdrop-blur-sm',
          'shadow-md border-border/50 hover:bg-accent',
          'transition-all duration-200',
        )}
        aria-label="Scroll right"
      >
        <RiArrowRightSLine className="h-4 w-4" />
      </Button>
    </>
  );
};

export function News({ data }: NewsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { news } = data;

  if (!news?.length) return null;

  const ticker = news[0]?.ticker || '';
  const SCROLL_AMOUNT = 288;

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  const showNavigation = news.length > 3;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="news" className="border-none">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/5" />

          <AccordionTrigger
            className={cn(
              'relative w-full px-6 py-4 hover:no-underline',
              'hover:bg-muted/20 rounded-t-2xl transition-all duration-300 group',
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-full bg-financial-positive/10 group-hover:bg-financial-positive/20 transition-colors">
                <RiCheckboxCircleFill
                  size={16}
                  className="text-financial-positive"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">
                  News Data Retrieved
                </span>
                <span className="text-xs text-muted-foreground">
                  {ticker ? `${ticker} • Live news feed` : 'Live news feed'}
                </span>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="pb-0">
            <div className="relative px-1 py-4">
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,_theme(colors.foreground)_1px,_transparent_0)] bg-[size:20px_20px]" />
              </div>

              <ScrollNavigation
                onScrollLeft={() => handleScroll('left')}
                onScrollRight={() => handleScroll('right')}
                showNavigation={showNavigation}
              />

              <div
                ref={scrollContainerRef}
                className={cn(
                  'relative flex gap-4 overflow-x-auto scrollbar-hide',
                  'px-5 snap-x snap-mandatory',
                  '[&::-webkit-scrollbar]:hidden',
                  '[-ms-overflow-style:none]',
                  '[scrollbar-width:none]',
                )}
                role="region"
                aria-label={`${ticker} news articles`}
              >
                {news.map((item, index) => (
                  <NewsCard key={`${item.url}-${index}`} item={item} />
                ))}
              </div>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
