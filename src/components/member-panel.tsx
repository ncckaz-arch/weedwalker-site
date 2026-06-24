'use client';

import { FormEvent, useEffect, useState } from 'react';
import { GoogleSignIn } from '@/components/google-sign-in';

type UserState = {
  email: string;
  name?: string | null;
  memberProfile?: {
    displayName?: string | null;
    phone?: string | null;
    lineUserId?: string | null;
    preferredLanguage?: string;
    profileStatus?: string;
  } | null;
  pdfDocuments?: Array<{ id: string; title: string; documentType: string; createdAt: string }>;
};

export function MemberPanel() {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Saving profile...');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch('/api/member/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || 'Save failed.');
      return;
    }
    setUser((current) => current ? { ...current, memberProfile: body.profile } : current);
    setMessage('Profile saved.');
  }

  if (loading) return <div className="walker-card p-6">Loading member session...</div>;

  if (!user) {
    return (
      <div className="walker-card grid gap-5 p-6">
        <p className="text-xl font-black">Member Google verify</p>
        <p className="walker-muted">Login ด้วย Google เพื่อสร้าง/ดู member profile และเอกสาร PDF ของคุณ</p>
        <GoogleSignIn />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={saveProfile} className="walker-card grid gap-4 p-6">
        <div>
          <p className="text-sm font-black text-walkerYellow">Google Account</p>
          <p className="text-lg font-black">{user.email}</p>
        </div>
        <label className="walker-label">
          Display name
          <input className="walker-input" name="displayName" required defaultValue={user.memberProfile?.displayName || user.name || ''} />
        </label>
        <label className="walker-label">
          Phone
          <input className="walker-input" name="phone" defaultValue={user.memberProfile?.phone || ''} />
        </label>
        <label className="walker-label">
          Line ID
          <input className="walker-input" name="lineUserId" defaultValue={user.memberProfile?.lineUserId || ''} />
        </label>
        <label className="walker-label">
          Language
          <select className="walker-input" name="preferredLanguage" defaultValue={user.memberProfile?.preferredLanguage || 'th'}>
            <option value="th">Thai</option>
            <option value="en">English</option>
          </select>
        </label>
        <button className="walker-btn walker-btn-primary" type="submit">Save Member Profile</button>
        {message ? <p className="font-bold text-walkerYellow">{message}</p> : null}
      </form>

      <section className="walker-card p-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-walkerYellow">PDF document access</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Member Documents</h2>
        <div className="mt-5 grid gap-3">
          {user.pdfDocuments?.length ? (
            user.pdfDocuments.map((doc) => (
              <article key={doc.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <h3 className="font-black">{doc.title}</h3>
                <p className="walker-muted text-sm">{doc.documentType}</p>
              </article>
            ))
          ) : (
            <p className="walker-muted">ยังไม่มี PDF document ในบัญชีนี้</p>
          )}
        </div>
      </section>
    </div>
  );
}
