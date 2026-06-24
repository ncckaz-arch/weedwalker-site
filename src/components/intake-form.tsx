'use client';

import { FormEvent, useEffect, useState } from 'react';

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  memberProfile?: { displayName?: string | null; phone?: string | null; lineUserId?: string | null } | null;
};

export function IntakeForm() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const uploadsEnabled = process.env.NEXT_PUBLIC_ENABLE_FILE_UPLOADS === 'true';

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .finally(() => setLoadingUser(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('Submitting intake...');
    setError('');

    const formData = new FormData(event.currentTarget);
    const response = await fetch('/api/intake', {
      method: 'POST',
      body: formData
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus('');
      setError(body.error || 'Submit failed.');
      return;
    }

    setStatus(`Intake submitted. Reference: ${body.intakeId}`);
    event.currentTarget.reset();
  }

  if (loadingUser) {
    return <div className="walker-card p-6">Loading intake form...</div>;
  }

  return (
    <form onSubmit={submit} className="walker-card grid gap-6 p-5 md:p-8">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-sm font-black text-walkerYellow">Intake Portal</p>
        <p className="mt-1 text-lg font-black">Google Login is not required for first-time intake.</p>
        <p className="walker-muted mt-1 text-sm">
          {user ? `Optional Google session detected: ${user.email}` : 'Member login will be used later for returning access, PDF documents and status tracking.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="walker-label">
          Full name
          <input className="walker-input" name="fullName" required defaultValue={user?.memberProfile?.displayName || user?.name || ''} />
        </label>
        <label className="walker-label">
          Email
          <input className="walker-input" name="email" type="email" required defaultValue={user?.email || ''} />
        </label>
        <label className="walker-label">
          Phone
          <input className="walker-input" name="phone" required defaultValue={user?.memberProfile?.phone || ''} />
        </label>
        <label className="walker-label">
          Line ID
          <input className="walker-input" name="lineId" defaultValue={user?.memberProfile?.lineUserId || ''} />
        </label>
        <label className="walker-label">
          Date of birth
          <input className="walker-input" name="dateOfBirth" type="date" />
        </label>
        <label className="walker-label">
          Last 4 digits of ID card
          <input className="walker-input" name="nationalIdLast4" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" />
        </label>
      </div>

      <div className="grid gap-4">
        <label className="walker-label">
          Current symptoms / reason for intake
          <textarea className="walker-input min-h-28" name="currentSymptoms" />
        </label>
        <label className="walker-label">
          Intended use / desired experience
          <textarea className="walker-input min-h-28" name="intendedUse" />
        </label>
        <label className="walker-label">
          Allergies
          <textarea className="walker-input min-h-24" name="allergies" />
        </label>
        <label className="walker-label">
          Current medication
          <textarea className="walker-input min-h-24" name="medications" />
        </label>
        <label className="walker-label">
          Prior cannabis experience
          <textarea className="walker-input min-h-24" name="priorCannabisExperience" />
        </label>
      </div>

      {uploadsEnabled ? (
        <div className="grid gap-4 rounded-3xl border border-walkerYellow/20 bg-walkerYellow/5 p-5">
          <h2 className="text-2xl font-black tracking-tight">Document upload</h2>
          <label className="walker-label">
            ID card image
            <input className="walker-input" name="idCard" type="file" accept="image/png,image/jpeg,image/webp" required />
          </label>
          <label className="walker-label">
            Selfie image
            <input className="walker-input" name="selfie" type="file" accept="image/png,image/jpeg,image/webp" required />
          </label>
          <label className="walker-label">
            Medical documents
            <input className="walker-input" name="medicalDocuments" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple />
          </label>
        </div>
      ) : (
        <div className="rounded-3xl border border-walkerYellow/20 bg-walkerYellow/5 p-5">
          <h2 className="text-2xl font-black tracking-tight">Document upload</h2>
          <p className="mt-2 text-sm leading-6 text-walkerMuted">
            First launch intake is text-only. ID card, selfie, and medical document upload will be enabled after production storage is configured.
          </p>
        </div>
      )}

      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <label className="flex gap-3 text-sm font-bold text-[#ddd5bd]">
          <input name="requestTelemed" type="checkbox" />
          Request telemed review flow
        </label>
        <label className="walker-label">
          Preferred telemed date
          <input className="walker-input" name="preferredTelemedDate" type="date" />
        </label>
        <label className="walker-label">
          Telemed note
          <textarea className="walker-input min-h-24" name="telemedNote" />
        </label>
      </div>

      <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <label className="flex gap-3 text-sm font-bold">
          <input name="pdpaConsent" type="checkbox" required />
          I consent to PDPA data handling for this intake.
        </label>
        <label className="flex gap-3 text-sm font-bold">
          <input name="medicalIntakeConsent" type="checkbox" required />
          I confirm the intake information is accurate.
        </label>
        <label className="flex gap-3 text-sm font-bold">
          <input name="documentStorageConsent" type="checkbox" required />
          I consent to secure storage of uploaded documents and generated PDFs.
        </label>
      </div>

      <button className="walker-btn walker-btn-primary w-full md:w-auto" type="submit">
        Submit Intake
      </button>

      {status ? <p className="font-bold text-walkerYellow">{status}</p> : null}
      {error ? <p className="font-bold text-red-300">{error}</p> : null}
    </form>
  );
}
