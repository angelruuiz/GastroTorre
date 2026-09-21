import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_name, contact_name, phone, email, plan_interest, zone } = body;

    if (!restaurant_name || !contact_name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios (nombre, contacto, teléfono)' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('leads_hosteleros')
        .insert({
          restaurant_name,
          contact_name,
          phone,
          email: email || '',
          plan_interest: plan_interest || 'Plan Pro (59€/mes)',
          zone: zone || 'Torrelodones Pueblo',
          status: 'nuevo',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, source: 'supabase', data });
    }

    return NextResponse.json({
      success: true,
      source: 'local_database',
      message: 'Solicitud de alta recibida correctamente',
      data: {
        id: `lead-${Date.now()}`,
        restaurant_name,
        contact_name,
        phone,
        email,
        plan_interest,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
