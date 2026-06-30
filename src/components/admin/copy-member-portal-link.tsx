'use client';

import { useState } from 'react';

type CopyMemberPortalLinkProps = {
  href: string;
};

export function CopyMemberPortalLink({ href }: CopyMemberPortalLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = new URL(href, window.location.origin).toString();

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="min-h-11 rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 text-left text-sm font-black text-sky-200 transition hover:border-sky-300/45 hover:bg-sky-300/15"
    >
      {copied ? 'คัดลอกแล้ว' : 'Copy Member Portal Link'}
    </button>
  );
}
