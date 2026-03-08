import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { trackServerEvent } from '@/lib/tracking-server';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, contact, message } = body;

  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const toEmail = process.env.RESEND_TO_EMAIL;
  if (!toEmail) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
  }

  const { error } = await getResend().emails.send({
    from: 'Halaqas Feedback <noreply@halaqas.au>',
    to: toEmail,
    subject: `Feedback${name ? ` from ${name.trim()}` : ''}`,
    text: [
      name ? `Name: ${name.trim()}` : null,
      contact ? `Contact: ${contact.trim()}` : null,
      '',
      message.trim(),
    ].filter((line) => line !== null).join('\n'),
    replyTo: contact?.trim() || undefined,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  void trackServerEvent('feedback_submission');

  return NextResponse.json({ success: true }, { status: 201 });
}
