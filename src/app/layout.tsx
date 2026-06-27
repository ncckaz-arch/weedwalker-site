import './globals.css';
import type { Metadata } from 'next';
import SiteHeader from './site-header';

export const metadata: Metadata = {
  title: 'WEED WALKER Experience Platform',
  description: 'WEED WALKER customer-facing experience platform for intake, access levels, and flight menu.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://weedwalker.net')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
