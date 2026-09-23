import { supabase, isSupabaseConfigured } from '../supabase/client';
import { initialRestaurants, Restaurant, Dish, MenuCategory } from '../../data/restaurants';

export interface ReservationRecord {
  id: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialNotes?: string;
  createdAt: string;
}

export interface HosteleroUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'superadmin' | 'staff';
  restaurantId: string;
  restaurantSlug: string;
}

export interface LeadRecord {
  id: string;
  restaurantName: string;
  contactName: string;
  phone: string;
  email: string;
  plan: string;
  zone: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  RESTAURANTS: 'gastrotorre_db_restaurants_v2',
  RESERVATIONS: 'gastrotorre_db_reservations_v2',
  LEADS: 'gastrotorre_db_leads_v2',
  ANALYTICS: 'gastrotorre_db_analytics_v2',
  CURRENT_USER: 'gastrotorre_auth_user_v2',
};

// Default Demo Hostelero Accounts
export const DEMO_HOSTELEROS: HosteleroUser[] = [
  {
    id: 'user-jarales',
    email: 'jarales@gastrotorre.demo',
    name: 'Ángel (Asador Los Jarales)',
    role: 'owner',
    restaurantId: '1',
    restaurantSlug: 'asador-los-jarales',
  },
  {
    id: 'user-latavola',
    email: 'latavola@gastrotorre.demo',
    name: 'Marco (La Tavola)',
    role: 'owner',
    restaurantId: '2',
    restaurantSlug: 'la-tavola',
  },
  {
    id: 'user-olivo',
    email: 'olivo@gastrotorre.demo',
    name: 'Elena (Bistró El Olivo)',
    role: 'owner',
    restaurantId: '3',
    restaurantSlug: 'el-olivo-bistro',
  },
  {
    id: 'user-smash',
    email: 'smash@gastrotorre.demo',
    name: 'Carlos (Torre Smash & Brew)',
    role: 'owner',
    restaurantId: '4',
    restaurantSlug: 'torre-smash',
  },
  {
    id: 'user-huerta',
    email: 'huerta@gastrotorre.demo',
    name: 'Lucía (Café & Brunch La Huerta)',
    role: 'owner',
    restaurantId: '5',
    restaurantSlug: 'la-huerta-brunch',
  },
];

export const INITIAL_RESERVATIONS: ReservationRecord[] = [
  {
    id: 'res-101',
    restaurantId: '1',
    customerName: 'Santiago Bernabéu',
    customerPhone: '+34 611 222 333',
    customerEmail: 'santiago@madrid.es',
    reservationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reservationTime: '14:30',
    partySize: 4,
    status: 'pending',
    specialNotes: 'Mesa en la terraza ajardinada, chuletón punto menos.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'res-102',
    restaurantId: '1',
    customerName: 'María García',
    customerPhone: '+34 655 444 888',
    customerEmail: 'maria@torre.es',
    reservationDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    reservationTime: '21:30',
    partySize: 2,
    status: 'confirmed',
    specialNotes: 'Celebración de aniversario.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'res-103',
    restaurantId: '2',
    customerName: 'Roberto Gómez',
    customerPhone: '+34 677 888 999',
    customerEmail: 'roberto@italia.com',
    reservationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reservationTime: '20:30',
    partySize: 6,
    status: 'confirmed',
    specialNotes: '1 comensal celíaco.',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

// Universal Database Service
export class DatabaseService {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // --------------------------------------------------------------------------
  // RESTAURANTS CRUD
  // --------------------------------------------------------------------------
  public static async getRestaurants(): Promise<Restaurant[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*, menu_categories(*, dishes(*))')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          // Transform supabase data to frontend model
          const transformed = data.map((r: any) => ({
            id: r.id,
            slug: r.slug,
            name: r.name,
            tagline: r.tagline || '',
            description: r.description || '',
            cuisine: r.tags?.[0] || 'Gastronomía Local',
            category: 'mediterranea' as const,
            priceLevel: '€€' as const,
            rating: Number(r.rating) || 4.8,
            reviewCount: r.reviews_count || 100,
            coverImage: r.cover_url || r.photo_url || initialRestaurants[0].coverImage,
            logoImage: r.photo_url || initialRestaurants[0].logoImage,
            address: r.address,
            zone: r.zone,
            googleMapsUrl: r.google_maps_url || '',
            phone: r.phone,
            whatsapp: r.whatsapp || '',
            bookingType: (r.whatsapp ? 'whatsapp' : 'phone') as 'whatsapp' | 'phone',
            capacity: 60,
            features: r.tags || [],
            featured: r.is_featured || false,
            schedule: {
              days: typeof r.opening_hours === 'object' && r.opening_hours?.days ? r.opening_hours.days : 'Martes a Domingo',
              lunch: typeof r.opening_hours === 'object' && r.opening_hours?.lunch ? r.opening_hours.lunch : '13:00 - 17:00',
              dinner: typeof r.opening_hours === 'object' && r.opening_hours?.dinner ? r.opening_hours.dinner : '20:30 - 23:30',
              isTemporarilyClosed: Boolean(
                r.opening_hours?.isTemporarilyClosed ||
                r.opening_hours?.is_temporarily_closed ||
                r.is_active === false
              ),
              closedReason: r.opening_hours?.closedReason || r.opening_hours?.closed_reason || (r.is_active === false ? 'Cerrado temporalmente' : undefined),
            },
            menu: (r.menu_categories || []).map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              dishes: (cat.dishes || []).map((d: any) => ({
                id: d.id,
                name: d.name,
                description: d.description || '',
                price: Number(d.price),
                allergens: d.allergens || [],
                image: d.photo_url,
                isAvailable: d.is_available,
                isSpecialty: d.is_featured,
              })),
            })),
          }));

          if (this.isClient()) {
            try {
              localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(transformed));
            } catch {}
          }

          return transformed;
        }
      } catch (e) {
        console.warn('Supabase fetch failed, using local/fallback storage:', e);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fallback to initial
        }
      }
    }

    return initialRestaurants;
  }

  public static async getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
    const list = await this.getRestaurants();
    return list.find((r) => r.slug === slug);
  }

  public static async updateRestaurant(updated: Restaurant): Promise<Restaurant[]> {
    const list = await this.getRestaurants();
    const index = list.findIndex((r) => r.id === updated.id);
    let newList: Restaurant[];

    if (index >= 0) {
      newList = [...list];
      newList[index] = updated;
    } else {
      newList = [...list, updated];
    }

    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(newList));
    }

    // Try cloud sync if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const updatePayload: Record<string, any> = {
          name: updated.name,
          tagline: updated.tagline,
          description: updated.description,
          address: updated.address,
          phone: updated.phone,
          whatsapp: updated.whatsapp,
          zone: updated.zone,
          updated_at: new Date().toISOString(),
        };

        if (updated.schedule) {
          updatePayload.opening_hours = {
            days: updated.schedule.days,
            lunch: updated.schedule.lunch,
            dinner: updated.schedule.dinner,
            isTemporarilyClosed: updated.schedule.isTemporarilyClosed,
            closedReason: updated.schedule.closedReason,
          };
          updatePayload.is_active = !updated.schedule.isTemporarilyClosed;
        }

        await supabase
          .from('restaurants')
          .update(updatePayload)
          .eq('slug', updated.slug);
      } catch (e) {
        console.warn('Cloud update failed:', e);
      }
    }

    return newList;
  }

  // --------------------------------------------------------------------------
  // DISHES CRUD
  // --------------------------------------------------------------------------
  public static async toggleDishAvailability(
    restaurantId: string,
    dishId: string
  ): Promise<Restaurant[]> {
    const list = await this.getRestaurants();
    const updatedList = list.map((rest) => {
      if (rest.id !== restaurantId) return rest;
      const updatedMenu = rest.menu.map((cat) => ({
        ...cat,
        dishes: cat.dishes.map((dish) =>
          dish.id === dishId ? { ...dish, isAvailable: !dish.isAvailable } : dish
        ),
      }));
      return { ...rest, menu: updatedMenu };
    });

    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(updatedList));
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        // Fetch current status and invert
        const { data } = await supabase.from('dishes').select('is_available').eq('id', dishId).single();
        if (data) {
          await supabase.from('dishes').update({ is_available: !data.is_available }).eq('id', dishId);
        }
      } catch (e) {
        console.warn('Supabase toggle error:', e);
      }
    }

    return updatedList;
  }

  public static async saveDish(
    restaurantId: string,
    categoryId: string,
    dish: Dish
  ): Promise<Restaurant[]> {
    const list = await this.getRestaurants();
    const updatedList = list.map((rest) => {
      if (rest.id !== restaurantId) return rest;

      let foundCat = false;
      const updatedMenu = rest.menu.map((cat) => {
        if (cat.id !== categoryId) return cat;
        foundCat = true;
        const exists = cat.dishes.some((d) => d.id === dish.id);
        const dishes = exists
          ? cat.dishes.map((d) => (d.id === dish.id ? dish : d))
          : [...cat.dishes, dish];
        return { ...cat, dishes };
      });

      if (!foundCat && rest.menu.length > 0) {
        // Add to first category if category not found
        const firstCat = { ...rest.menu[0], dishes: [...rest.menu[0].dishes, dish] };
        return { ...rest, menu: [firstCat, ...rest.menu.slice(1)] };
      }

      return { ...rest, menu: updatedMenu };
    });

    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(updatedList));
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('dishes').upsert({
          id: dish.id.includes('-') && dish.id.length === 36 ? dish.id : undefined,
          restaurant_id: restaurantId,
          category_id: categoryId,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          allergens: dish.allergens,
          photo_url: dish.image,
          is_available: dish.isAvailable,
          is_featured: dish.isSpecialty || false,
        });
      } catch (e) {
        console.warn('Supabase dish upsert failed:', e);
      }
    }

    return updatedList;
  }

  public static async deleteDish(restaurantId: string, dishId: string): Promise<Restaurant[]> {
    const list = await this.getRestaurants();
    const updatedList = list.map((rest) => {
      if (rest.id !== restaurantId) return rest;
      const updatedMenu = rest.menu.map((cat) => ({
        ...cat,
        dishes: cat.dishes.filter((d) => d.id !== dishId),
      }));
      return { ...rest, menu: updatedMenu };
    });

    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(updatedList));
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('dishes').delete().eq('id', dishId);
      } catch (e) {
        console.warn('Supabase delete dish failed:', e);
      }
    }

    return updatedList;
  }

  // --------------------------------------------------------------------------
  // RESERVATIONS CRUD
  // --------------------------------------------------------------------------
  public static async getReservations(restaurantId?: string): Promise<ReservationRecord[]> {
    if (isSupabaseConfigured() && supabase && restaurantId) {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('reservation_date', { ascending: true });

        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            restaurantId: r.restaurant_id,
            customerName: r.customer_name,
            customerPhone: r.customer_phone,
            customerEmail: r.customer_email,
            reservationDate: r.reservation_date,
            reservationTime: r.reservation_time,
            partySize: r.party_size,
            status: r.status,
            specialNotes: r.special_notes,
            createdAt: r.created_at,
          }));
        }
      } catch (e) {
        console.warn('Supabase reservations error:', e);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      if (stored) {
        try {
          const list: ReservationRecord[] = JSON.parse(stored);
          return restaurantId ? list.filter((r) => r.restaurantId === restaurantId) : list;
        } catch {
          // fallback
        }
      }
    }

    return restaurantId
      ? INITIAL_RESERVATIONS.filter((r) => r.restaurantId === restaurantId)
      : INITIAL_RESERVATIONS;
  }

  public static async createReservation(
    res: Omit<ReservationRecord, 'id' | 'createdAt'>
  ): Promise<ReservationRecord> {
    const newRecord: ReservationRecord = {
      ...res,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (this.isClient()) {
      const existing = await this.getReservations();
      const updated = [newRecord, ...existing];
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('reservations').insert({
          restaurant_id: res.restaurantId,
          customer_name: res.customerName,
          customer_phone: res.customerPhone,
          customer_email: res.customerEmail,
          reservation_date: res.reservationDate,
          reservation_time: res.reservationTime,
          party_size: res.partySize,
          status: res.status,
          special_notes: res.specialNotes,
        });
      } catch (e) {
        console.warn('Supabase reservation insert failed:', e);
      }
    }

    return newRecord;
  }

  public static async updateReservationStatus(
    id: string,
    status: ReservationRecord['status']
  ): Promise<ReservationRecord[]> {
    const all = await this.getReservations();
    const updated = all.map((r) => (r.id === id ? { ...r, status } : r));

    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('reservations').update({ status }).eq('id', id);
      } catch (e) {
        console.warn('Supabase reservation update failed:', e);
      }
    }

    return updated;
  }

  // --------------------------------------------------------------------------
  // LEADS & PARTNERSHIP
  // --------------------------------------------------------------------------
  public static async createLead(lead: Omit<LeadRecord, 'id' | 'createdAt'>): Promise<LeadRecord> {
    const newLead: LeadRecord = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (this.isClient()) {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADS);
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newLead);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(list));
    }

    if (this.isClient()) {
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurant_name: lead.restaurantName,
            contact_name: lead.contactName,
            phone: lead.phone,
            email: lead.email,
            plan_interest: lead.plan,
            zone: lead.zone,
          }),
        });
      } catch (apiErr) {
        console.warn('API /api/leads fetch error:', apiErr);
      }
    }

    return newLead;
  }

  // --------------------------------------------------------------------------
  // ANALYTICS & STATS
  // --------------------------------------------------------------------------
  public static async trackEvent(
    restaurantId: string,
    eventType: 'page_view' | 'qr_scan' | 'call_click' | 'whatsapp_click' | 'dish_view' | 'reservation_click' | 'directions_click' | 'share_click' | 'google_review_click',
    dishId?: string
  ): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('analytics_events').insert({
          restaurant_id: restaurantId,
          event_type: eventType,
          dish_id: dishId,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
        });
      } catch (e) {
        console.warn('Supabase tracking failed:', e);
      }
    }

    if (this.isClient()) {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS) || '[]';
      const events = JSON.parse(stored);
      events.push({
        restaurantId,
        eventType,
        dishId,
        timestamp: Date.now(),
      });
      // keep only last 500 events
      if (events.length > 500) events.shift();
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(events));
    }
  }

  // --------------------------------------------------------------------------
  // AUTH & SESSION MANAGEMENT
  // --------------------------------------------------------------------------
  public static getSessionUser(): HosteleroUser | null {
    if (!this.isClient()) return null;
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    // Default to Los Jarales for immediate rich preview
    return DEMO_HOSTELEROS[0];
  }

  public static setSessionUser(user: HosteleroUser | null): void {
    if (!this.isClient()) return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public static async loginWithDemo(restaurantId: string): Promise<HosteleroUser> {
    const user = DEMO_HOSTELEROS.find((u) => u.restaurantId === restaurantId) || DEMO_HOSTELEROS[0];
    this.setSessionUser(user);
    return user;
  }

  public static async loginWithEmail(email: string, _password?: string): Promise<HosteleroUser> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: _password || 'GastroTorre2026!',
        });
        if (error) throw error;
        if (data.user) {
          const profile = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const userObj: HosteleroUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: profile.data?.full_name || email.split('@')[0],
            role: profile.data?.role || 'owner',
            restaurantId: profile.data?.restaurant_id || '1',
            restaurantSlug: 'asador-los-jarales',
          };
          this.setSessionUser(userObj);
          return userObj;
        }
      } catch (err: any) {
        console.warn('Supabase auth failed, trying demo accounts:', err.message);
      }
    }

    // Match demo or create new profile
    const existing = DEMO_HOSTELEROS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.setSessionUser(existing);
      return existing;
    }

    const newUser: HosteleroUser = {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: 'owner',
      restaurantId: '1',
      restaurantSlug: 'asador-los-jarales',
    };
    this.setSessionUser(newUser);
    return newUser;
  }

  public static async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout failed:', e);
      }
    }
    this.setSessionUser(null);
  }
}

export const dbService = DatabaseService;
