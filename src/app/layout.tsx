import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WEED WALKER Experience Platform',
  description: 'WEED WALKER customer-facing experience platform for intake, access levels, and flight menu.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://weedwalker.net')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <header className="walker-shell flex items-center justify-between py-5">
          <a href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-walkerYellow font-black text-walkerBlack">WW</span>
            <span>
              <strong className="block tracking-tight">WEED WALKER</strong>
              <small className="walker-muted">Experience Platform</small>
            </span>
          </a>
          <nav className="hidden items-center gap-5 text-sm font-bold text-walkerMuted md:flex">
            <a href="/intake">Intake</a>
            <a href="/access">Access Level</a>
            <a href="/menu">Menu</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
