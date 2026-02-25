
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
        return NextResponse.json(
            { message: 'Credenciales inválidas' },
            { status: 401 }
        );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    if (!user.status) {
        return NextResponse.json(
            { message: 'Usuario inactivo. Contacte al administrador.' },
            { status: 403 }
        );
    }

    await createSession(user.id, user.email, user.role, user.fullName);

    return NextResponse.json({ 
      message: 'Inicio de sesión exitoso', 
      user: { id: user.id, name: user.fullName, role: user.role } }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
