import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurant_id, category_id, name, description, price, allergens, photo_url, is_featured } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Nombre y precio son obligatorios' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('dishes')
        .insert({
          restaurant_id,
          category_id,
          name,
          description: description || '',
          price: Number(price),
          allergens: allergens || [],
          photo_url: photo_url || '',
          is_available: true,
          is_featured: is_featured || false,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, source: 'supabase', data });
    }

    const mockDish = {
      id: `dish-${Date.now()}`,
      name,
      description,
      price: Number(price),
      allergens: allergens || [],
      image: photo_url,
      isAvailable: true,
      isSpecialty: is_featured || false,
    };

    return NextResponse.json({
      success: true,
      source: 'local_database',
      data: mockDish,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_available, price, name, allergens, photo_url } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de plato requerido' }, { status: 400 });
    }

    if (isSupabaseConfigured() && supabase) {
      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (is_available !== undefined) updatePayload.is_available = is_available;
      if (price !== undefined) updatePayload.price = Number(price);
      if (name !== undefined) updatePayload.name = name;
      if (allergens !== undefined) updatePayload.allergens = allergens;
      if (photo_url !== undefined) updatePayload.photo_url = photo_url;

      const { data, error } = await supabase
        .from('dishes')
        .update(updatePayload)
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
      message: 'Plato actualizado',
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('dishes').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Plato ${id} eliminado correctamente`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
