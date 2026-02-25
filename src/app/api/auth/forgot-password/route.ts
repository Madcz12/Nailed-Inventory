import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'El correo es obligatorio' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal if user exists or not, 
      // but in this specific administrative app it might be better to be clear
      return NextResponse.json({ message: 'Si el correo existe, se enviará un enlace de recuperación' }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${token}`;

    // Log the link for the developer/user since there's no email service
    console.log('---------------------------------------------------------');
    console.log(`PASSWORD RESET REQUEST FOR: ${email}`);
    console.log(`URL: ${resetUrl}`);
    console.log('---------------------------------------------------------');

    return NextResponse.json({ message: 'Enlace de recuperación generado' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
