import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://inkrupt.xyz'),
  title: {
    default: 'Inkrupt - Book Reviews',
    template: '%s | Inkrupt',
  },
  description: 'Thoughtful book reviews and literary insights',
  keywords: ['book reviews', 'literature', 'reading', 'books', 'literary criticism', 'book recommendations'],
  authors: [{ name: 'Inkrupt' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'Inkrupt - Book Reviews',
    locale: 'en',
    title: 'Inkrupt - Book Reviews',
    description: 'Thoughtful book reviews and literary insights',
    images: [
      {
        url: '/favicon.svg',
        width: 1200,
        height: 630,
        alt: 'Inkrupt - Book Reviews',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@inkrupt',
    title: 'Inkrupt - Book Reviews',
    description: 'Thoughtful book reviews and literary insights',
    images: ['/favicon.svg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
