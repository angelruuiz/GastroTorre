import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, event_type, dish_id } = body;

    if (!restaurant_id || !event_type) {
      return NextResponse.json(
        { success: false, error: 'restaurant_id y event_type son requeridos' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('analytics_events').insert({
        restaurant_id,
        event_type,
        dish_id: dish_id || null,
        user_agent: request.headers.get('user-agent') || 'Unknown',
      });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
