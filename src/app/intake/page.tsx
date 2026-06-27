const intakeUrl =
  process.env.APPS_SCRIPT_INTAKE_URL ||
  'https://script.google.com/macros/s/AKfycbxnNoOPUHL5Wtn98x4N2baPjVCQznJ7ioYtZNtoksiU7MHVv-VKgc0U4y69Jdvh1cuK/exec';

export const metadata = {
  title: 'Intake Portal | WEED WALKER',
  description: 'WEED WALKER Intake Portal.',
};

export default function IntakePage() {
  return (
    <main className="min-h-screen bg-black">
      <iframe
        title="WEED WALKER Intake"
        src={intakeUrl}
        className="block h-screen min-h-[760px] w-full border-0 bg-white"
        loading="eager"
        referrerPolicy="origin"
        allow="camera; clipboard-read; clipboard-write; fullscreen"
      />
    </main>
  );
}
