import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email || '').toString().trim().toLowerCase();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 422 });
    }

    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      console.error('MAILERLITE_API_KEY is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email, status: 'active' }),
    });

    const data = await res.json().catch(() => null);

    if (res.status === 201 || res.status === 200) {
      return NextResponse.json({ success: true });
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      const message = retryAfter
        ? `Rate limit exceeded. Try again in ${retryAfter} seconds.`
        : 'Rate limit exceeded. Please try again later.';
      return NextResponse.json({ error: message }, { status: 429 });
    }

    if (res.status === 422) {
      // Validation error from MailerLite
      const message = data?.message || 'Invalid request';
      return NextResponse.json({ error: message }, { status: 422 });
    }

    if (res.status === 409) {
      // Already subscribed
      return NextResponse.json({ success: true });
    }

    // Fallback error
    const errMsg = data?.message || 'Failed to subscribe';
    return NextResponse.json({ error: errMsg }, { status: res.status || 500 });
  } catch (err: any) {
    console.error('newsletter subscribe error', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
