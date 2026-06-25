const DEFAULT_APPS_SCRIPT_INTAKE_URL =
  'https://script.google.com/macros/s/AKfycbxnNoOPUHL5Wtn98x4N2baPjVCQznJ7ioYtZNtoksiU7MHVv-VKgc0U4y69Jdvh1cuK/exec';

export const dynamic = 'force-dynamic';

export async function GET() {
  const intakeUrl = process.env.APPS_SCRIPT_INTAKE_URL || DEFAULT_APPS_SCRIPT_INTAKE_URL;

  const upstreamResponse = await fetch(intakeUrl, {
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'th,en-US;q=0.9,en;q=0.8',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    },
  });

  if (!upstreamResponse.ok) {
    return new Response(
      `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>WEED WALKER Intake</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #050505; color: #f6f0ce; font-family: system-ui, sans-serif; padding: 24px; }
    main { max-width: 720px; border: 1px solid rgba(245, 197, 24, .3); border-radius: 28px; padding: 28px; background: #0b0b0b; }
    h1 { margin: 0 0 12px; color: #f5c518; text-transform: uppercase; letter-spacing: -.04em; }
    p { line-height: 1.7; color: #d9d3bd; }
    a { color: #f5c518; font-weight: 800; }
  </style>
</head>
<body>
  <main>
    <h1>WEED WALKER Intake</h1>
    <p>ตอนนี้ระบบ Intake เดิมจาก Apps Script ยังไม่ตอบกลับสำเร็จ กรุณาลองใหม่อีกครั้ง หรือเปิดลิงก์ Intake โดยตรงชั่วคราว</p>
    <p><a href="${intakeUrl}">Open Intake Directly</a></p>
  </main>
</body>
</html>`,
      {
        status: 502,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-store',
        },
      },
    );
  }

  const html = await upstreamResponse.text();

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-weedwalker-intake-source': 'apps-script',
    },
  });
}
