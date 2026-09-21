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
  User
} from 'lucide-react';
import { QRModal } from '@/components/QRModal';
import { DishPhotoModal } from '@/components/DishPhotoModal';
import { JoinGastroTorreModal } from '@/components/JoinGastroTorreModal';
import { DossierModal } from '@/components/DossierModal';
import { Dish, initialRestaurants } from '@/data/restaurants';
import { FOOD_PHOTO_PRESETS } from '@/data/photoPresets';
import { OFFICIAL_ALLERGENS } from '@/data/allergens';
import { DEMO_HOSTELEROS } from '@/lib/database/dbService';

export default function AdminPage() {
  const { 
    restaurants, 
    currentUser,
    reservations,
    isCloudConnected,
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
    resetAllData 
  } = useRestaurants();

  const [selectedRestId, setSelectedRestId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'menu' | 'daily-menu' | 'reservations' | 'stats' | 'info' | 'qr' | 'help'>('menu');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedMessage, setSavedMessage] = useState('¡Cambios guardados con éxito!');
  const [mounted, setMounted] = useState(false);

  // Reservation filters
  const [resFilter, setResFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [showAddResModal, setShowAddResModal] = useState(false);
  const [resCustName, setResCustName] = useState('');
  const [resCustPhone, setResCustPhone] = useState('');
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('14:30');
  const [resPax, setResPax] = useState('2');
  const [resNotes, setResNotes] = useState('');

  // Daily Menu state
  const [dailyMenuActive, setDailyMenuActive] = useState(false);
  const [dailyMenuPrice, setDailyMenuPrice] = useState('13.50');
  const [dailyMenuFirstCourses, setDailyMenuFirstCourses] = useState('');
  const [dailyMenuSecondCourses, setDailyMenuSecondCourses] = useState('');
  const [dailyMenuDesserts, setDailyMenuDesserts] = useState('');
  const [dailyMenuIncludes, setDailyMenuIncludes] = useState('Incluye primer plato, segundo, pan, bebida y postre o café.');
  const [dailyMenuNotes, setDailyMenuNotes] = useState('Disponible de Lunes a Viernes de 13:30 a 16:30.');

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
    if (restaurants.length > 0 && !selectedRestId) {
      setSelectedRestId(currentUser?.restaurantId || restaurants[0].id);
    }
  }, [restaurants, selectedRestId, currentUser]);

  const currentRestaurant = 
    restaurants.find((r) => r.id === selectedRestId) || 
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
  }, [currentRestaurant?.id]);

  const triggerToast = (msg: string) => {
    setSavedMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
      zone: formData.get('zone') as string,
      googleMapsUrl: formData.get('googleMapsUrl') as string,
      capacity: capacityVal,
      schedule: {
        days: (formData.get('scheduleDays') as string) || currentRestaurant.schedule.days,
        lunch: (formData.get('scheduleLunch') as string) || currentRestaurant.schedule.lunch,
        dinner: (formData.get('scheduleDinner') as string) || undefined,
      },
    });
    triggerToast('¡Datos del restaurante actualizados!');
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

  const handleCreateManualReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resCustName || !resCustPhone) return;

    await createReservation({
      restaurantId: currentRestaurant.id,
      customerName: resCustName,
      customerPhone: resCustPhone,
      reservationDate: resDate,
      reservationTime: resTime,
      partySize: parseInt(resPax) || 2,
      status: 'confirmed',
      specialNotes: resNotes.trim() || undefined,
    });

    setShowAddResModal(false);
    setResCustName('');
    setResCustPhone('');
    setResNotes('');
    triggerToast('¡Reserva añadida al libro de mesas!');
  };

  const currentReservations = reservations.filter((r) => r.restaurantId === currentRestaurant.id);
  const filteredReservations = currentReservations.filter((r) => {
    if (resFilter === 'all') return true;
    return r.status === resFilter;
  });

  const pendingCount = currentReservations.filter((r) => r.status === 'pending').length;

  const stats = currentRestaurant.stats || {
    monthlyViews: 480,
    monthlyBookings: currentReservations.length + 28,
    weeklyGrowth: 18,
    topDishes: [
      { name: currentRestaurant.menu[0]?.dishes[0]?.name || 'Plato Estrella', views: 195 },
      { name: currentRestaurant.menu[0]?.dishes[1]?.name || 'Sugerencia del Chef', views: 140 },
      { name: currentRestaurant.menu[1]?.dishes[0]?.name || 'Especialidad', views: 110 },
    ],
    scansByDay: [
      { day: 'Lun', count: 18 },
      { day: 'Mar', count: 35 },
      { day: 'Mié', count: 48 },
      { day: 'Jue', count: 62 },
      { day: 'Vie', count: 115 },
      { day: 'Sáb', count: 135 },
      { day: 'Dom', count: 88 },
    ],
  };

  return (
    <div className="space-y-4 px-4 py-5 bg-slate-50 min-h-screen">
      {/* Top Admin Branding & Cloud Status Card */}
      <div className="bg-gradient-to-br from-torre-950 via-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-float border border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-torre-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-oro-400 tracking-wider">
                  Panel de Hosteleros
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isCloudConnected 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  <Database className="w-2.5 h-2.5" />
                  <span>{isCloudConnected ? 'Supabase PostgreSQL Cloud' : 'Base de Datos Local'}</span>
                </span>
              </div>
              <h1 className="text-base font-black text-white leading-tight">
                Gestor de Carta, Reservas & QR
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <Link
              href={`/restaurante/${currentRestaurant.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-oro-400" />
              <span>Ver Carta en Vivo</span>
            </Link>
          </div>
        </div>

        {/* Hostelero account selector for pilot tests */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Restaurante activo:</span>
            <span className="text-oro-400 font-bold">Sesión: {currentRestaurant.name}</span>
          </div>
          <div className="relative">
            <select
              value={selectedRestId || currentRestaurant.id}
              onChange={(e) => {
                setSelectedRestId(e.target.value);
                switchHosteleroUser(e.target.value);
              }}
              className="w-full bg-slate-800/90 border border-slate-700 text-white text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-torre-500 transition-all appearance-none cursor-pointer"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.cuisine}) — {r.zone}
                </option>
              ))}
            </select>
            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none rotate-90" />
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
          onClick={() => setActiveTab('reservations')}
          className={`flex-1 min-w-[85px] py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all relative ${
            activeTab === 'reservations'
              ? 'bg-torre-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-oro-400" />
          <span>Reservas</span>
          {pendingCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center -ml-0.5">
              {pendingCount}
            </span>
          )}
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

        <button
          onClick={() => setActiveTab('help')}
          className={`flex-1 min-w-[60px] py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
            activeTab === 'help'
              ? 'bg-torre-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-oro-400" />
          <span>Guía</span>
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

          {currentRestaurant.menu.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-torre-50 text-torre-600 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6 text-torre-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Aún no hay secciones en tu carta</h4>
                <p className="text-xs text-slate-500 mt-0.5">Crea tu primera categoría (ej: Entrantes de la Casa, Postres Artesanos) para empezar a añadir platos.</p>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
              >
                <FolderPlus className="w-4 h-4 text-oro-400" />
                <span>Crear Primera Sección</span>
              </button>
            </div>
          ) : (
            currentRestaurant.menu.map((category) => (
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
                          if (window.confirm(`¿Seguro que deseas eliminar la sección "${category.name}" y todos sus platos asociados?`)) {
                            deleteCategory(currentRestaurant.id, category.id);
                            triggerToast('Sección eliminada');
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Eliminar esta sección"
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
                  {category.dishes.length === 0 ? (
                    <div className="text-center py-5 border border-dashed border-slate-200 rounded-2xl bg-slate-50/60">
                      <p className="text-xs text-slate-500 font-medium">Esta sección está vacía.</p>
                      <button
                        onClick={() => handleOpenAddDish(category.id)}
                        className="mt-1 text-xs font-bold text-torre-600 hover:underline"
                      >
                        + Añadir el primer plato
                      </button>
                    </div>
                  ) : (
                    category.dishes.map((dish) => (
                      <div
                        key={dish.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          dish.isAvailable
                            ? 'bg-white border-slate-200/80 shadow-xs'
                            : 'bg-slate-100/80 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Dish Photo Thumbnail & trigger */}
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
                            title="Haz clic para cambiar la fotografía de este plato"
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

                          {/* Dish Info */}
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

                            {/* Allergens & Quick Badges */}
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

                        {/* Action Buttons Row */}
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs">
                          {/* Toggle Availability Button */}
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
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: RESERVATIONS INBOX */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-torre-950 to-slate-900 text-white p-5 rounded-3xl shadow-soft space-y-3 border border-torre-900/60">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-oro-400 uppercase tracking-wider block">
                  Libro de Mesas Digital
                </span>
                <h3 className="text-base font-black text-white">
                  Gestión de Reservas en Tiempo Real
                </h3>
              </div>
              <button
                onClick={() => setShowAddResModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-torre-600 hover:bg-torre-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-oro-400" />
                <span>+ Nueva Mesa</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <span className="text-[10px] text-slate-300 block">Pendientes</span>
                <span className="text-xl font-black text-amber-400">{pendingCount}</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <span className="text-[10px] text-slate-300 block">Confirmadas</span>
                <span className="text-xl font-black text-emerald-400">
                  {currentReservations.filter((r) => r.status === 'confirmed').length}
                </span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <span className="text-[10px] text-slate-300 block">Total Registradas</span>
                <span className="text-xl font-black text-white">{currentReservations.length}</span>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setResFilter(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  resFilter === st
                    ? 'bg-torre-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st === 'all' ? 'Todas' : st === 'pending' ? 'Pendientes' : st === 'confirmed' ? 'Confirmadas' : st === 'completed' ? 'Completadas' : 'Canceladas'}
              </button>
            ))}
          </div>

          {/* Reservations List */}
          <div className="space-y-3">
            {filteredReservations.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-xs text-slate-700">No hay reservas con este filtro</h4>
                <p className="text-[11px] text-slate-400">Las solicitudes de mesa recibidas desde la web aparecerán aquí automáticamente.</p>
              </div>
            ) : (
              filteredReservations.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl border border-slate-200 p-4 shadow-soft space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{res.customerName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          res.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : res.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {res.status === 'confirmed' ? 'Confirmada' : res.status === 'pending' ? 'Pendiente' : res.status === 'completed' ? 'Sentada' : 'Cancelada'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                        <span className="flex items-center gap-1 font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-torre-600" />
                          {res.reservationDate} a las {res.reservationTime}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-torre-700 bg-torre-50 px-2 py-0.5 rounded-md">
                          👥 {res.partySize} Comensales
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${res.customerPhone}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Llamar al cliente"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/${res.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${res.customerName}, te confirmamos tu mesa para ${res.partySize} comensales en ${currentRestaurant.name} el día ${res.reservationDate} a las ${res.reservationTime}. ¡Te esperamos!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="Enviar confirmación WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {res.specialNotes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <span className="font-bold text-slate-700">Nota del cliente: </span>
                      {res.specialNotes}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    {res.status === 'pending' && (
                      <button
                        onClick={() => {
                          updateReservationStatus(res.id, 'confirmed');
                          triggerToast('Reserva confirmada');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aceptar Reserva</span>
                      </button>
                    )}

                    {res.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          updateReservationStatus(res.id, 'completed');
                          triggerToast('Mesa marcada como completada');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Mesa Sentada</span>
                      </button>
                    )}

                    {res.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (window.confirm('¿Deseas cancelar esta reserva?')) {
                            updateReservationStatus(res.id, 'cancelled');
                            triggerToast('Reserva cancelada');
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-all"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
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
              placeholder="Ej: Salmorejo cordobés con jamón ibérico&#10;Ensaladilla rusa casera con ventresca"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Segundos Platos (1 por línea)</label>
            <textarea
              rows={3}
              value={dailyMenuSecondCourses}
              onChange={(e) => setDailyMenuSecondCourses(e.target.value)}
              placeholder="Ej: Entrecot a la brasa con patatas panadera&#10;Merluza de pincho a la romana"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Postres (1 por línea)</label>
            <textarea
              rows={2}
              value={dailyMenuDesserts}
              onChange={(e) => setDailyMenuDesserts(e.target.value)}
              placeholder="Ej: Tarta de queso casera&#10;Flan de huevo con nata"
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

      {/* TAB 3: STATS & IMPACT METRICS */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-torre-950 to-slate-900 text-white p-5 rounded-3xl shadow-soft space-y-3 border border-torre-900/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-oro-400 uppercase tracking-wider">
                Impacto de tu Carta Digital
              </span>
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{stats.weeklyGrowth}% este mes
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 block">Lecturas de Carta</span>
                <span className="text-2xl font-black text-white block mt-0.5">{stats.monthlyViews}</span>
                <span className="text-[10px] text-slate-400">Escaneos QR y visitas web</span>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
                <span className="text-[11px] text-slate-300 block">Contactos / Reservas</span>
                <span className="text-2xl font-black text-oro-400 block mt-0.5">{stats.monthlyBookings}</span>
                <span className="text-[10px] text-slate-400">Llamadas y WhatsApp directos</span>
              </div>
            </div>
          </div>

          {/* Top Dishes Ranking */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-3">
            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-oro-500" />
              <span>Platos Más Vistos de tu Carta</span>
            </h4>

            <div className="space-y-2.5 pt-1">
              {stats.topDishes.map((dish, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 truncate pr-2">
                      {idx + 1}. {dish.name}
                    </span>
                    <span className="text-torre-700 shrink-0 font-black">{dish.views} vistas</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-torre-600 to-oro-500 rounded-full"
                      style={{ width: `${Math.min(100, (dish.views / (stats.topDishes[0]?.views || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RESTAURANT INFO */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveInfo} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-black text-slate-900">Datos del Restaurante</h3>
            <p className="text-[11px] text-slate-500">Información visible para los comensales y reservas.</p>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>Teléfono</span>
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={currentRestaurant.phone}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-emerald-600" />
                <span>WhatsApp</span>
              </label>
              <input
                type="text"
                name="whatsapp"
                defaultValue={currentRestaurant.whatsapp}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-torre-600" />
              <span>Dirección en Torrelodones</span>
            </label>
            <input
              type="text"
              name="address"
              defaultValue={currentRestaurant.address}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Zona</label>
              <select
                name="zone"
                defaultValue={currentRestaurant.zone}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
              >
                <option value="Torrelodones Pueblo">Torrelodones Pueblo</option>
                <option value="Torrelodones Colonia">Torrelodones Colonia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Aforo / Capacidad</span>
                <span className="text-[10px] text-slate-400">Comensales</span>
              </label>
              <input
                type="number"
                name="capacity"
                defaultValue={currentRestaurant.capacity || ''}
                placeholder="Ej: 85"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </form>
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

      {/* TAB 6: GUIDE & SUPPORT */}
      {activeTab === 'help' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <HelpCircle className="w-5 h-5 text-torre-600" />
            <h3 className="text-sm font-black text-slate-900">Soporte y Guía de GastroTorre</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">¿Cómo actualizar precios y platos?</h4>
              <p>Ve a la pestaña <strong>Platos</strong>, toca sobre cualquier plato para editar su precio, descripción o fotografía.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">¿Cómo conectar tu Base de Datos Supabase (0 €)?</h4>
              <p>Añade tus claves de Supabase en las variables de entorno <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> y <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> para activar la sincronización en la nube.</p>
            </div>
          </div>
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
                  placeholder="Ej: Postres Artesanos, Carnes a la Brasa..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción corta (opcional)</label>
                <input
                  type="text"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Ej: Elaborados a diario en nuestro obrador propio"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
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
                  placeholder="Ej: Croquetas de Jamón Ibérico (6 uds)"
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
                  placeholder="Ej: Con bechamel fluida, rebozado panko y jamón de bellota..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDishSpecialty}
                    onChange={(e) => setNewDishSpecialty(e.target.checked)}
                    className="rounded text-torre-600 focus:ring-torre-500"
                  />
                  <span>⭐ Plato Estrella / Especialidad</span>
                </label>
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

      {/* MANUAL RESERVATION MODAL */}
      {showAddResModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">Añadir Reserva Manual</h3>
              <button
                type="button"
                onClick={() => setShowAddResModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualReservation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del cliente *</label>
                <input
                  type="text"
                  value={resCustName}
                  onChange={(e) => setResCustName(e.target.value)}
                  placeholder="Ej: Ignacio Martínez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono móvil *</label>
                <input
                  type="tel"
                  value={resCustPhone}
                  onChange={(e) => setResCustPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora</label>
                  <input
                    type="text"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    placeholder="14:30"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Personas</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={resPax}
                    onChange={(e) => setResPax(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notas especiales (opcional)</label>
                <input
                  type="text"
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="Ej: Terraza, trona para bebé..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddResModal(false)}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  Confirmar Mesa
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

      {/* Join GastroTorre Modal */}
      {isJoinOpen && (
        <JoinGastroTorreModal
          isOpen={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
        />
      )}

      {/* Dossier Commercial Modal */}
      {isDossierOpen && (
        <DossierModal
          isOpen={isDossierOpen}
          onClose={() => setIsDossierOpen(false)}
        />
      )}
    </div>
  );
}
