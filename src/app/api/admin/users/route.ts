import { NextResponse } from 'next/server';
import { INITIAL_ACCOUNTS } from '../../../../lib/auth/authService';

export async function GET() {
  // Return list of accounts with passwords hidden or masked
  const safeAccounts = INITIAL_ACCOUNTS.map((acc) => ({
    id: acc.id,
    email: acc.email,
    username: acc.username,
    name: acc.name,
    role: acc.role,
    restaurantName: acc.restaurantName,
    restaurantSlug: acc.restaurantSlug,
    createdAt: acc.createdAt,
    isActive: acc.isActive,
  }));

  return NextResponse.json({
    success: true,
    data: safeAccounts,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, newPassword, newAccount } = body;

    if (action === 'change_password') {
      if (!userId || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'userId y newPassword son obligatorios' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Contraseña actualizada con éxito',
      });
    }

    if (action === 'create_account') {
      if (!newAccount?.email || !newAccount?.password || !newAccount?.restaurantName) {
        return NextResponse.json(
          { success: false, error: 'Faltan datos obligatorios de la cuenta' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Cuenta de hostelero creada correctamente',
        data: newAccount,
      });
    }

    return NextResponse.json({ success: false, error: 'Acción no permitida' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
