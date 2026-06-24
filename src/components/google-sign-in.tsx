'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
    };
  }
}

export function GoogleSignIn({ onVerified }: { onVerified?: () => void }) {
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
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setError('');
          const result = await fetch('/api/auth/google/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
          });
          if (!result.ok) {
            const body = await result.json().catch(() => ({}));
            setError(body.error || 'Google verification failed.');
            return;
          }
          onVerified?.();
          window.location.reload();
        }
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
  }, [onVerified]);

  return (
    <div className="grid gap-3">
      <div ref={buttonRef} />
      {error ? <p className="text-sm font-bold text-red-300">{error}</p> : null}
    </div>
  );
}
