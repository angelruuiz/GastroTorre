'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRestaurants } from '@/context/RestaurantContext';
import { 
  Store, 
  Settings, 
  Utensils, 
  QrCode, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  Eye, 
  HelpCircle,
  Phone, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Sparkles,
  Printer, 
  Download, 
  Camera, 
  Image as ImageIcon,
  ChevronRight, 
  Upload, 
  X, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Flame, 
  FolderPlus, 
  Layers, 
  Edit3, 
  Sun,
  Calendar,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  LogOut,
  Users,
  ShieldAlert,
  Building2,
  Briefcase,
  UserPlus,
  Smartphone,
  Laptop,
  Star,
  Share2,
  ArrowUpRight,
  Award,
  Leaf
} from 'lucide-react';
import { QRModal } from '@/components/QRModal';
import { DishPhotoModal } from '@/components/DishPhotoModal';
import { JoinGastroTorreModal } from '@/components/JoinGastroTorreModal';
import { DossierModal } from '@/components/DossierModal';
import { Dish, Restaurant, initialRestaurants } from '@/data/restaurants';
import { DatabaseService, LeadRecord } from '@/lib/database/dbService';

export default function AdminPage() {
  const { 
    restaurants, 
    currentUser,
    accounts,
    reservations,
    isCloudConnected,
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
    resetAllData 
  } = useRestaurants();

  // Login form states
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Superadmin view state
  const [adminTab, setAdminTab] = useState<'restaurants' | 'accounts' | 'onboard' | 'leads' | 'stats'>('restaurants');
  const [selectedRestId, setSelectedRestId] = useState<string>('');
  
  // Superadmin Password Reset Modal state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Superadmin New Account Modal state
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccUsername, setNewAccUsername] = useState('');
  const [newAccPass, setNewAccPass] = useState('');
  const [newAccRestSlug, setNewAccRestSlug] = useState('');

  // Superadmin New Restaurant Wizard state
  const [newRestName, setNewRestName] = useState('');
  const [newRestTagline, setNewRestTagline] = useState('');
  const [newRestCuisine, setNewRestCuisine] = useState('Cocina Tradicional & Tapas');
  const [newRestZone, setNewRestZone] = useState('Torrelodones Pueblo');
  const [newRestAddress, setNewRestAddress] = useState('');
  const [newRestPhone, setNewRestPhone] = useState('');
  const [newRestWhatsApp, setNewRestWhatsApp] = useState('');
  const [newRestOwnerPass, setNewRestOwnerPass] = useState('');

  // Leads list
  const [leadsList, setLeadsList] = useState<LeadRecord[]>([]);

  // Metrics period filter state
  const [metricsPeriod, setMetricsPeriod] = useState<'30d' | 'weekend' | 'all'>('30d');

  // Hostelero tabs & modals state
  const [activeTab, setActiveTab] = useState<'menu' | 'daily-menu' | 'stats' | 'info' | 'qr' | 'help'>('menu');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedMessage, setSavedMessage] = useState('¡Cambios guardados con éxito!');
  const [mounted, setMounted] = useState(false);

  // Daily Menu state
  const [dailyMenuActive, setDailyMenuActive] = useState(false);
  const [dailyMenuPrice, setDailyMenuPrice] = useState('13.50');
  const [dailyMenuFirstCourses, setDailyMenuFirstCourses] = useState('');
  const [dailyMenuSecondCourses, setDailyMenuSecondCourses] = useState('');
  const [dailyMenuDesserts, setDailyMenuDesserts] = useState('');
  const [dailyMenuIncludes, setDailyMenuIncludes] = useState('Incluye primer plato, segundo, pan, bebida y postre o café.');
  const [dailyMenuNotes, setDailyMenuNotes] = useState('Disponible de Lunes a Viernes de 13:30 a 16:30.');

  // Schedule & Temporary Closure state
  const [scheduleDays, setScheduleDays] = useState('');
  const [scheduleLunch, setScheduleLunch] = useState('');
  const [scheduleDinner, setScheduleDinner] = useState('');
  const [isTemporarilyClosed, setIsTemporarilyClosed] = useState(false);
  const [closedReason, setClosedReason] = useState('Cerrado hoy por asuntos propios');

  // Category creation modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Dish Photo Modal state
  const [editingPhotoDish, setEditingPhotoDish] = useState<{
    dishId: string;
    categoryId: string;
    dishName: string;
    currentImage?: string;
  } | null>(null);

  // Dish Edit/Create state
  const [editingDish, setEditingDish] = useState<{
    categoryId: string;
    dish: Dish;
  } | null>(null);

  // New dish form state
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishDesc, setNewDishDesc] = useState('');
  const [newDishImage, setNewDishImage] = useState('');
  const [newDishSpecialty, setNewDishSpecialty] = useState(false);
  const [newDishVegan, setNewDishVegan] = useState(false);
  const [newDishGlutenFree, setNewDishGlutenFree] = useState(false);
  const [newDishAllergens, setNewDishAllergens] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gastrotorre_db_leads_v2');
      if (stored) {
        try { setLeadsList(JSON.parse(stored)); } catch {}
      }
      // Fetch live leads from Supabase via /api/leads
      fetch('/api/leads')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            const formatted: LeadRecord[] = data.data.map((d: any) => ({
              id: d.id || `lead-${Date.now()}`,
              restaurantName: d.restaurant_name,
              contactName: d.contact_name,
              phone: d.phone,
              email: d.email || '',
              plan: d.plan_interest || 'Plan Pro (59€/mes)',
              zone: d.zone || 'Torrelodones Pueblo',
              createdAt: d.created_at || new Date().toISOString(),
            }));
            setLeadsList(formatted);
          }
        })
        .catch((e) => console.warn('Could not fetch server leads:', e));
    }
  }, []);

  // Update target restaurant when user changes
  useEffect(() => {
    if (currentUser?.role === 'owner' && currentUser.restaurantSlug) {
      setSelectedRestId(currentUser.restaurantSlug);
    } else if (currentUser?.role === 'superadmin' && !selectedRestId && restaurants.length > 0) {
      setSelectedRestId(restaurants[0].id || restaurants[0].slug);
    }
  }, [currentUser, restaurants, selectedRestId]);

  const currentRestaurant = 
    restaurants.find((r) => r.slug === selectedRestId || r.id === selectedRestId) || 
    restaurants[0] || 
    initialRestaurants[0];

  // Sync Daily Menu state when selected restaurant changes
  useEffect(() => {
    if (currentRestaurant && currentRestaurant.dailyMenu) {
      setDailyMenuActive(currentRestaurant.dailyMenu.isActive ?? false);
      setDailyMenuPrice(currentRestaurant.dailyMenu.price ? currentRestaurant.dailyMenu.price.toString() : '13.50');
      setDailyMenuFirstCourses(currentRestaurant.dailyMenu.firstCourses ? currentRestaurant.dailyMenu.firstCourses.join('\n') : '');
      setDailyMenuSecondCourses(currentRestaurant.dailyMenu.secondCourses ? currentRestaurant.dailyMenu.secondCourses.join('\n') : '');
      setDailyMenuDesserts(currentRestaurant.dailyMenu.desserts ? currentRestaurant.dailyMenu.desserts.join('\n') : '');
      setDailyMenuIncludes(currentRestaurant.dailyMenu.includes || 'Incluye primer plato, segundo, pan, bebida y postre o café.');
      setDailyMenuNotes(currentRestaurant.dailyMenu.scheduleNotes || 'Disponible de Lunes a Viernes de 13:30 a 16:30.');
    } else {
      setDailyMenuActive(false);
      setDailyMenuPrice('13.50');
      setDailyMenuFirstCourses('');
      setDailyMenuSecondCourses('');
      setDailyMenuDesserts('');
      setDailyMenuIncludes('Incluye primer plato, segundo, pan, bebida y postre o café.');
      setDailyMenuNotes('Disponible de Lunes a Viernes de 13:30 a 16:30.');
    }

    if (currentRestaurant && currentRestaurant.schedule) {
      setScheduleDays(currentRestaurant.schedule.days || 'Martes a Domingo');
      setScheduleLunch(currentRestaurant.schedule.lunch || '13:30 - 16:30');
      setScheduleDinner(currentRestaurant.schedule.dinner || '20:30 - 23:30');
      setIsTemporarilyClosed(Boolean(currentRestaurant.schedule.isTemporarilyClosed));
      setClosedReason(currentRestaurant.schedule.closedReason || 'Cerrado hoy por asuntos propios');
    }
  }, [currentRestaurant?.id, currentRestaurant?.slug, currentRestaurant?.schedule]);

  const triggerToast = (msg: string) => {
    setSavedMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginId.trim() || !loginPass) {
      setLoginError('Por favor, introduce tu usuario y contraseña.');
      return;
    }

    const res = login(loginId.trim(), loginPass);
    if (!res.success) {
      setLoginError(res.error || 'Credenciales no válidas.');
    } else {
      setLoginId('');
      setLoginPass('');
      triggerToast(res.user?.role === 'superadmin' ? '👑 Bienvenido Ángel (Superadmin)' : `Bienvenido ${res.user?.name}`);
    }
  };

  // Quick Demo Preset Login
  const handleQuickLogin = (id: string, pass: string) => {
    setLoginId(id);
    setLoginPass(pass);
    const res = login(id, pass);
    if (res.success) {
      triggerToast(res.user?.role === 'superadmin' ? '👑 Sesión iniciada como Superadmin' : `Sesión iniciada: ${res.user?.name}`);
    }
  };

  // Superadmin: Handle Password Change
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !newPasswordInput.trim()) return;

    changeUserPassword(editingUserId, newPasswordInput.trim());
    setEditingUserId(null);
    setNewPasswordInput('');
    triggerToast('¡Contraseña actualizada con éxito en la base de datos!');
  };

  // Superadmin: Handle Create Account
  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccEmail || !newAccUsername || !newAccPass) return;

    const rest = restaurants.find((r) => r.slug === newAccRestSlug) || restaurants[0];
    const res = createHosteleroAccount({
      email: newAccEmail.trim(),
      username: newAccUsername.trim(),
      password: newAccPass.trim(),
      name: newAccName.trim() || rest.name,
      restaurantId: rest.id || rest.slug,
      restaurantSlug: rest.slug,
      restaurantName: rest.name,
    });

    if (res.success) {
      setShowNewAccountModal(false);
      setNewAccName('');
      setNewAccEmail('');
      setNewAccUsername('');
      setNewAccPass('');
      triggerToast('¡Nueva cuenta de hostelero creada con éxito!');
    } else {
      alert(res.error);
    }
  };

  // Superadmin: Handle Onboard New Restaurant
  const handleOnboardRestaurantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestName.trim()) return;

    const slug = newRestName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newRest: Restaurant = {
      id: slug,
      slug: slug,
      name: newRestName.trim(),
      tagline: newRestTagline.trim() || 'Gastronomía de Torrelodones',
      description: `${newRestName} en ${newRestZone}. Disfruta de nuestra cocina y carta digitalizada.`,
      cuisine: newRestCuisine,
      category: 'mediterranea',
      priceLevel: '€€',
      rating: 5.0,
      reviewCount: 1,
      capacity: 50,
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop',
      logoImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=300&auto=format&fit=crop',
      address: newRestAddress.trim() || `Calle Principal, 28250 ${newRestZone}`,
      zone: newRestZone,
      googleMapsUrl: 'https://maps.google.com/?q=Torrelodones+Madrid',
      phone: newRestPhone.trim() || '+34 918 00 00 00',
      whatsapp: newRestWhatsApp.trim() || '+34 600 000 000',
      bookingType: 'whatsapp',
      schedule: {
        days: 'Martes a Domingo',
        lunch: '13:30 - 16:30',
        dinner: '20:30 - 23:30',
      },
      features: ['Carta digital oficial', 'Terraza', 'Reserva por WhatsApp'],
      featured: false,
      menu: [
        {
          id: 'entrantes',
          name: 'Entrantes & Raciones',
          description: 'Especialidades de la casa',
          dishes: [
            {
              id: `${slug}-dish-1`,
              name: 'Croquetas Artesanas de la Casa (6 uds)',
              description: 'Receta tradicional con leche fresca y rebozado crujiente',
              price: 12.50,
              allergens: ['gluten', 'lactosa', 'huevo'],
              isSpecialty: true,
              isAvailable: true,
            }
          ]
        }
      ]
    };

    addNewRestaurant(newRest);

    // Create owner account for this restaurant
    if (newRestOwnerPass.trim()) {
      createHosteleroAccount({
        email: `${slug}@gastrotorre.es`,
        username: slug,
        password: newRestOwnerPass.trim(),
        name: newRestName,
        restaurantId: slug,
        restaurantSlug: slug,
        restaurantName: newRestName,
      });
    }

    setNewRestName('');
    setNewRestTagline('');
    setNewRestAddress('');
    setNewRestPhone('');
    setNewRestWhatsApp('');
    setNewRestOwnerPass('');
    setAdminTab('restaurants');
    triggerToast(`¡Restaurante "${newRest.name}" dado de alta y publicado!`);
  };

  const handleToggleTemporaryClosure = () => {
    const nextState = !isTemporarilyClosed;
    setIsTemporarilyClosed(nextState);
    const reason = closedReason.trim() || 'Cerrado hoy por asuntos propios';
    updateRestaurant(currentRestaurant.id, {
      schedule: {
        ...currentRestaurant.schedule,
        isTemporarilyClosed: nextState,
        closedReason: reason,
      },
    });
    if (nextState) {
      triggerToast('🔴 Restaurante marcado como CERRADO temporalmente');
    } else {
      triggerToast('🟢 Restaurante REABIERTO al público con horario habitual');
    }
  };

  const handleSaveInfo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const capacityVal = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : undefined;

    updateRestaurant(currentRestaurant.id, {
      name: formData.get('name') as string,
      tagline: formData.get('tagline') as string,
      phone: formData.get('phone') as string,
      whatsapp: formData.get('whatsapp') as string,
      address: formData.get('address') as string,
      zone: (formData.get('zone') as string) || currentRestaurant.zone,
      googleMapsUrl: (formData.get('googleMapsUrl') as string) || currentRestaurant.googleMapsUrl,
      capacity: capacityVal,
      schedule: {
        days: scheduleDays.trim() || currentRestaurant.schedule.days,
        lunch: scheduleLunch.trim() || currentRestaurant.schedule.lunch,
        dinner: scheduleDinner.trim() || undefined,
        isTemporarilyClosed: isTemporarilyClosed,
        closedReason: closedReason.trim() || 'Cerrado hoy por asuntos propios',
      },
    });
    triggerToast('¡Datos y horario del restaurante actualizados!');
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    addCategory(currentRestaurant.id, {
      name: newCategoryName.trim(),
      description: newCategoryDesc.trim() || undefined,
    });
    setShowAddCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryDesc('');
    triggerToast('¡Sección creada con éxito!');
  };

  const handleOpenAddDish = (categoryId: string) => {
    setEditingDish(null);
    setTargetCategory(categoryId);
    setNewDishName('');
    setNewDishPrice('');
    setNewDishDesc('');
    setNewDishImage('');
    setNewDishSpecialty(false);
    setNewDishVegan(false);
    setNewDishGlutenFree(false);
    setNewDishAllergens([]);
    setShowAddDishModal(true);
  };

  const handleOpenEditDish = (categoryId: string, dish: Dish) => {
    setEditingDish({ categoryId, dish });
    setTargetCategory(categoryId);
    setNewDishName(dish.name);
    setNewDishPrice(dish.price.toString());
    setNewDishDesc(dish.description || '');
    setNewDishImage(dish.image || '');
    setNewDishSpecialty(!!dish.isSpecialty);
    setNewDishVegan(!!dish.isVegan);
    setNewDishGlutenFree(!!dish.isGlutenFree);
    setNewDishAllergens(dish.allergens || []);
    setShowAddDishModal(true);
  };

  const handleAddDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName || !newDishPrice || !targetCategory) return;

    if (editingDish) {
      updateDish(currentRestaurant.id, editingDish.categoryId, editingDish.dish.id, {
        name: newDishName,
        price: parseFloat(newDishPrice),
        description: newDishDesc,
        image: newDishImage || undefined,
        allergens: newDishAllergens,
        isSpecialty: newDishSpecialty,
        isVegan: newDishVegan,
        isGlutenFree: newDishGlutenFree,
      });
      setEditingDish(null);
    } else {
      const newDish: Dish = {
        id: `custom-${Date.now()}`,
        name: newDishName,
        price: parseFloat(newDishPrice),
        description: newDishDesc,
        image: newDishImage || undefined,
        allergens: newDishAllergens,
        isSpecialty: newDishSpecialty,
        isVegan: newDishVegan,
        isGlutenFree: newDishGlutenFree,
        isAvailable: true,
      };
      addDish(currentRestaurant.id, targetCategory, newDish);
    }

    setShowAddDishModal(false);
    setNewDishName('');
    setNewDishPrice('');
    setNewDishDesc('');
    setNewDishImage('');
    setNewDishSpecialty(false);
    setNewDishVegan(false);
    setNewDishGlutenFree(false);
    setNewDishAllergens([]);
    triggerToast(editingDish ? '¡Plato actualizado!' : '¡Plato añadido a la carta!');
  };

  const handleSaveDishPhoto = (newImageUrl?: string) => {
    if (!editingPhotoDish) return;
    updateDish(currentRestaurant.id, editingPhotoDish.categoryId, editingPhotoDish.dishId, {
      image: newImageUrl,
    });
    setEditingPhotoDish(null);
    triggerToast('¡Fotografía actualizada con éxito!');
  };

  const handleSaveDailyMenu = (e: React.FormEvent) => {
    e.preventDefault();
    const firsts = dailyMenuFirstCourses.split('\n').map((s) => s.trim()).filter(Boolean);
    const seconds = dailyMenuSecondCourses.split('\n').map((s) => s.trim()).filter(Boolean);
    const desserts = dailyMenuDesserts.split('\n').map((s) => s.trim()).filter(Boolean);
    const priceNum = parseFloat(dailyMenuPrice) || 13.50;

    updateRestaurant(currentRestaurant.id, {
      dailyMenu: {
        isActive: dailyMenuActive,
        price: priceNum,
        firstCourses: firsts,
        secondCourses: seconds,
        desserts: desserts.length > 0 ? desserts : undefined,
        includes: dailyMenuIncludes.trim() || undefined,
        scheduleNotes: dailyMenuNotes.trim() || undefined,
      },
    });

    triggerToast('¡Menú del día actualizado y publicado!');
  };

  // Rich computed metrics for the current restaurant
  const rawViews = currentRestaurant.stats?.monthlyViews || 1284;
  const qrScans = currentRestaurant.stats?.monthlyQrScans || Math.round(rawViews * 0.94);
  const webReads = currentRestaurant.stats?.monthlyWebReads || Math.round(rawViews * 0.06);
  const uniqueDin = currentRestaurant.stats?.uniqueVisitors || Math.round(rawViews * 0.72);
  const callsCount = currentRestaurant.stats?.phoneCalls || Math.round(rawViews * 0.068);
  const waCount = currentRestaurant.stats?.whatsappClicks || Math.round(rawViews * 0.128);
  const gpsCount = currentRestaurant.stats?.directionsClicks || Math.round(rawViews * 0.074);
  const revCount = currentRestaurant.stats?.googleReviewsClicks || Math.round(rawViews * 0.036);
  const shareCount = currentRestaurant.stats?.sharesCount || Math.round(rawViews * 0.03);
  const totalActionsCount = callsCount + waCount + gpsCount + revCount + shareCount;
  const conversionPct = ((totalActionsCount / rawViews) * 100).toFixed(1);
  const estRevenue = Math.round(totalActionsCount * 14.8);
  const paperSaved = Math.round(rawViews * 0.35);

  // Compute top dishes dynamically from menu
  const allCurrentDishes = currentRestaurant.menu?.flatMap((cat) => 
    cat.dishes.map((d) => ({
      name: d.name,
      category: cat.name,
      price: d.price,
      image: d.image,
      isSpecialty: d.isSpecialty,
    }))
  ) || [];

  const topDishesList = (currentRestaurant.stats?.topDishes && currentRestaurant.stats.topDishes.length > 0)
    ? currentRestaurant.stats.topDishes
    : allCurrentDishes.slice(0, 5).map((d, idx) => {
        const baseViews = Math.round(rawViews * (0.34 - idx * 0.06));
        return {
          name: d.name,
          category: d.category,
          price: d.price,
          views: baseViews,
          percentage: Math.round((baseViews / rawViews) * 100),
        };
      });

  const weeklyScansList = currentRestaurant.stats?.scansByDay || [
    { day: 'Lun', count: Math.round(rawViews * 0.04), isPeak: false },
    { day: 'Mar', count: Math.round(rawViews * 0.06), isPeak: false },
    { day: 'Mié', count: Math.round(rawViews * 0.09), isPeak: false },
    { day: 'Jue', count: Math.round(rawViews * 0.14), isPeak: false },
    { day: 'Vie', count: Math.round(rawViews * 0.25), isPeak: true },
    { day: 'Sáb', count: Math.round(rawViews * 0.28), isPeak: true },
    { day: 'Dom', count: Math.round(rawViews * 0.14), isPeak: true },
  ];

  const stats = {
    monthlyViews: rawViews,
    monthlyQrScans: qrScans,
    monthlyWebReads: webReads,
    uniqueVisitors: uniqueDin,
    monthlyBookings: callsCount + waCount,
    phoneCalls: callsCount,
    whatsappClicks: waCount,
    directionsClicks: gpsCount,
    googleReviewsClicks: revCount,
    sharesCount: shareCount,
    weeklyGrowth: currentRestaurant.stats?.weeklyGrowth || 24,
    conversionRate: parseFloat(conversionPct),
    avgReadTimeSeconds: 165,
    lunchServicePercent: 58,
    dinnerServicePercent: 42,
    mobileDevicePercent: 96.8,
    estimatedRevenueEuros: estRevenue,
    paperSaved: paperSaved,
    topDishes: topDishesList,
    scansByDay: weeklyScansList,
    popularFilters: [
      { filter: 'Sin Gluten (Celíacos)', percentage: 44 },
      { filter: 'Vegano / Vegetariano', percentage: 28 },
      { filter: 'Sin Lactosa', percentage: 18 },
      { filter: 'Pescados & Mariscos', percentage: 10 },
    ],
  };

  // ==========================================================================
  // VIEW 1: LOGIN SCREEN (IF NO ACTIVE SESSION)
  // ==========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white px-4 py-8 flex flex-col justify-center items-center">
        <div className="w-full max-w-sm space-y-6">
          {/* Logo & Branding */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-torre-600 border border-blue-400/40 flex items-center justify-center mx-auto shadow-xl shadow-blue-600/30">
              <Store className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Portal Gastro<span className="text-torre-500">Torre</span>
            </h1>
            <p className="text-xs text-slate-400">
              Acceso privado para Hosteleros y Administración
            </p>
          </div>

          {/* Secure Login Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-300">
                Inicio de Sesión Seguro (SSL 256-bit)
              </span>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="admin@gastrotorre.es / tu-restaurante"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                  <User className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-torre-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    {showPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-torre-600 hover:bg-torre-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-oro-400" />
                <span>Entrar al Panel</span>
              </button>
            </form>

            {/* Anti-Spam / Registration Notice */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                🛡️ <strong>Registro cerrado por seguridad:</strong> Las cuentas son creadas y autorizadas únicamente por la administración para evitar spam.
              </p>
            </div>
          </div>

          {/* Preset Buttons for Quick Demo Testing */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
            <span className="text-[10px] font-bold text-oro-400 uppercase tracking-wider block text-center">
              ⚡ Accesos de Prueba Rápidos:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('admin@gastrotorre.es', 'wEyzye9b')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-torre-900/50 border border-slate-700 hover:border-torre-500 text-[11px] font-bold text-left transition-all"
              >
                <div className="text-oro-400 flex items-center gap-1">
                  <span>👑 Superadmin</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono">admin / wEyzye9b</div>
              </button>

              <button
                onClick={() => handleQuickLogin('jarales@gastrotorre.es', 'Jarales2026!')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-torre-900/50 border border-slate-700 hover:border-torre-500 text-[11px] font-bold text-left transition-all"
              >
                <div className="text-white flex items-center gap-1">
                  <span>🥩 Los Jarales</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono">jarales / Jarales2026!</div>
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Volver a la portada de Torrelodones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 2: SUPERADMIN MASTER PANEL (IF currentUser.role === 'superadmin')
  // ==========================================================================
  if (currentUser.role === 'superadmin') {
    return (
      <div className="space-y-5 px-4 py-6 bg-slate-900 min-h-screen text-slate-100">
        {/* Superadmin Header Bar */}
        <div className="bg-gradient-to-r from-torre-950 via-slate-900 to-black p-5 rounded-3xl border border-torre-800/80 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 text-xl">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                    Superadmin Master
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Base de Datos Activa
                  </span>
                </div>
                <h1 className="text-lg font-black text-white">
                  Panel de Control Maestro — Ángel Ruiz
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Link
                href="/"
                target="_blank"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
              >
                Ver Web
              </Link>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Restaurantes</span>
              <span className="text-lg font-black text-white">{restaurants.length}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Cuentas Clientes</span>
              <span className="text-lg font-black text-amber-400">{accounts.filter(a => a.role === 'owner').length}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Leads Nuevos</span>
              <span className="text-lg font-black text-emerald-400">{leadsList.length}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">Total Platos</span>
              <span className="text-lg font-black text-torre-400">
                {restaurants.reduce((acc, r) => acc + (r.menu?.reduce((cAcc, c) => cAcc + (c.dishes?.length || 0), 0) || 0), 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Superadmin Navigation Tabs */}
        <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 flex gap-1 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setAdminTab('restaurants')}
            className={`flex-1 min-w-[110px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              adminTab === 'restaurants'
                ? 'bg-torre-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Building2 className="w-4 h-4 text-oro-400" />
            <span>Restaurantes ({restaurants.length})</span>
          </button>

          <button
            onClick={() => setAdminTab('accounts')}
            className={`flex-1 min-w-[110px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              adminTab === 'accounts'
                ? 'bg-torre-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Cuentas & Claves</span>
          </button>

          <button
            onClick={() => setAdminTab('onboard')}
            className={`flex-1 min-w-[110px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              adminTab === 'onboard'
                ? 'bg-torre-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>+ Dar de Alta Local</span>
          </button>

          <button
            onClick={() => setAdminTab('leads')}
            className={`flex-1 min-w-[90px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all relative ${
              adminTab === 'leads'
                ? 'bg-torre-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>Leads</span>
            {leadsList.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                {leadsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab('stats')}
            className={`flex-1 min-w-[95px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all relative ${
              adminTab === 'stats'
                ? 'bg-torre-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-oro-400" />
            <span>Métricas</span>
          </button>
        </div>

        {/* TAB 1: RESTAURANTES LIST & IMPERSONATION */}
        {adminTab === 'restaurants' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Directorio de Restaurantes en Base de Datos
              </h3>
              <button
                onClick={() => setAdminTab('onboard')}
                className="px-3 py-1.5 rounded-xl bg-torre-600 hover:bg-torre-500 text-white text-xs font-bold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Restaurante</span>
              </button>
            </div>

            <div className="space-y-3">
              {restaurants.map((rest) => {
                const totalDishes = rest.menu?.reduce((acc, cat) => acc + (cat.dishes?.length || 0), 0) || 0;
                return (
                  <div
                    key={rest.id || rest.slug}
                    className="bg-slate-800/90 border border-slate-700 p-4 rounded-3xl shadow-soft space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rest.coverImage || rest.logoImage}
                          alt={rest.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-600 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white">{rest.name}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-torre-900/60 text-torre-300 border border-torre-700/60">
                              {rest.zone}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {rest.cuisine} • {totalDishes} platos en carta • Aforo: {rest.capacity || 50} pax
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/restaurante/${rest.slug}`}
                          target="_blank"
                          className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                          title="Ver Carta Pública"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el restaurante "${rest.name}" de la base de datos?`)) {
                              deleteRestaurant(rest.id || rest.slug);
                              triggerToast(`Restaurante "${rest.name}" eliminado`);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                          title="Eliminar Restaurante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/80 text-xs">
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>📞 {rest.phone}</span>
                        <span>•</span>
                        <span>💬 {rest.whatsapp}</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedRestId(rest.slug || rest.id);
                          // Temporarily impersonate as this restaurant's manager view
                          const mockOwnerUser = {
                            id: `usr-${rest.slug}`,
                            email: `${rest.slug}@gastrotorre.es`,
                            username: rest.slug,
                            passwordHash: 'impersonated',
                            name: rest.name,
                            role: 'owner' as const,
                            restaurantId: rest.id || rest.slug,
                            restaurantSlug: rest.slug,
                            restaurantName: rest.name,
                            createdAt: new Date().toISOString(),
                            isActive: true,
                          };
                          login(mockOwnerUser.username, mockOwnerUser.passwordHash);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-amber-500/20"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Carta & Platos</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ACCOUNTS & PASSWORDS MANAGER */}
        {adminTab === 'accounts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Cuentas de Hosteleros & Claves de Acceso
                </h3>
                <p className="text-xs text-slate-400">
                  Solo tú puedes cambiar contraseñas y crear nuevos accesos.
                </p>
              </div>

              <button
                onClick={() => setShowNewAccountModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>+ Nueva Cuenta</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-slate-800/90 border border-slate-700 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{acc.name}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        acc.role === 'superadmin'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}>
                        {acc.role === 'superadmin' ? '👑 Superadmin' : 'Hostelero'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
                      <span>Email: <strong className="text-slate-200">{acc.email}</strong></span>
                      <span>•</span>
                      <span>Usuario: <strong className="text-slate-200">{acc.username}</strong></span>
                      <span>•</span>
                      <span>Clave: <strong className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded">{acc.passwordHash}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingUserId(acc.id);
                        setNewPasswordInput(acc.passwordHash);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cambiar Clave</span>
                    </button>

                    {acc.role !== 'superadmin' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la cuenta de ${acc.name}?`)) {
                            deleteHosteleroAccount(acc.id);
                            triggerToast('Cuenta eliminada');
                          }
                        }}
                        className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                        title="Eliminar Cuenta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ONBOARD NEW RESTAURANT WIZARD */}
        {adminTab === 'onboard' && (
          <form onSubmit={handleOnboardRestaurantSubmit} className="bg-slate-800/90 border border-slate-700 p-5 rounded-3xl space-y-4">
            <div className="border-b border-slate-700 pb-3">
              <h3 className="text-base font-black text-white">
                Dar de Alta un Nuevo Restaurante en Torrelodones
              </h3>
              <p className="text-xs text-slate-400">
                Crea el perfil del restaurante y sus credenciales de acceso para el dueño.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Restaurante *</label>
                <input
                  type="text"
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  placeholder="Ej: Taberna El Guadarrama"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Eslogan / Frase</label>
                <input
                  type="text"
                  value={newRestTagline}
                  onChange={(e) => setNewRestTagline(e.target.value)}
                  placeholder="Ej: Cocina de montaña y tapas de autor"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Zona en Torrelodones</label>
                <select
                  value={newRestZone}
                  onChange={(e) => setNewRestZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-torre-500"
                >
                  <option value="Torrelodones Pueblo">Torrelodones Pueblo</option>
                  <option value="Torrelodones Colonia">Torrelodones Colonia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Cocina</label>
                <input
                  type="text"
                  value={newRestCuisine}
                  onChange={(e) => setNewRestCuisine(e.target.value)}
                  placeholder="Ej: Asador, Tapas, Pizzería..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono de Reservas</label>
                <input
                  type="text"
                  value={newRestPhone}
                  onChange={(e) => setNewRestPhone(e.target.value)}
                  placeholder="+34 918 00 00 00"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp de Reservas</label>
                <input
                  type="text"
                  value={newRestWhatsApp}
                  onChange={(e) => setNewRestWhatsApp(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">Dirección Exacta</label>
                <input
                  type="text"
                  value={newRestAddress}
                  onChange={(e) => setNewRestAddress(e.target.value)}
                  placeholder="Ej: Calle Real, 25, 28250 Torrelodones"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <label className="block text-xs font-black text-amber-400">
                  🔑 Contraseña Inicial para el Hostelero
                </label>
                <input
                  type="text"
                  value={newRestOwnerPass}
                  onChange={(e) => setNewRestOwnerPass(e.target.value)}
                  placeholder="Ej: Guadarrama2026!"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-400">
                  El usuario de acceso será generado automáticamente como el nombre simplificado (ej: <code className="text-amber-300">taberna-el-guadarrama</code>).
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-torre-600 hover:bg-torre-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-oro-400" />
              <span>Dar de Alta Restaurante en Base de Datos</span>
            </button>
          </form>
        )}

        {/* TAB 4: LEADS INBOX */}
        {adminTab === 'leads' && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Solicitudes de Nuevos Restaurantes ({leadsList.length})
            </h3>

            {leadsList.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700 text-center space-y-2">
                <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="font-bold text-xs text-slate-300">No hay solicitudes pendientes</h4>
                <p className="text-[11px] text-slate-500">Los dueños que soliciten unirse en gastrotorre.vercel.app/ventas aparecerán aquí.</p>
              </div>
            ) : (
              leadsList.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-slate-800/90 border border-slate-700 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{lead.restaurantName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                        {lead.plan}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Contacto: <strong className="text-slate-200">{lead.contactName}</strong> • Tel: {lead.phone} • Zona: {lead.zone}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${lead.contactName}, te escribo de GastroTorre respecto a tu solicitud para dar de alta ${lead.restaurantName}. ¿Cuándo te viene bien que hablemos?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contactar WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: SUPERADMIN GLOBAL METRICS ACROSS TORRELODONES */}
        {adminTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-torre-950 via-slate-900 to-slate-800 border border-torre-800/60 p-5 rounded-3xl shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div>
                  <span className="text-[10px] font-black text-oro-400 uppercase tracking-wider block">
                    👑 Vista de Control Maestro · Torrelodones
                  </span>
                  <h3 className="text-base font-black text-white">
                    Métricas Globales de la Red GastroTorre
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+28.4% Crecimiento Mensual</span>
                  </span>
                </div>
              </div>

              {/* Top Municipality KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Lecturas Totales QR</span>
                  <span className="text-2xl font-black text-white block mt-0.5">
                    {restaurants.reduce((acc, r) => acc + (r.stats?.monthlyViews || 1280), 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">94% Escaneos en mesa</span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Acciones de Reserva</span>
                  <span className="text-2xl font-black text-oro-400 block mt-0.5">
                    {restaurants.reduce((acc, r) => acc + (r.stats?.monthlyBookings || 180), 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Llamadas + WhatsApp</span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Impacto Económico</span>
                  <span className="text-2xl font-black text-emerald-300 block mt-0.5">
                    ~{(restaurants.length * 3240).toLocaleString()} €
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Facturación generada</span>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Cartas de Papel Ahorradas</span>
                  <span className="text-2xl font-black text-blue-300 block mt-0.5">
                    ~{(restaurants.length * 420).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-blue-400 font-bold">Reducción CO2 y costes</span>
                </div>
              </div>

              {/* Leaderboard of Restaurants */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  Rendimiento por Restaurante Asociado
                </h4>

                <div className="space-y-2">
                  {restaurants.map((rest, idx) => {
                    const views = rest.stats?.monthlyViews || (1450 - idx * 220);
                    const conv = (28.4 - idx * 1.8).toFixed(1);
                    return (
                      <div
                        key={rest.id || rest.slug}
                        className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-oro-400 text-xs font-black flex items-center justify-center shrink-0 border border-slate-700">
                            #{idx + 1}
                          </span>
                          <div className="truncate">
                            <h5 className="text-xs font-black text-white truncate">{rest.name}</h5>
                            <span className="text-[10px] text-slate-400">{rest.zone} • {rest.cuisine}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-right">
                          <div>
                            <span className="text-xs font-black text-white block">{views.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400">lecturas / mes</span>
                          </div>
                          <div>
                            <span className="text-xs font-black text-oro-400 block">{conv}%</span>
                            <span className="text-[9px] text-slate-400">conversión</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASSWORD RESET MODAL */}
        {editingUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-black text-white">Cambiar Contraseña de Cliente</h3>
                <button
                  onClick={() => setEditingUserId(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nueva Contraseña para este Hostelero:
                  </label>
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Escribe la nueva contraseña..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all"
                  >
                    Guardar Clave
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE NEW HOSTELERO ACCOUNT MODAL */}
        {showNewAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-black text-white">Crear Nueva Cuenta de Hostelero</h3>
                <button
                  onClick={() => setShowNewAccountModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAccountSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Restaurante Asignado *</label>
                  <select
                    value={newAccRestSlug}
                    onChange={(e) => setNewAccRestSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-torre-500"
                  >
                    {restaurants.map((r) => (
                      <option key={r.slug} value={r.slug}>
                        {r.name} ({r.zone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email de Acceso *</label>
                  <input
                    type="email"
                    value={newAccEmail}
                    onChange={(e) => setNewAccEmail(e.target.value)}
                    placeholder="dueno@restaurante.es"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Usuario Corto *</label>
                  <input
                    type="text"
                    value={newAccUsername}
                    onChange={(e) => setNewAccUsername(e.target.value)}
                    placeholder="ej: jarales"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Contraseña *</label>
                  <input
                    type="text"
                    value={newAccPass}
                    onChange={(e) => setNewAccPass(e.target.value)}
                    placeholder="ClaveSecreta2026!"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAccountModal(false)}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 rounded-xl bg-torre-600 hover:bg-torre-500 text-white text-xs font-black transition-all"
                  >
                    Crear Cuenta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // VIEW 3: DEDICATED HOSTELERO DASHBOARD (IF currentUser.role === 'owner')
  // ==========================================================================
  return (
    <div className="space-y-4 px-4 py-5 bg-slate-50 min-h-screen">
      {/* Top Admin Branding Card */}
      <div className="bg-gradient-to-br from-torre-950 via-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-float border border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-torre-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-oro-400 tracking-wider">
                  Panel de {currentRestaurant.name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  🟢 Sesión Activa
                </span>
              </div>
              <h1 className="text-base font-black text-white leading-tight">
                Gestor de Carta Digital, Menú del Día & QR
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href={`/restaurante/${currentRestaurant.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-oro-400" />
              <span>Ver Carta en Vivo</span>
            </Link>

            <button
              onClick={logout}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccess && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 animate-fadeIn">
          <Check className="w-4 h-4 text-white shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Sleek Navigation Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200/90 shadow-soft flex gap-1 text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 min-w-[70px] py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'menu'
              ? 'bg-torre-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-oro-400" />
          <span>Platos</span>
        </button>

        <button
          onClick={() => setActiveTab('daily-menu')}
          className={`flex-1 min-w-[85px] py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'daily-menu'
              ? 'bg-torre-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Menú Día</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 min-w-[75px] py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'stats'
              ? 'bg-torre-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-oro-400" />
          <span>Métricas</span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 min-w-[65px] py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'info'
              ? 'bg-torre-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-oro-400" />
          <span>Datos</span>
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 min-w-[55px] py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'qr'
              ? 'bg-torre-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-oro-400" />
          <span>QR</span>
        </button>
      </div>

      {/* TAB 1: MENU & DISHES */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 p-3.5 rounded-2xl border border-torre-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-slate-900 font-medium">
              💡 Toca la <strong className="font-bold text-torre-700">foto del plato 📷</strong> para cambiarla o seleccionar de la galería gourmet.
            </p>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95 shrink-0"
            >
              <FolderPlus className="w-4 h-4 text-oro-400" />
              <span>+ Nueva Sección</span>
            </button>
          </div>

          {currentRestaurant.menu.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-soft p-4 space-y-3.5"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">{category.name}</h3>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Seguro que deseas eliminar la sección "${category.name}"?`)) {
                          deleteCategory(currentRestaurant.id, category.id);
                          triggerToast('Sección eliminada');
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Eliminar sección"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {category.description && (
                    <p className="text-[11px] text-slate-500">{category.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleOpenAddDish(category.id)}
                  className="flex items-center gap-1 text-xs font-bold text-torre-600 hover:text-torre-700 bg-torre-50 hover:bg-torre-100 px-3 py-1.5 rounded-xl border border-torre-200/60 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Plato</span>
                </button>
              </div>

              {/* Dishes List */}
              <div className="space-y-2.5">
                {category.dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      dish.isAvailable
                        ? 'bg-white border-slate-200/80 shadow-xs'
                        : 'bg-slate-100/80 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() =>
                          setEditingPhotoDish({
                            dishId: dish.id,
                            categoryId: category.id,
                            dishName: dish.name,
                            currentImage: dish.image,
                          })
                        }
                        className="relative w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/80 cursor-pointer group hover:ring-2 hover:ring-torre-500 transition-all"
                        title="Cambiar foto del plato"
                      >
                        {dish.image ? (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                            <Camera className="w-5 h-5" />
                            <span className="text-[8px] font-bold mt-0.5">+ Foto</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {dish.name}
                            </h4>
                            {dish.isSpecialty && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                                ⭐ Estrella
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-black text-torre-700 shrink-0">
                            {dish.price.toFixed(2)} €
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {dish.description || 'Sin descripción'}
                        </p>

                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          {dish.allergens && dish.allergens.length > 0 ? (
                            dish.allergens.map((alg) => (
                              <span
                                key={alg}
                                className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase"
                              >
                                {alg}
                              </span>
                            ))
                          ) : (
                            <span className="text-[9px] text-slate-400 italic">Sin alérgenos marcados</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => toggleDishAvailability(currentRestaurant.id, category.id, dish.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                          dish.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            dish.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        ></span>
                        <span>{dish.isAvailable ? 'Disponible' : 'Agotado (Ocultar)'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditDish(category.id, dish)}
                          className="text-slate-600 hover:text-torre-600 font-bold text-[11px] flex items-center gap-1 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar "${dish.name}" de la carta?`)) {
                              deleteDish(currentRestaurant.id, category.id, dish.id);
                              triggerToast('Plato eliminado');
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar plato"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}



      {/* TAB 2: DAILY MENU */}
      {activeTab === 'daily-menu' && (
        <form onSubmit={handleSaveDailyMenu} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">Menú del Día</h3>
              <p className="text-[11px] text-slate-500">Actualiza tus platos del día en 30 segundos.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dailyMenuActive}
                onChange={(e) => setDailyMenuActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-torre-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Precio del Menú (€)</label>
            <input
              type="number"
              step="0.10"
              value={dailyMenuPrice}
              onChange={(e) => setDailyMenuPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primeros Platos (1 por línea)</label>
            <textarea
              rows={3}
              value={dailyMenuFirstCourses}
              onChange={(e) => setDailyMenuFirstCourses(e.target.value)}
              placeholder="Ej: Salmorejo cordobés con jamón ibérico"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Segundos Platos (1 por línea)</label>
            <textarea
              rows={3}
              value={dailyMenuSecondCourses}
              onChange={(e) => setDailyMenuSecondCourses(e.target.value)}
              placeholder="Ej: Entrecot a la brasa con patatas panadera"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Postres (1 por línea)</label>
            <textarea
              rows={2}
              value={dailyMenuDesserts}
              onChange={(e) => setDailyMenuDesserts(e.target.value)}
              placeholder="Ej: Tarta de queso casera"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Publicar Menú del Día</span>
          </button>
        </form>
      )}

      {/* TAB 3: RICH STATS & ACTIONABLE METRICS DASHBOARD */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* SECTION 1: TOP 4 KEY PERFORMANCE METRICS */}
          <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl space-y-6 border border-slate-800">
            {/* Header & Period Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                    Panel de Rendimiento & Analítica
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>En Vivo</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Métricas de {currentRestaurant.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Datos reales de comensales escaneando tu carta y consultando tu restaurante.
                </p>
              </div>

              {/* Period Filter Selector */}
              <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setMetricsPeriod('30d')}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    metricsPeriod === '30d'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30 días
                </button>
                <button
                  type="button"
                  onClick={() => setMetricsPeriod('weekend')}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    metricsPeriod === 'weekend'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fines de semana
                </button>
                <button
                  type="button"
                  onClick={() => setMetricsPeriod('all')}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    metricsPeriod === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Total acumulado
                </button>
              </div>
            </div>

            {/* 4 Spacious KPI Cards in 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Scans & Reads */}
              <div className="bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700/80 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="text-slate-300 uppercase tracking-wider text-[11px]">Lecturas de Carta</span>
                  <span className="text-emerald-400 font-black text-xs bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>+{stats.weeklyGrowth}% este mes</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-black text-white block">
                    {stats.monthlyViews.toLocaleString()}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Total de veces que comensales abrieron la carta digital de tu restaurante.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-700/60 flex items-center gap-3 text-xs text-slate-300">
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                    📱 <strong className="text-white">{stats.monthlyQrScans}</strong> QR en mesa
                  </span>
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                    🌐 <strong className="text-white">{stats.monthlyWebReads}</strong> web directa
                  </span>
                </div>
              </div>

              {/* Unique Diners */}
              <div className="bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700/80 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="text-slate-300 uppercase tracking-wider text-[11px]">Comensales Únicos</span>
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-black text-white block">
                    ~{stats.uniqueVisitors.toLocaleString()}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clientes distintos que han consultado tus platos y precios.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                  <span className="text-amber-300 font-bold">Sin aplicaciones que descargar</span>
                  <span className="text-slate-400">Acceso 100% instantáneo</span>
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="bg-slate-800/90 p-5 sm:p-6 rounded-2xl border border-slate-700/80 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="text-slate-300 uppercase tracking-wider text-[11px]">Tasa de Interacción</span>
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 block">
                    {stats.conversionRate}%
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Porcentaje de comensales que llaman, piden por WhatsApp o solicitan ruta GPS.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                  <span className="text-emerald-300 font-bold">Alta conversión</span>
                  <span className="text-slate-400">1 de cada 3.5 comensales actúa</span>
                </div>
              </div>

              {/* Estimated Value ROI */}
              <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-slate-800/90 p-5 sm:p-6 rounded-2xl border border-amber-500/40 space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
                  <span className="text-amber-300 uppercase tracking-wider text-[11px]">Facturación Estimada en Sala</span>
                  <div className="w-7 h-7 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl font-black text-amber-300 block">
                    ~{stats.estimatedRevenueEuros.toLocaleString()} €
                  </span>
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    Volumen económico estimado en comandas generadas a través de la carta.
                  </p>
                </div>
                <div className="pt-2 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-200 font-bold">
                  <span>Retorno de inversión:</span>
                  <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black text-xs">
                    ROI 55x
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONVERSION FUNNEL & DIRECT ACTIONS */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🎯 Acciones Directas de Comensales</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contactos e intenciones reales de visita generadas desde tu carta digital.
                </p>
              </div>
              <span className="text-xs font-black text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 self-start sm:self-auto">
                {totalActionsCount} acciones totales registradas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone calls */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Llamadas a Sala</h4>
                    <p className="text-xs text-slate-500">Clics directos en el botón de llamar</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900">{stats.phoneCalls}</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">Reservas telefónicas</span>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/90 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950">WhatsApp Reservas</h4>
                    <p className="text-xs text-emerald-700">Conversaciones iniciadas por clientes</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-emerald-900">{stats.whatsappClicks}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">Consultas directas</span>
                </div>
              </div>

              {/* GPS Navigation */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200/90 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-indigo-950">Rutas GPS (Cómo Llegar)</h4>
                    <p className="text-xs text-indigo-700">Comensales navegando hacia tu local</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-indigo-200/60 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-indigo-900">{stats.directionsClicks}</span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-lg">Google Maps activado</span>
                </div>
              </div>

              {/* Google Reviews Booster & Shares */}
              <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/90 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-950">Reseñas 5⭐ en Google</h4>
                    <p className="text-xs text-amber-700">Reputación y viralidad online</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-200/60 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-amber-900">{stats.googleReviewsClicks}</span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">
                    {stats.sharesCount} compartidos en redes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: PEAK DAYS DISTRIBUTION */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-soft space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Afluencia por Día de la Semana</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Volumen de lecturas de carta en mesa según cada día de la semana.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {stats.scansByDay.map((item) => {
                const maxCount = Math.max(...stats.scansByDay.map((s) => s.count));
                const percentage = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.day} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${item.isPeak ? 'text-amber-700 font-black text-sm' : 'text-slate-700'}`}>
                        {item.day} {item.isPeak && '🔥 (Día de mayor afluencia)'}
                      </span>
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {item.count} lecturas
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden relative p-0.5">
                      <div
                        className={`h-full rounded-lg transition-all duration-500 ${
                          item.isPeak
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: SERVICE HOURS & DINER PREFERENCES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Service Hours: Lunch vs Dinner */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-soft space-y-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Servicio Comidas vs Cenas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Franja horaria en la que tus clientes consultan la carta.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  {/* Lunch Service */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">☀️</span>
                        <div>
                          <h4 className="font-black text-amber-950 text-sm">Servicio de Comidas</h4>
                          <span className="text-xs text-amber-700">13:30 - 16:30 (Hora punta: 14:15h)</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-amber-900">{stats.lunchServicePercent}%</span>
                    </div>
                    <div className="w-full bg-amber-200/70 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.lunchServicePercent}%` }}></div>
                    </div>
                  </div>

                  {/* Dinner Service */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🌙</span>
                        <div>
                          <h4 className="font-black text-indigo-950 text-sm">Servicio de Cenas</h4>
                          <span className="text-xs text-indigo-700">20:30 - 23:45 (Hora punta: 21:45h)</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-indigo-900">{stats.dinnerServicePercent}%</span>
                    </div>
                    <div className="w-full bg-indigo-200/70 h-3 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${stats.dinnerServicePercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time reading & Mobile Device breakdown */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 block font-bold">Tiempo Medio en Carta</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">2 min 45 s</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <span className="text-xs text-slate-500 block font-bold">Dispositivos Móviles</span>
                  <span className="text-base font-black text-emerald-600 mt-0.5 block">96.8% en mesa</span>
                </div>
              </div>
            </div>

            {/* Health & Dietary Filters Demand */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-soft space-y-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Filtros Dietéticos Usados</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Demanda de alérgenos y dietas especiales entre tus comensales.
                  </p>
                </div>

                <div className="space-y-3.5 pt-4">
                  {stats.popularFilters.map((filt) => (
                    <div key={filt.filter} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{filt.filter}</span>
                        <span className="font-black text-blue-600 text-sm">{filt.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${filt.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sustainability & Cost Saving Alert */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>Ahorro en Impresión de Cartas</span>
                  </span>
                  <span className="text-sm font-black text-emerald-900">~{stats.paperSaved} cartas evitadas</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Ahorro trimestral estimado en papel: <strong className="text-emerald-950 font-black">~140 € / trimestre</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESTAURANT INFO & SCHEDULE CONTROLS */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          {/* 1-CLICK EMERGENCY / TEMPORARY CLOSURE CARD */}
          <div className={`p-5 rounded-3xl border transition-all ${
            isTemporarilyClosed 
              ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800' 
              : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isTemporarilyClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                    {isTemporarilyClosed ? 'Restaurante Cerrado Temporalmente' : 'Restaurante Abierto al Público'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {isTemporarilyClosed 
                    ? `Los comensales ven el aviso: "${closedReason}"`
                    : 'Tu local opera según el horario habitual de apertura configurado.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleTemporaryClosure}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                  isTemporarilyClosed
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                }`}
              >
                {isTemporarilyClosed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>🟢 Reabrir Restaurante Ahora</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>⛔ Cerrar Hoy por Asuntos Propios</span>
                  </>
                )}
              </button>
            </div>

            {/* Closure reason editor & quick presets */}
            <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Motivo del Cierre Temporal (se muestra en tu carta digital y directorio):
              </label>
              
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  'Cerrado hoy por asuntos propios',
                  'Cerrado por descanso de plantilla',
                  'Cerrado por vacaciones',
                  'Cerrado por reformas / mantenimiento',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setClosedReason(preset);
                      if (isTemporarilyClosed) {
                        updateRestaurant(currentRestaurant.id, {
                          schedule: {
                            ...currentRestaurant.schedule,
                            isTemporarilyClosed: true,
                            closedReason: preset,
                          },
                        });
                        triggerToast(`Motivo actualizado a: "${preset}"`);
                      }
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                      closedReason === preset
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={closedReason}
                onChange={(e) => setClosedReason(e.target.value)}
                placeholder="Ej: Cerrado hoy por asuntos propios"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-torre-500"
              />
            </div>
          </div>

          {/* MAIN RESTAURANT INFO & SCHEDULE FORM */}
          <form onSubmit={handleSaveInfo} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900">Horarios y Datos del Restaurante</h3>
              <p className="text-[11px] text-slate-500">Configura tus horas de apertura e información visible para los comensales.</p>
            </div>

            {/* SCHEDULE SECTION */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Horario Habitual de Apertura</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Días de Apertura</label>
                <input
                  type="text"
                  name="scheduleDays"
                  value={scheduleDays}
                  onChange={(e) => setScheduleDays(e.target.value)}
                  placeholder="Ej: Martes a Domingo (o Lunes a Domingo)"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Si cierras los lunes, pon: <strong className="text-slate-700">Martes a Domingo</strong>. Si cierras lunes y martes: <strong className="text-slate-700">Miércoles a Domingo</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horario Comidas / Mediodía</label>
                  <input
                    type="text"
                    name="scheduleLunch"
                    value={scheduleLunch}
                    onChange={(e) => setScheduleLunch(e.target.value)}
                    placeholder="Ej: 13:30 - 16:30"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horario Cenas / Noche (opcional)</label>
                  <input
                    type="text"
                    name="scheduleDinner"
                    value={scheduleDinner}
                    onChange={(e) => setScheduleDinner(e.target.value)}
                    placeholder="Ej: 20:30 - 23:30"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  />
                </div>
              </div>
            </div>

            {/* BASIC INFO */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Local</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={currentRestaurant.name}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Frase / Eslogan</label>
                <input
                  type="text"
                  name="tagline"
                  defaultValue={currentRestaurant.tagline}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono de Reservas</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={currentRestaurant.phone}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    defaultValue={currentRestaurant.whatsapp}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={currentRestaurant.address}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Zona</label>
                  <select
                    name="zone"
                    defaultValue={currentRestaurant.zone || 'Torrelodones Pueblo'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  >
                    <option value="Torrelodones Pueblo">Torrelodones Pueblo</option>
                    <option value="Torrelodones Colonia">Torrelodones Colonia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Aforo / Capacidad Máxima de Comensales (opcional)</label>
                <input
                  type="number"
                  name="capacity"
                  defaultValue={currentRestaurant.capacity || ''}
                  placeholder="Ej: 80"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Todos los Cambios de Horario y Local</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: QR GENERATOR */}
      {activeTab === 'qr' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-torre-50 text-torre-600 flex items-center justify-center mx-auto">
            <QrCode className="w-6 h-6 text-torre-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Código QR de tu Mesa</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
              Descarga tu caballete de mesa en alta resolución para colocarlo en tu restaurante.
            </p>
          </div>

          <button
            onClick={() => setIsQrOpen(true)}
            className="px-5 py-3 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all active:scale-95 inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-oro-400" />
            <span>Ver y Descargar Caballete QR</span>
          </button>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">Nueva Sección de la Carta</h3>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la sección *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Postres Artesanos..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  Crear Sección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD/EDIT DISH MODAL */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">
                {editingDish ? 'Editar Plato' : 'Añadir Plato a la Carta'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDishModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDishSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del plato *</label>
                <input
                  type="text"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="Ej: Croquetas de Jamón Ibérico"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Precio (€) *</label>
                  <input
                    type="number"
                    step="0.10"
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    placeholder="14.50"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Foto URL (Opcional)</label>
                  <input
                    type="url"
                    value={newDishImage}
                    onChange={(e) => setNewDishImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción / Ingredientes</label>
                <textarea
                  rows={2}
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Ingredientes principales..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  Guardar Plato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISH PHOTO MODAL */}
      {editingPhotoDish && (
        <DishPhotoModal
          isOpen={!!editingPhotoDish}
          onClose={() => setEditingPhotoDish(null)}
          dishName={editingPhotoDish.dishName}
          currentImage={editingPhotoDish.currentImage}
          onSavePhoto={handleSaveDishPhoto}
        />
      )}

      {/* QR Modal */}
      {isQrOpen && (
        <QRModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          restaurant={currentRestaurant}
        />
      )}
    </div>
  );
}
