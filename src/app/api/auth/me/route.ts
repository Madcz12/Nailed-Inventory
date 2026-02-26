import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // You might want to fetch more details from the DB here if needed
  return NextResponse.json({
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  });
}
