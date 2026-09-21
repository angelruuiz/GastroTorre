'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Restaurant, initialRestaurants, Dish, MenuCategory } from '@/data/restaurants';
import { DatabaseService, ReservationRecord } from '@/lib/database/dbService';
import { AuthService, UserAccount, INITIAL_ACCOUNTS } from '@/lib/auth/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface RestaurantContextType {
  restaurants: Restaurant[];
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  reservations: ReservationRecord[];
  isCloudConnected: boolean;
  isLoading: boolean;
  getRestaurantBySlug: (slug: string) => Restaurant | undefined;
  getRestaurantById: (id: string) => Restaurant | undefined;
  updateRestaurant: (id: string, updatedData: Partial<Restaurant>) => void;
  addNewRestaurant: (newRestaurant: Restaurant) => void;
  deleteRestaurant: (id: string) => void;
  updateDish: (restaurantId: string, categoryId: string, dishId: string, updatedDish: Partial<Dish>) => void;
  addDish: (restaurantId: string, categoryId: string, newDish: Dish) => void;
  deleteDish: (restaurantId: string, categoryId: string, dishId: string) => void;
  toggleDishAvailability: (restaurantId: string, categoryId: string, dishId: string) => void;
  addCategory: (restaurantId: string, newCategory: { name: string; description?: string }) => void;
  deleteCategory: (restaurantId: string, categoryId: string) => void;
  createReservation: (res: Omit<ReservationRecord, 'id' | 'createdAt'>) => Promise<ReservationRecord>;
  updateReservationStatus: (id: string, status: ReservationRecord['status']) => Promise<void>;
  login: (identifier: string, pass: string) => { success: boolean; user?: UserAccount; error?: string };
  logout: () => void;
  changeUserPassword: (userId: string, newPass: string) => boolean;
  createHosteleroAccount: (acc: {
    email: string;
    username: string;
    password: string;
    name: string;
    restaurantId: string;
    restaurantSlug: string;
    restaurantName: string;
  }) => { success: boolean; user?: UserAccount; error?: string };
  deleteHosteleroAccount: (userId: string) => boolean;
  resetAllData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLiveRestaurants = async () => {
    try {
      const loaded = await DatabaseService.getRestaurants();
      if (loaded && loaded.length > 0) {
        setRestaurants(loaded);
      }
    } catch (e) {
      console.warn('Realtime refresh error:', e);
    }
  };

  // Initialize data and session on mount + Supabase Realtime & Visibility Change
  useEffect(() => {
    const init = async () => {
      try {
        setIsCloudConnected(isSupabaseConfigured());
        const loadedRestaurants = await DatabaseService.getRestaurants();
        setRestaurants(loadedRestaurants);

        // Load active session from AuthService
        const activeUser = AuthService.getCurrentUser();
        setCurrentUser(activeUser);

        // Load accounts list
        const loadedAccounts = AuthService.getUsers();
        setAccounts(loadedAccounts);

        // Load reservations
        const targetRestId = activeUser?.restaurantId || (loadedRestaurants[0]?.id || '1');
        const loadedRes = await DatabaseService.getReservations(targetRestId);
        setReservations(loadedRes);
      } catch (err) {
        console.error('Error initializing database service:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // 1. Supabase Realtime WebSocket Listener (instant sync on any dish or restaurant change)
    let channel: any = null;
    if (isSupabaseConfigured() && supabase) {
      try {
        channel = supabase
          .channel('gastrotorre_live_sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, () => {
            refreshLiveRestaurants();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => {
            refreshLiveRestaurants();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_categories' }, () => {
            refreshLiveRestaurants();
          })
          .subscribe();
      } catch (subErr) {
        console.warn('Could not establish Supabase realtime subscription:', subErr);
      }
    }

    // 2. Auto-Refresh on app focus/unlock (crucial for iOS PWA added to home screen)
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshLiveRestaurants();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    
    // 3. Periodic fallback poll every 8 seconds
    const interval = setInterval(refreshLiveRestaurants, 8000);

    return () => {
      if (channel && supabase) {
        try { supabase.removeChannel(channel); } catch {}
      }
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      clearInterval(interval);
    };
  }, []);

  const getRestaurantBySlug = (slug: string) => {
    return restaurants.find((r) => r.slug === slug);
  };

  const getRestaurantById = (id: string) => {
    return restaurants.find((r) => r.id === id || r.slug === id);
  };

  const updateRestaurant = async (id: string, updatedData: Partial<Restaurant>) => {
    const current = restaurants.find((r) => r.id === id || r.slug === id);
    if (!current) return;
    const merged: Restaurant = { ...current, ...updatedData };
    const updatedList = await DatabaseService.updateRestaurant(merged);
    setRestaurants(updatedList);
  };

  const addNewRestaurant = async (newRestaurant: Restaurant) => {
    const updatedList = await DatabaseService.updateRestaurant(newRestaurant);
    setRestaurants(updatedList);
  };

  const deleteRestaurant = (id: string) => {
    const updatedList = restaurants.filter((r) => r.id !== id && r.slug !== id);
    setRestaurants(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gastrotorre_db_restaurants_v2', JSON.stringify(updatedList));
    }
  };

  const updateDish = async (
    restaurantId: string,
    categoryId: string,
    dishId: string,
    updatedDish: Partial<Dish>
  ) => {
    const rest = restaurants.find((r) => r.id === restaurantId || r.slug === restaurantId);
    if (!rest) return;
    const cat = rest.menu.find((c) => c.id === categoryId);
    const dish = cat?.dishes.find((d) => d.id === dishId);
    if (!dish) return;

    const mergedDish: Dish = { ...dish, ...updatedDish };
    const updatedList = await DatabaseService.saveDish(rest.id, categoryId, mergedDish);
    setRestaurants(updatedList);
  };

  const addDish = async (restaurantId: string, categoryId: string, newDish: Dish) => {
    const rest = restaurants.find((r) => r.id === restaurantId || r.slug === restaurantId);
    const targetId = rest?.id || restaurantId;
    const updatedList = await DatabaseService.saveDish(targetId, categoryId, newDish);
    setRestaurants(updatedList);
  };

  const deleteDish = async (restaurantId: string, _categoryId: string, dishId: string) => {
    const rest = restaurants.find((r) => r.id === restaurantId || r.slug === restaurantId);
    const targetId = rest?.id || restaurantId;
    const updatedList = await DatabaseService.deleteDish(targetId, dishId);
    setRestaurants(updatedList);
  };

  const toggleDishAvailability = async (restaurantId: string, _categoryId: string, dishId: string) => {
    const rest = restaurants.find((r) => r.id === restaurantId || r.slug === restaurantId);
    const targetId = rest?.id || restaurantId;
    const updatedList = await DatabaseService.toggleDishAvailability(targetId, dishId);
    setRestaurants(updatedList);
  };

  const addCategory = async (restaurantId: string, newCategory: { name: string; description?: string }) => {
    const currentRest = restaurants.find((r) => r.id === restaurantId || r.slug === restaurantId);
    if (!currentRest) return;

    const slug = newCategory.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `cat-${Date.now()}`;

    const catId = `cat-${slug}-${Date.now()}`;
    const category: MenuCategory = {
      id: catId,
      name: newCategory.name,
      description: newCategory.description || undefined,
      dishes: [],
    };

    const updatedMenu = [...currentRest.menu, category];
    const updatedRest = { ...currentRest, menu: updatedMenu };
    const updatedList = await DatabaseService.updateRestaurant(updatedRest);
    setRestaurants(updatedList);
  };

  const deleteCategory = async (restaurantId: string, categoryId: string) => {
    const currentRest = restaurants.find((r) => r.id === restaurantId || r.slug === restaurantId);
    if (!currentRest) return;

    const updatedMenu = currentRest.menu.filter((c) => c.id !== categoryId);
    const updatedRest = { ...currentRest, menu: updatedMenu };
    const updatedList = await DatabaseService.updateRestaurant(updatedRest);
    setRestaurants(updatedList);
  };

  const createReservation = async (res: Omit<ReservationRecord, 'id' | 'createdAt'>) => {
    const newRecord = await DatabaseService.createReservation(res);
    setReservations((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateReservationStatus = async (id: string, status: ReservationRecord['status']) => {
    const updated = await DatabaseService.updateReservationStatus(id, status);
    setReservations(updated);
  };

  // --------------------------------------------------------------------------
  // AUTHENTICATION & CREDENTIALS
  // --------------------------------------------------------------------------
  const login = (identifier: string, pass: string) => {
    const res = AuthService.login(identifier, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setAccounts(AuthService.getUsers());
      if (res.user.restaurantId) {
        DatabaseService.getReservations(res.user.restaurantId).then(setReservations);
      }
    }
    return res;
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const changeUserPassword = (userId: string, newPass: string) => {
    const ok = AuthService.changePassword(userId, newPass);
    if (ok) {
      setAccounts(AuthService.getUsers());
      const active = AuthService.getCurrentUser();
      if (active) setCurrentUser(active);
    }
    return ok;
  };

  const createHosteleroAccount = (acc: {
    email: string;
    username: string;
    password: string;
    name: string;
    restaurantId: string;
    restaurantSlug: string;
    restaurantName: string;
  }) => {
    const res = AuthService.createHosteleroAccount(acc);
    if (res.success) {
      setAccounts(AuthService.getUsers());
    }
    return res;
  };

  const deleteHosteleroAccount = (userId: string) => {
    const ok = AuthService.deleteAccount(userId);
    if (ok) {
      setAccounts(AuthService.getUsers());
    }
    return ok;
  };

  const resetAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    setRestaurants(initialRestaurants);
    setAccounts(INITIAL_ACCOUNTS);
    setCurrentUser(null);
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        currentUser,
        accounts,
        reservations,
        isCloudConnected,
        isLoading,
        getRestaurantBySlug,
        getRestaurantById,
        updateRestaurant,
        addNewRestaurant,
        deleteRestaurant,
        updateDish,
        addDish,
        deleteDish,
        toggleDishAvailability,
        addCategory,
        deleteCategory,
        createReservation,
        updateReservationStatus,
        login,
        logout,
        changeUserPassword,
        createHosteleroAccount,
        deleteHosteleroAccount,
        resetAllData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurants = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurants must be used within a RestaurantProvider');
  }
  return context;
};
