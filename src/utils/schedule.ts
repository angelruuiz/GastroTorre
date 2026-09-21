import { Restaurant } from '@/data/restaurants';

/**
 * Calculates a deterministic weekly index based on the ISO week of the year
 */
export function getWeeklyRestaurant(restaurants: Restaurant[]): Restaurant {
  if (!restaurants || restaurants.length === 0) return restaurants[0];
  
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  
  const index = (weekNumber + now.getFullYear()) % restaurants.length;
  return restaurants[index] || restaurants[0];
}

/**
 * Check if the restaurant is currently open based on current Spanish time
 */
export function getOpenStatus(schedule: { days: string; lunch: string; dinner?: string }): {
  isOpen: boolean;
  label: string;
  badgeColor: string;
} {
  const now = new Date();
  const day = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Parse days (e.g. "Martes a Domingo", "Miércoles a Domingo", "Lunes a Domingo")
  const lowerDays = schedule.days.toLowerCase();
  let isWorkDay = true;

  if (lowerDays.includes('martes a domingo') && day === 1) {
    isWorkDay = false; // Lunes cerrado
  } else if (lowerDays.includes('miércoles a domingo') && (day === 1 || day === 2)) {
    isWorkDay = false; // Lunes y Martes cerrado
  }

  if (!isWorkDay) {
    return {
      isOpen: false,
      label: 'Cerrado hoy',
      badgeColor: 'text-rose-900 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700/80',
    };
  }

  // Parse time helper (e.g. "13:30 - 16:30" => [810, 990])
  const parseRange = (rangeStr: string): [number, number] | null => {
    const parts = rangeStr.split('-').map((s) => s.trim());
    if (parts.length !== 2) return null;
    const [h1, m1] = parts[0].split(':').map(Number);
    const [h2, m2] = parts[1].split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;
    return [h1 * 60 + m1, h2 * 60 + m2];
  };

  const lunchRange = parseRange(schedule.lunch);
  const dinnerRange = schedule.dinner ? parseRange(schedule.dinner) : null;

  if (lunchRange && currentMinutes >= lunchRange[0] && currentMinutes <= lunchRange[1]) {
    return {
      isOpen: true,
      label: 'Abierto ahora',
      badgeColor: 'text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-600/80',
    };
  }

  if (dinnerRange) {
    // Handle overnight closing like 20:30 - 00:00 or 20:30 - 23:45
    const [start, end] = dinnerRange;
    const isOpenDinner = end < start 
      ? (currentMinutes >= start || currentMinutes <= end) 
      : (currentMinutes >= start && currentMinutes <= end);

    if (isOpenDinner) {
      return {
        isOpen: true,
        label: 'Abierto ahora',
        badgeColor: 'text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-600/80',
      };
    }
  }

  // If before lunch
  if (lunchRange && currentMinutes < lunchRange[0]) {
    return {
      isOpen: false,
      label: `Abre a las ${schedule.lunch.split('-')[0].trim()}`,
      badgeColor: 'text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700/80',
    };
  }

  // If between lunch and dinner
  if (dinnerRange && lunchRange && currentMinutes > lunchRange[1] && currentMinutes < dinnerRange[0]) {
    return {
      isOpen: false,
      label: `Abre a las ${schedule.dinner?.split('-')[0].trim()}`,
      badgeColor: 'text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700/80',
    };
  }

  return {
    isOpen: false,
    label: 'Cerrado por hoy',
    badgeColor: 'text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
  };
}
