import { NextResponse } from 'next/server';
import { DEMO_HOSTELEROS } from '../../../lib/database/dbService';

export async function GET() {
  return NextResponse.json({
    success: true,
    demo_accounts: DEMO_HOSTELEROS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, restaurant_id } = body;

    if (action === 'demo_login') {
      const user = DEMO_HOSTELEROS.find((u) => u.restaurantId === restaurant_id) || DEMO_HOSTELEROS[0];
      return NextResponse.json({
        success: true,
        user,
        message: `Sesión iniciada como ${user.name}`,
      });
    }

    if (action === 'email_login') {
      const existing = DEMO_HOSTELEROS.find((u) => u.email.toLowerCase() === email?.toLowerCase());
      const user = existing || {
        id: `usr-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'owner',
        restaurantId: '1',
        restaurantSlug: 'asador-los-jarales',
      };

      return NextResponse.json({
        success: true,
        user,
        message: 'Sesión iniciada con éxito',
      });
    }

    return NextResponse.json({ success: false, error: 'Acción no reconocida' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
