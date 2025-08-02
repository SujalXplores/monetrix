import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://monetrix.ai'),
  title: {
    default: 'MONETRIX | The Financial Reality Matrix',
    template: '%s | MONETRIX',
  },
  description:
    'MONETRIX - Transform complex market data into clear insights with AI-powered financial intelligence',
  keywords: [
    'MONETRIX',
    'financial',
    'AI',
    'matrix',
    'analysis',
    'stocks',
    'market',
    'intelligence',
  ],
  authors: [{ name: 'MONETRIX' }],
  creator: 'MONETRIX',
  publisher: 'MONETRIX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://monetrix.ai',
    title: 'MONETRIX | The Financial Reality Matrix',
    description:
      'MONETRIX - Transform complex market data into clear insights with AI-powered financial intelligence',
    siteName: 'MONETRIX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MONETRIX | The Financial Reality Matrix',
    description:
      'MONETRIX - Transform complex market data into clear insights with AI-powered financial intelligence',
    creator: '@vercel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(0 0% 100%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(240deg 10% 3.92%)' },
  ],
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <body className="antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="bottom-right" />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
