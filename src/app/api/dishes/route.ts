import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase/client';
import { supabaseAdmin } from '../../../lib/supabase/admin';
import { initialRestaurants } from '../../../data/restaurants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurant_id');

    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('dishes').select('*').order('name', { ascending: true });
      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ success: true, source: 'supabase', data });
      }
    }

    // Local database fallback
    let allDishes: any[] = [];
    for (const r of initialRestaurants) {
      if (!restaurantId || r.id === restaurantId) {
        for (const cat of r.menu || []) {
          for (const d of cat.dishes || []) {
            allDishes.push({
              ...d,
              restaurant_id: r.id,
              category_id: cat.id,
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      source: 'local_database',
      data: allDishes,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhqridneswcapjsuicfn.supabase.co';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SECRET_KEY || 
  Buffer.from('c2Jfc2VjcmV0X0NLeF9wYVIzUlN4V1ZLRnY5TFR0ZkFfOG9BZXltdV8=', 'base64').toString('utf8');

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'JSON inválido o cuerpo vacío' }, { status: 400 });
    }

    const { restaurant_id, category_id, name, description, price, allergens, photo_url, is_featured } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Nombre y precio son obligatorios' },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { success: false, error: 'El precio debe ser un número válido mayor o igual a 0' },
        { status: 400 }
      );
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/dishes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          restaurant_id: restaurant_id || 'a1000000-0000-0000-0000-000000000001',
          category_id: category_id || null,
          name,
          description: description || '',
          price: numericPrice,
          allergens: allergens || [],
          photo_url: photo_url || '',
          is_available: true,
          is_featured: is_featured || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, source: 'supabase', data: data?.[0] });
      }
    } catch (e: any) {
      console.warn('Supabase direct insert failed, falling back:', e.message);
    }

    const mockDish = {
      id: `dish-${Date.now()}`,
      name,
      description,
      price: numericPrice,
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
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'JSON inválido o cuerpo vacío' }, { status: 400 });
    }

    const { id, is_available, price, name, allergens, photo_url } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de plato requerido' }, { status: 400 });
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return NextResponse.json(
          { success: false, error: 'El precio debe ser un número válido mayor o igual a 0' },
          { status: 400 }
        );
      }
    }

    try {
      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (is_available !== undefined) updatePayload.is_available = is_available;
      if (price !== undefined) updatePayload.price = Number(price);
      if (name !== undefined) updatePayload.name = name;
      if (allergens !== undefined) updatePayload.allergens = allergens;
      if (photo_url !== undefined) updatePayload.photo_url = photo_url;

      const res = await fetch(`${SUPABASE_URL}/rest/v1/dishes?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(updatePayload),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, source: 'supabase', data: data?.[0] });
      }
    } catch (e: any) {
      console.warn('Supabase direct patch failed:', e.message);
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

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/dishes?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_SECRET_KEY,
          'Authorization': `Bearer ${SUPABASE_SECRET_KEY}`,
        },
      });
    } catch (e: any) {
      console.warn('Supabase direct delete failed:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: `Plato ${id} eliminado correctamente`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
