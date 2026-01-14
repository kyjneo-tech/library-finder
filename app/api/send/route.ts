import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, message, subject } = await req.json();

    if (!message || !email) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Library Finder Contact <onboarding@resend.dev>',
      to: ['kyjneo@gmail.com'],
      replyTo: email,
      subject: `[문의] ${subject || '새로운 문의가 접수되었습니다'}`,
      text: `
From: ${email}
Subject: ${subject}

Message:
${message}
      `,
    });

    if (data.error) {
       return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
