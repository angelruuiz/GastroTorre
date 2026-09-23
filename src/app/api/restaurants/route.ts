import { NextResponse } from 'next/server';
import { initialRestaurants } from '../../../data/restaurants';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase/client';
import { supabaseAdmin } from '../../../lib/supabase/admin';

export async function GET() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*, menu_categories(*, dishes(*))')
        .eq('is_active', true);

      if (!error && data) {
        return NextResponse.json({ success: true, source: 'supabase', data });
      }
    } catch (e: any) {
      console.warn('Supabase fetch failed:', e.message);
    }
  }

  return NextResponse.json({
    success: true,
    source: 'local_database',
    data: initialRestaurants,
  });
}

export async function PUT(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'JSON inválido o cuerpo no reconocible' }, { status: 400 });
    }

    const { id, name, tagline, description, address, phone, whatsapp, zone } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos faltantes: id, name' },
        { status: 400 }
      );
    }

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('restaurants')
        .update({
          name,
          tagline,
          description,
          address,
          phone,
          whatsapp,
          zone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, source: 'supabase', data });
    }

    return NextResponse.json({
      success: true,
      source: 'local_database',
      message: 'Restaurante actualizado correctamente en modo local',
      data: body,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
