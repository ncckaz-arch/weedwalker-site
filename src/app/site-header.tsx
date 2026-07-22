'use client';

import { usePathname } from 'next/navigation';

export default function SiteHeader() {
  const pathname = usePathname();

  if (
    pathname === '/' ||
    pathname === '/intake' ||
    pathname.startsWith('/intake/') ||
    pathname === '/menu' ||
    pathname === '/privacy-policy' ||
    pathname === '/terms-of-use'
  ) {
    return null;
  }

  return (
    <header className="site-header walker-shell flex items-center justify-between py-5">
      <a href="/" className="flex items-center gap-3">
        <span className="site-brand-logo grid h-11 w-11 place-items-center rounded-2xl bg-walkerYellow font-black text-walkerBlack">
          WW
        </span>
        <span>
          <strong className="site-brand-title block tracking-tight">WEED WALKER</strong>
          <small className="site-brand-subtitle walker-muted">Experience Platform</small>
        </span>
      </a>
      <nav className="site-nav hidden items-center gap-5 text-sm font-bold text-walkerMuted md:flex">
        <a href="/intake">Intake</a>
        <a href="/access">Access Level</a>
        <a href="/menu">Menu</a>
      </nav>
    </header>
  );
}
