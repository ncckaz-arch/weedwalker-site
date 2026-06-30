'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            ux_mode: 'redirect';
            login_uri: string;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
    };
  }
}

export function GoogleSignIn({ onVerified: _onVerified, returnTo }: { onVerified?: () => void; returnTo?: string }) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN !== 'true') {
      setError('Google Login is disabled for first launch.');
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError('NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing.');
      return;
    }

    const setup = () => {
      if (!window.google || !buttonRef.current) return;
      const nextPath = returnTo || `${window.location.pathname}${window.location.search}`;
      const loginUri = new URL('/api/auth/google/callback', window.location.origin);
      loginUri.searchParams.set('returnTo', nextPath);

      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: 'redirect',
        login_uri: loginUri.toString()
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 320
      });
    };

    if (window.google) {
      setup();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = setup;
    document.head.appendChild(script);
  }, [returnTo]);

  return (
    <div className="grid gap-3">
      <div ref={buttonRef} />
      {error ? <p className="text-sm font-bold text-red-300">{error}</p> : null}
    </div>
  );
}
