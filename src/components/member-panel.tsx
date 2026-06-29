'use client';

import { FormEvent, type ReactNode, useEffect, useState } from 'react';
import { GoogleSignIn } from '@/components/google-sign-in';

type DocumentState = 'available' | 'processing' | 'not_available';

type ApplicationStatus = {
  linked: boolean;
  user?: {
    email: string;
    name?: string | null;
  } | null;
  member?: {
    memberId: string;
    name: string;
    phone: string;
    email: string;
    verified: boolean;
  } | null;
  registration?: {
    submitted: boolean;
    underReview: boolean;
    approved: boolean;
    rejected: boolean;
    label: string;
  } | null;
  telemed?: {
    pending: boolean;
    approved: boolean;
    completed: boolean;
    label: string;
  } | null;
  appointment?: {
    meetingDateTime: string | null;
    joinUrl: string | null;
  } | null;
  documents?: {
    pt33: StatusDocument;
    prescription: StatusDocument;
  } | null;
};

type StatusDocument = {
  label: string;
  state: DocumentState;
  url: string | null;
};

export function MemberPanel() {
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadStatus() {
    setLoading(true);
    const response = await fetch('/api/application-status', { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    setStatus(body);
    setLoading(false);
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function linkApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Verifying application ownership...');
    setError('');

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch('/api/application-status/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage('');
      setError(body.error || 'Unable to link application.');
      return;
    }

    setMessage('เชื่อมต่อสำเร็จ กำลังเข้าสู่หน้า Application Status...');
    await loadStatus();
  }

  if (loading) return <div className="walker-card p-6">Loading application status...</div>;

  if (!status?.user) {
    return (
      <section className="walker-card grid gap-5 p-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-walkerYellow">Application Status</p>
        <h2 className="text-4xl font-black uppercase tracking-[-0.06em]">Continue with Google</h2>
        <p className="max-w-xl text-sm leading-7 text-walkerMuted">
          เข้าสู่ระบบด้วย Google ก่อนเพื่อตรวจสอบสถานะการสมัคร เอกสาร และการนัดหมายของคุณ
        </p>
        <GoogleSignIn onVerified={loadStatus} />
        <p className="text-xs font-bold text-walkerMuted">ปลอดภัยด้วย Google OAuth</p>
      </section>
    );
  }

  if (!status.linked) {
    return (
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={linkApplication} className="walker-card grid gap-4 p-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-walkerYellow">Link Your Application</p>
          <h2 className="text-3xl font-black tracking-[-0.04em]">เชื่อมต่อใบสมัครครั้งแรก</h2>
          <p className="text-sm leading-7 text-walkerMuted">
            กรอกข้อมูลเพื่อยืนยันว่าใบสมัครนี้เป็นของคุณ หลังเชื่อมต่อแล้ว ครั้งต่อไปใช้ Google Login ได้ทันที
          </p>

          <label className="walker-label">
            Member ID
            <input className="walker-input" name="memberId" required placeholder="เช่น cmxxxx หรือ WW-xxxx" />
          </label>

          <label className="walker-label">
            Phone Number
            <input className="walker-input" name="phone" required placeholder="เบอร์โทรที่ใช้สมัคร" />
          </label>

          <button className="walker-btn walker-btn-primary" type="submit">
            ยืนยันและเชื่อมต่อ
          </button>
          {message ? <p className="font-bold text-walkerYellow">{message}</p> : null}
          {error ? <p className="font-bold text-red-300">{error}</p> : null}
        </form>

        <section className="walker-card p-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-walkerYellow">Google Verified</p>
          <h3 className="mt-2 text-2xl font-black">{status.user.email}</h3>
          <p className="mt-3 text-sm leading-7 text-walkerMuted">
            บัญชี Google นี้ยังไม่ได้เชื่อมกับใบสมัคร กรุณายืนยัน Member ID และเบอร์โทรก่อนเข้าดูสถานะ
          </p>
        </section>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="walker-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-walkerYellow">Application Status</p>
          <h2 className="mt-2 text-4xl font-black uppercase tracking-[-0.06em]">ตรวจสอบสถานะ</h2>
        </div>
        <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300">
          ยืนยันตัวตนแล้ว
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="walker-card grid gap-4 p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">Member Information</p>
          <Info label="Member ID" value={status.member?.memberId} />
          <Info label="Name" value={status.member?.name} />
          <Info label="Phone Number" value={status.member?.phone} />
          <Info label="Email" value={status.member?.email} />
        </aside>

        <div className="grid gap-6">
          <StatusCard title="Registration Status">
            <StatusStep active={Boolean(status.registration?.submitted)} label="Registration Submitted" />
            <StatusStep active={Boolean(status.registration?.underReview)} label="Under Review" />
            <StatusStep active={Boolean(status.registration?.approved)} rejected={Boolean(status.registration?.rejected)} label="Approved / Rejected" />
          </StatusCard>

          <StatusCard title="Telemed Status">
            <StatusStep active={Boolean(status.telemed?.pending)} label="Pending" />
            <StatusStep active={Boolean(status.telemed?.approved)} label="Approved" />
            <StatusStep active={Boolean(status.telemed?.completed)} label="Completed" />
          </StatusCard>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusCard title="Appointment">
          <Info label="Meeting Date & Time" value={status.appointment?.meetingDateTime || 'Not Available Yet'} />
          {status.appointment?.joinUrl ? (
            <a className="walker-btn walker-btn-primary mt-2" href={status.appointment.joinUrl}>
              Join Consultation
            </a>
          ) : (
            <button className="walker-btn walker-btn-outline mt-2 cursor-not-allowed opacity-50" type="button" disabled>
              Join Consultation
            </button>
          )}
        </StatusCard>

        <StatusCard title="Documents">
          <DocumentButton document={status.documents?.pt33} fallbackLabel="Download PT33" />
          <DocumentButton document={status.documents?.prescription} fallbackLabel="Download Prescription" />
        </StatusCard>
      </div>
    </section>
  );
}

function StatusCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="walker-card grid gap-4 p-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-walkerYellow">{title}</p>
      {children}
    </section>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-walkerMuted">{label}</p>
      <p className="mt-1 font-black">{value || '-'}</p>
    </div>
  );
}

function StatusStep({ active, rejected, label }: { active: boolean; rejected?: boolean; label: string }) {
  const color = rejected ? 'text-red-300 bg-red-400/10 border-red-400/30' : active ? 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30' : 'text-walkerMuted bg-white/[0.03] border-white/10';
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-4 ${color}`}>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-black/30 text-sm font-black">
        {active ? '✓' : '•'}
      </span>
      <span className="font-black">{label}</span>
    </div>
  );
}

function DocumentButton({ document, fallbackLabel }: { document?: StatusDocument; fallbackLabel: string }) {
  const label = document?.label || fallbackLabel;

  if (document?.state === 'available' && document.url) {
    return (
      <a className="walker-btn walker-btn-primary justify-center" href={document.url}>
        {label}
      </a>
    );
  }

  return (
    <button className="walker-btn walker-btn-outline cursor-not-allowed justify-center opacity-50" type="button" disabled>
      {document?.state === 'processing' ? 'Generating...' : 'Not Available Yet'}
    </button>
  );
}
