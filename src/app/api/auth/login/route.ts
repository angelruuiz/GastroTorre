import { NextResponse } from 'next/server';
import { INITIAL_ACCOUNTS } from '../../../../lib/auth/authService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Usuario/email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = INITIAL_ACCOUNTS.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId) &&
        u.passwordHash === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas. Por favor, verifica tus datos.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Esta cuenta ha sido suspendida.' },
        { status: 403 }
      );
    }

    // Return sanitized user object
    const { passwordHash: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: user.role === 'superadmin' ? 'Bienvenido Ángel (Superadmin)' : `Bienvenido ${user.name}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
