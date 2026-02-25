import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, documentNumber } = await request.json();

    if (!fullName || !email || !password || !documentNumber) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { documentNumber }
            ]
        }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El usuario con este correo o documento ya existe' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        documentNumber,
        role: 'OPERADOR',
      },
    });

    // Remove password from response
    // @ts-expect-error - Excluding password field for response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ message: 'Usuario registrado exitosamente', user: userWithoutPassword }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
