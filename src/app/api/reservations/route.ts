import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase/client';
import { INITIAL_RESERVATIONS } from '../../../lib/database/dbService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurant_id = searchParams.get('restaurant_id');

  if (isSupabaseConfigured() && supabase && restaurant_id) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('restaurant_id', restaurant_id)
        .order('reservation_date', { ascending: true });

      if (!error && data) {
        return NextResponse.json({ success: true, source: 'supabase', data });
      }
    } catch (e: any) {
      console.warn('Supabase reservations error:', e.message);
    }
  }

  return NextResponse.json({
    success: true,
    source: 'local_database',
    data: restaurant_id
      ? INITIAL_RESERVATIONS.filter((r) => r.restaurantId === restaurant_id)
      : INITIAL_RESERVATIONS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, customer_name, customer_phone, customer_email, reservation_date, reservation_time, party_size, special_notes } = body;

    if (!customer_name || !customer_phone || !reservation_date || !reservation_time) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios para la reserva' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          restaurant_id,
          customer_name,
          customer_phone,
          customer_email,
          reservation_date,
          reservation_time,
          party_size: Number(party_size) || 2,
          status: 'pending',
          special_notes,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, source: 'supabase', data });
    }

    const mockRes = {
      id: `res-${Date.now()}`,
      restaurant_id,
      customer_name,
      customer_phone,
      customer_email,
      reservation_date,
      reservation_time,
      party_size: Number(party_size) || 2,
      status: 'pending',
      special_notes,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      source: 'local_database',
      message: 'Reserva registrada con éxito',
      data: mockRes,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID y nuevo estado requeridos' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
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
      message: `Reserva ${id} actualizada a ${status}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
