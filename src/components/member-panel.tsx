'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { GoogleSignIn } from '@/components/google-sign-in';

type DocumentState = {
  label: string;
  state: 'available' | 'processing' | 'not_available';
  url: string | null;
};

type StatusPayload = {
  linked: boolean;
  user: { email?: string; name?: string } | null;
  member?: {
    memberId: string;
    name: string;
    phone: string;
    email: string;
    verified: boolean;
  };
  registration?: {
    label: string;
    submitted: boolean;
    underReview: boolean;
    approved: boolean;
    rejected: boolean;
  };
  telemed?: {
    label: string;
    pending: boolean;
    approved: boolean;
    completed: boolean;
  };
  appointment?: {
    meetingDateTime: string | null;
    joinUrl: string | null;
  };
  documents?: {
    pt33: DocumentState;
    prescription: DocumentState;
  };
};

export function MemberPanel() {
  const searchParams = useSearchParams();
  const authError = searchParams.get('auth');
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [message, setMessage] = useState('');

  async function loadStatus() {
    setLoading(true);
    setMessage('');
    const response = await fetch('/api/application-status', { cache: 'no-store' });
    const body = (await response.json().catch(() => null)) as StatusPayload | null;
    setStatus(body);
    setLoading(false);
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function linkApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLinking(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/application-status/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: String(formData.get('memberId') || '').trim(),
        phone: String(formData.get('phone') || '').trim()
      })
    });

    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setMessage(body.error || 'Unable to link application.');
      setLinking(false);
      return;
    }

    setMessage('เชื่อมต่อใบสมัครสำเร็จ กำลังโหลดสถานะของคุณ...');
    await loadStatus();
    setLinking(false);
  }

  if (loading) {
    return (
      <section className="walker-card p-6 md:p-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-walkerYellow">Loading Application Status...</p>
      </section>
    );
  }

  if (!status?.user) {
    return (
      <section className="walker-card grid gap-6 p-6 md:p-8">
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-walkerYellow">Google Verification</p>
          <h2 className="text-3xl font-black uppercase tracking-[-0.04em]">Continue with Google</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-walkerMuted">
            เข้าสู่ระบบด้วย Google ก่อนตรวจสอบสถานะใบสมัคร เอกสาร และการประสานงานกับคลินิกพาร์ทเนอร์
          </p>
        </div>
        {authError ? (
          <p className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm font-bold text-red-200">
            Google verification failed: {authError}
          </p>
        ) : null}
        <GoogleSignIn />
      </section>
    );
  }

  if (!status.linked) {
    return (
      <section className="walker-card grid gap-6 p-6 md:p-8">
        <div>
          <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-walkerYellow">Link Your Application</p>
          <h2 className="text-3xl font-black uppercase tracking-[-0.04em]">ยืนยันใบสมัครครั้งแรก</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-walkerMuted">
            บัญชี Google นี้ยังไม่ได้ผูกกับใบสมัคร กรอก Member ID และเบอร์โทรที่ใช้สมัครเพื่อยืนยันความเป็นเจ้าของ
          </p>
        </div>

        <form onSubmit={linkApplication} className="grid max-w-xl gap-4">
          <label className="walker-label">
            Member ID
            <input className="walker-input" name="memberId" required placeholder="เช่น WW-7K3F-92QX" />
          </label>
          <label className="walker-label">
            Phone Number
            <input className="walker-input" name="phone" required placeholder="เบอร์โทรที่ใช้สมัคร" />
          </label>
          {message ? <p className="text-sm font-bold text-walkerYellow">{message}</p> : null}
          <button className="walker-btn walker-btn-primary w-full md:w-auto" type="submit" disabled={linking}>
            {linking ? 'กำลังเชื่อมต่อ...' : 'ยืนยันและเชื่อมต่อ'}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="grid gap-5">
      <div className="walker-card p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-walkerYellow">Verified Member</p>
            <h2 className="text-3xl font-black uppercase tracking-[-0.04em]">{status.member?.name || 'Application Status'}</h2>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-emerald-300">
            Google Verified
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <StatusInfo label="Member ID" value={status.member?.memberId} />
          <StatusInfo label="Email" value={status.member?.email || status.user?.email} />
          <StatusInfo label="Phone" value={status.member?.phone} />
          <StatusInfo label="Verified Status" value={status.member?.verified ? 'Verified' : 'Pending'} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <StatusCard title="Registration Status" value={status.registration?.label || 'Registration Submitted'} />
        <StatusCard title="Partner Clinic Status" value={status.telemed?.label || 'Pending'} />
        <StatusCard
          title="Appointment"
          value={status.appointment?.meetingDateTime || 'ยังไม่มีวันนัดหมาย'}
          action={
            status.appointment?.joinUrl ? (
              <a className="walker-btn walker-btn-outline mt-4" href={status.appointment.joinUrl}>
                Join Consultation
              </a>
            ) : null
          }
        />
        <section className="walker-card p-6">
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-walkerYellow">Documents</h3>
          <div className="mt-5 grid gap-3">
            {status.documents?.pt33 ? <DocumentButton document={status.documents.pt33} /> : null}
            {status.documents?.prescription ? <DocumentButton document={status.documents.prescription} /> : null}
          </div>
        </section>
      </div>
    </section>
  );
}

function StatusInfo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-walkerMuted">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-[#f8f3dc]">{value || '-'}</p>
    </div>
  );
}

function StatusCard({ title, value, action }: { title: string; value: string; action?: ReactNode }) {
  return (
    <section className="walker-card p-6">
      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-walkerYellow">{title}</h3>
      <p className="mt-4 text-2xl font-black text-[#f8f3dc]">{value}</p>
      {action}
    </section>
  );
}

function DocumentButton({ document }: { document: DocumentState }) {
  if (document.state === 'available' && document.url) {
    return (
      <a className="walker-btn walker-btn-primary justify-between rounded-2xl" href={document.url}>
        {document.label} <span>↓</span>
      </a>
    );
  }

  return (
    <button className="walker-btn justify-between rounded-2xl bg-white/10 text-walkerMuted" type="button" disabled>
      {document.label}
      <span>{document.state === 'processing' ? 'Generating...' : 'Not Available Yet'}</span>
    </button>
  );
}
