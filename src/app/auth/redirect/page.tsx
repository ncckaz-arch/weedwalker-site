'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const RETURN_TO_STORAGE_KEY = 'ww_google_auth_return_to';

export default function AuthRedirectPage() {
  const [target, setTarget] = useState('/member');

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get('auth');
    let nextPath = '/member';

    try {
      nextPath = safeReturnPath(window.sessionStorage.getItem(RETURN_TO_STORAGE_KEY));
      window.sessionStorage.removeItem(RETURN_TO_STORAGE_KEY);
    } catch {
      nextPath = '/member';
    }

    if (authError) {
      const url = new URL(nextPath, window.location.origin);
      url.searchParams.set('auth', authError);
      nextPath = `${url.pathname}${url.search}`;
    }

    setTarget(nextPath);
    window.location.replace(nextPath);
  }, []);

  return (
    <main className="min-h-screen bg-[#050806] px-6 py-16 text-white">
      <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-walkerYellow">WEED WALKER</p>
        <h1 className="mt-4 text-3xl font-black">กำลังเข้าสู่ระบบ</h1>
        <p className="mt-3 text-sm leading-7 text-white/70">
          กำลังพาคุณกลับไปยังหน้าที่เปิดไว้ หากหน้าไม่เปลี่ยนอัตโนมัติให้กดปุ่มด้านล่าง
        </p>
        <Link className="walker-btn walker-btn-primary mt-6" href={target}>
          ไปต่อ
        </Link>
      </div>
    </main>
  );
}

function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/member';

  const [pathWithQuery] = value.split('#');
  const path = pathWithQuery.split('?')[0];
  const isAllowedPath = path === '/member' || path === '/admin' || path.startsWith('/admin/');

  return isAllowedPath ? pathWithQuery : '/member';
}
