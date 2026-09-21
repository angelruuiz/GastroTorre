'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Restaurant, initialRestaurants, Dish, MenuCategory } from '@/data/restaurants';
import {
  DatabaseService,
  HosteleroUser,
  ReservationRecord,
  DEMO_HOSTELEROS,
} from '@/lib/database/dbService';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface RestaurantContextType {
  restaurants: Restaurant[];
  currentUser: HosteleroUser | null;
  reservations: ReservationRecord[];
  isCloudConnected: boolean;
  isLoading: boolean;
  getRestaurantBySlug: (slug: string) => Restaurant | undefined;
  getRestaurantById: (id: string) => Restaurant | undefined;
  updateRestaurant: (id: string, updatedData: Partial<Restaurant>) => void;
  updateDish: (restaurantId: string, categoryId: string, dishId: string, updatedDish: Partial<Dish>) => void;
  addDish: (restaurantId: string, categoryId: string, newDish: Dish) => void;
  deleteDish: (restaurantId: string, categoryId: string, dishId: string) => void;
  toggleDishAvailability: (restaurantId: string, categoryId: string, dishId: string) => void;
  addCategory: (restaurantId: string, newCategory: { name: string; description?: string }) => void;
  deleteCategory: (restaurantId: string, categoryId: string) => void;
  createReservation: (res: Omit<ReservationRecord, 'id' | 'createdAt'>) => Promise<ReservationRecord>;
  updateReservationStatus: (id: string, status: ReservationRecord['status']) => Promise<void>;
  switchHosteleroUser: (restaurantId: string) => void;
  loginWithEmail: (email: string, pass?: string) => Promise<void>;
  logoutHostelero: () => void;
  resetAllData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [currentUser, setCurrentUser] = useState<HosteleroUser | null>(DEMO_HOSTELEROS[0]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data on mount
  useEffect(() => {
    const init = async () => {
      try {
        setIsCloudConnected(isSupabaseConfigured());
        const loadedRestaurants = await DatabaseService.getRestaurants();
        setRestaurants(loadedRestaurants);

        const sessionUser = DatabaseService.getSessionUser();
        if (sessionUser) {
          setCurrentUser(sessionUser);
          const loadedRes = await DatabaseService.getReservations(sessionUser.restaurantId);
          setReservations(loadedRes);
        } else {
          const loadedRes = await DatabaseService.getReservations('1');
          setReservations(loadedRes);
        }
      } catch (err) {
        console.error('Error initializing database service:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const getRestaurantBySlug = (slug: string) => {
    return restaurants.find((r) => r.slug === slug);
  };

  const getRestaurantById = (id: string) => {
    return restaurants.find((r) => r.id === id);
  };

  const updateRestaurant = async (id: string, updatedData: Partial<Restaurant>) => {
    const current = restaurants.find((r) => r.id === id);
    if (!current) return;
    const merged: Restaurant = { ...current, ...updatedData };
    const updatedList = await DatabaseService.updateRestaurant(merged);
    setRestaurants(updatedList);
  };

  const updateDish = async (
    restaurantId: string,
    categoryId: string,
    dishId: string,
    updatedDish: Partial<Dish>
  ) => {
    const rest = restaurants.find((r) => r.id === restaurantId);
    if (!rest) return;
    const cat = rest.menu.find((c) => c.id === categoryId);
    const dish = cat?.dishes.find((d) => d.id === dishId);
    if (!dish) return;

    const mergedDish: Dish = { ...dish, ...updatedDish };
    const updatedList = await DatabaseService.saveDish(restaurantId, categoryId, mergedDish);
    setRestaurants(updatedList);
  };

  const addDish = async (restaurantId: string, categoryId: string, newDish: Dish) => {
    const updatedList = await DatabaseService.saveDish(restaurantId, categoryId, newDish);
    setRestaurants(updatedList);
  };

  const deleteDish = async (restaurantId: string, _categoryId: string, dishId: string) => {
    const updatedList = await DatabaseService.deleteDish(restaurantId, dishId);
    setRestaurants(updatedList);
  };

  const toggleDishAvailability = async (restaurantId: string, _categoryId: string, dishId: string) => {
    const updatedList = await DatabaseService.toggleDishAvailability(restaurantId, dishId);
    setRestaurants(updatedList);
  };

  const addCategory = async (restaurantId: string, newCategory: { name: string; description?: string }) => {
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

    const currentRest = restaurants.find((r) => r.id === restaurantId);
    if (!currentRest) return;

    const updatedMenu = [...currentRest.menu, category];
    const updatedRest = { ...currentRest, menu: updatedMenu };
    const updatedList = await DatabaseService.updateRestaurant(updatedRest);
    setRestaurants(updatedList);
  };

  const deleteCategory = async (restaurantId: string, categoryId: string) => {
    const currentRest = restaurants.find((r) => r.id === restaurantId);
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

  const switchHosteleroUser = async (restaurantId: string) => {
    const user = await DatabaseService.loginWithDemo(restaurantId);
    setCurrentUser(user);
    const res = await DatabaseService.getReservations(restaurantId);
    setReservations(res);
  };

  const loginWithEmail = async (email: string, pass?: string) => {
    const user = await DatabaseService.loginWithEmail(email, pass);
    setCurrentUser(user);
    const res = await DatabaseService.getReservations(user.restaurantId);
    setReservations(res);
  };

  const logoutHostelero = async () => {
    await DatabaseService.logout();
    setCurrentUser(null);
  };

  const resetAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    setRestaurants(initialRestaurants);
    setCurrentUser(DEMO_HOSTELEROS[0]);
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        currentUser,
        reservations,
        isCloudConnected,
        isLoading,
        getRestaurantBySlug,
        getRestaurantById,
        updateRestaurant,
        updateDish,
        addDish,
        deleteDish,
        toggleDishAvailability,
        addCategory,
        deleteCategory,
        createReservation,
        updateReservationStatus,
        switchHosteleroUser,
        loginWithEmail,
        logoutHostelero,
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
