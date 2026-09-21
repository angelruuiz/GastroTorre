'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Restaurant, INITIAL_RESTAURANTS, Dish, MenuCategory } from '@/data/restaurants';

interface RestaurantContextType {
  restaurants: Restaurant[];
  getRestaurantBySlug: (slug: string) => Restaurant | undefined;
  getRestaurantById: (id: string) => Restaurant | undefined;
  updateRestaurant: (id: string, updatedData: Partial<Restaurant>) => void;
  updateDish: (restaurantId: string, categoryId: string, dishId: string, updatedDish: Partial<Dish>) => void;
  addDish: (restaurantId: string, categoryId: string, newDish: Dish) => void;
  deleteDish: (restaurantId: string, categoryId: string, dishId: string) => void;
  toggleDishAvailability: (restaurantId: string, categoryId: string, dishId: string) => void;
  addCategory: (restaurantId: string, newCategory: { name: string; description?: string }) => void;
  deleteCategory: (restaurantId: string, categoryId: string) => void;
  resetAllData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEY = 'gastrotorre_restaurants_v1';

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRestaurants(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading restaurants from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveToStorage = (data: Restaurant[]) => {
    setRestaurants(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  };

  const getRestaurantBySlug = (slug: string) => {
    return restaurants.find((r) => r.slug === slug);
  };

  const getRestaurantById = (id: string) => {
    return restaurants.find((r) => r.id === id);
  };

  const updateRestaurant = (id: string, updatedData: Partial<Restaurant>) => {
    const updated = restaurants.map((r) => {
      if (r.id === id) {
        return { ...r, ...updatedData };
      }
      return r;
    });
    saveToStorage(updated);
  };

  const updateDish = (
    restaurantId: string,
    categoryId: string,
    dishId: string,
    updatedDish: Partial<Dish>
  ) => {
    const updated = restaurants.map((r) => {
      if (r.id !== restaurantId) return r;

      const newMenu = r.menu.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const newDishes = cat.dishes.map((d) => {
          if (d.id !== dishId) return d;
          return { ...d, ...updatedDish };
        });

        return { ...cat, dishes: newDishes };
      });

      return { ...r, menu: newMenu };
    });

    saveToStorage(updated);
  };

  const addDish = (restaurantId: string, categoryId: string, newDish: Dish) => {
    const updated = restaurants.map((r) => {
      if (r.id !== restaurantId) return r;

      const newMenu = r.menu.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return { ...cat, dishes: [...cat.dishes, newDish] };
      });

      return { ...r, menu: newMenu };
    });

    saveToStorage(updated);
  };

  const deleteDish = (restaurantId: string, categoryId: string, dishId: string) => {
    const updated = restaurants.map((r) => {
      if (r.id !== restaurantId) return r;

      const newMenu = r.menu.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return { ...cat, dishes: cat.dishes.filter((d) => d.id !== dishId) };
      });

      return { ...r, menu: newMenu };
    });

    saveToStorage(updated);
  };

  const toggleDishAvailability = (restaurantId: string, categoryId: string, dishId: string) => {
    const updated = restaurants.map((r) => {
      if (r.id !== restaurantId) return r;

      const newMenu = r.menu.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const newDishes = cat.dishes.map((d) => {
          if (d.id !== dishId) return d;
          return { ...d, isAvailable: !d.isAvailable };
        });

        return { ...cat, dishes: newDishes };
      });

      return { ...r, menu: newMenu };
    });

    saveToStorage(updated);
  };

  const addCategory = (restaurantId: string, newCategory: { name: string; description?: string }) => {
    const slug = newCategory.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `cat-${Date.now()}`;

    const catId = `${slug}-${Date.now()}`;
    const category: MenuCategory = {
      id: catId,
      name: newCategory.name,
      description: newCategory.description || undefined,
      dishes: [],
    };

    const updated = restaurants.map((r) => {
      if (r.id !== restaurantId) return r;
      return { ...r, menu: [...r.menu, category] };
    });

    saveToStorage(updated);
  };

  const deleteCategory = (restaurantId: string, categoryId: string) => {
    const updated = restaurants.map((r) => {
      if (r.id !== restaurantId) return r;
      return { ...r, menu: r.menu.filter((cat) => cat.id !== categoryId) };
    });

    saveToStorage(updated);
  };

  const resetAllData = () => {
    saveToStorage(INITIAL_RESTAURANTS);
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        getRestaurantBySlug,
        getRestaurantById,
        updateRestaurant,
        updateDish,
        addDish,
        deleteDish,
        toggleDishAvailability,
        addCategory,
        deleteCategory,
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
