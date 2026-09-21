export type UserRole = 'superadmin' | 'owner' | 'staff';
export type RestaurantZone = 'Torrelodones Pueblo' | 'Torrelodones Colonia';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type LeadStatus = 'nuevo' | 'contactado' | 'demo_presentada' | 'cerrado_ganado' | 'descartado';

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  zone: string;
  address: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  opening_hours: Record<string, string>;
  tags: string[];
  photo_url: string;
  cover_url?: string;
  rating: number;
  reviews_count: number;
  google_maps_url?: string;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  owner_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  order_index: number;
  icon?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Dish {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  allergens: string[];
  photo_url?: string;
  is_available: boolean;
  is_featured: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: ReservationStatus;
  special_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HosteleroProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  restaurant_id: string;
  created_at?: string;
}

export interface LeadHostelero {
  id: string;
  restaurant_name: string;
  contact_name: string;
  phone: string;
  email: string;
  plan_interest: string;
  zone?: string;
  status: LeadStatus;
  notes?: string;
  created_at?: string;
}

export interface AnalyticsEvent {
  id?: string;
  restaurant_id: string;
  event_type: 'page_view' | 'qr_scan' | 'call_click' | 'whatsapp_click' | 'dish_view' | 'reservation_click';
  dish_id?: string;
  user_agent?: string;
  created_at?: string;
}

export interface DashboardStats {
  total_views: number;
  total_qr_scans: number;
  total_calls: number;
  total_whatsapp: number;
  total_dishes: number;
  active_dishes: number;
  pending_reservations: number;
}
