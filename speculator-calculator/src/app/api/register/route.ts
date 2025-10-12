import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: 'EMAIL_IN_USE' }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash: hash, role: 'USER' } });
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
