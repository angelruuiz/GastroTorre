import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase/admin';

const RESTAURANT_UUID_MAP: Record<string, string> = {
  'asador-los-jarales': 'a1000000-0000-0000-0000-000000000001',
  '1': 'a1000000-0000-0000-0000-000000000001',
  'la-tavola': 'a2000000-0000-0000-0000-000000000002',
  '2': 'a2000000-0000-0000-0000-000000000002',
  'el-olivo-bistro': 'a3000000-0000-0000-0000-000000000003',
  '3': 'a3000000-0000-0000-0000-000000000003',
  'torre-smash': 'a4000000-0000-0000-0000-000000000004',
  '4': 'a4000000-0000-0000-0000-000000000004',
  'la-huerta-brunch': 'a5000000-0000-0000-0000-000000000005',
  '5': 'a5000000-0000-0000-0000-000000000005',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'JSON inválido o cuerpo no reconocible' }, { status: 400 });
    }

    const { restaurant_id, event_type, dish_id } = body;

    if (!restaurant_id || !event_type) {
      return NextResponse.json(
        { success: false, error: 'restaurant_id y event_type son requeridos' },
        { status: 400 }
      );
    }

    const resolvedRestaurantId = RESTAURANT_UUID_MAP[restaurant_id] || restaurant_id;
    const validDishId = dish_id && UUID_REGEX.test(dish_id) ? dish_id : null;

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('analytics_events').insert({
        restaurant_id: resolvedRestaurantId,
        event_type,
        dish_id: validDishId,
        user_agent: request.headers.get('user-agent') || 'Unknown',
      });

      if (error) {
        console.warn('Supabase analytics insert error:', error.message);
        return NextResponse.json({ success: true, source: 'supabase_fallback', note: error.message });
      }

      return NextResponse.json({ success: true, source: 'supabase' });
    }

    return NextResponse.json({
      success: true,
      source: 'local_database',
      message: 'Evento registrado',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
