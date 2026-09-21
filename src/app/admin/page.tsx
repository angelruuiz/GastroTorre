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
  Sun
} from 'lucide-react';
import { QRModal } from '@/components/QRModal';
import { DishPhotoModal } from '@/components/DishPhotoModal';
import { JoinGastroTorreModal } from '@/components/JoinGastroTorreModal';
import { DossierModal } from '@/components/DossierModal';
import { Dish, INITIAL_RESTAURANTS } from '@/data/restaurants';
import { FOOD_PHOTO_PRESETS } from '@/data/photoPresets';
import { OFFICIAL_ALLERGENS } from '@/data/allergens';

export default function AdminPage() {
  const { 
    restaurants, 
    updateRestaurant, 
    updateDish, 
    addDish, 
    deleteDish, 
    toggleDishAvailability, 
    addCategory,
    deleteCategory,
    resetAllData 
  } = useRestaurants();

  const [selectedRestId, setSelectedRestId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'menu' | 'daily-menu' | 'stats' | 'info' | 'qr' | 'help'>('menu');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      setSelectedRestId(restaurants[0].id);
    }
  }, [restaurants, selectedRestId]);

  const currentRestaurant = 
    restaurants.find((r) => r.id === selectedRestId) || 
    restaurants[0] || 
    INITIAL_RESTAURANTS[0];

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
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveDishPhoto = (photoUrl?: string) => {
    if (!editingPhotoDish) return;
    updateDish(currentRestaurant.id, editingPhotoDish.categoryId, editingPhotoDish.dishId, {
      image: photoUrl,
    });
    setEditingPhotoDish(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveDailyMenu = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const firsts = dailyMenuFirstCourses.split('\n').map((s) => s.trim()).filter(Boolean);
    const seconds = dailyMenuSecondCourses.split('\n').map((s) => s.trim()).filter(Boolean);
    const desserts = dailyMenuDesserts.split('\n').map((s) => s.trim()).filter(Boolean);
    const priceNum = parseFloat(dailyMenuPrice.replace(',', '.')) || 13.50;

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

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const stats = currentRestaurant.stats || {
    monthlyViews: 480,
    monthlyBookings: 32,
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
      {/* Top Admin Branding Card */}
      <div className="bg-gradient-to-br from-torre-950 via-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-float border border-slate-700/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-torre-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-oro-400 tracking-wider block">
                Panel de Hosteleros
              </span>
              <h1 className="text-base font-black text-white leading-tight">
                Gestor de Carta & QR
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/restaurante/${currentRestaurant.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-oro-400" />
              <span>Ver Carta</span>
            </Link>
          </div>
        </div>

        {/* Restaurant selector for live demos */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <label className="text-[11px] text-slate-400 font-medium block">
            Restaurante a gestionar:
          </label>
          <div className="relative">
            <select
              value={selectedRestId || currentRestaurant.id}
              onChange={(e) => setSelectedRestId(e.target.value)}
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
          <span>¡Cambios guardados con éxito en la carta digital!</span>
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
              💡 Toca la <strong className="font-bold text-torre-700">foto del plato 📷</strong> para cambiarla o subir una desde tu móvil.
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
                            setSavedSuccess(true);
                            setTimeout(() => setSavedSuccess(false), 2000);
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
                    <span className="text-[10px] text-slate-400 font-semibold">{category.dishes.length} platos en carta</span>
                  </div>
                  <button
                    onClick={() => handleOpenAddDish(category.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-torre-50 hover:bg-torre-100 text-torre-800 text-[11px] font-bold border border-torre-200 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Plato</span>
                  </button>
                </div>

                {/* Dish Items */}
                {category.dishes.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center bg-slate-50/50">
                    <p className="text-xs text-slate-500 font-medium">No hay platos en esta sección todavía.</p>
                    <button
                      onClick={() => handleOpenAddDish(category.id)}
                      className="mt-2 text-xs font-bold text-torre-600 hover:text-torre-700 underline"
                    >
                      + Añadir el primer plato
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {category.dishes.map((dish) => (
                      <div
                        key={dish.id}
                        className={`p-3 rounded-2xl border transition-all ${
                          dish.isAvailable
                            ? 'bg-slate-50/80 border-slate-200 hover:border-torre-200'
                            : 'bg-rose-50/50 border-rose-200 opacity-75'
                        }`}
                      >
                        <div className="flex gap-3 items-center">
                          {/* Interactive Photo Thumbnail Button */}
                          <button
                            onClick={() =>
                              setEditingPhotoDish({
                                dishId: dish.id,
                                categoryId: category.id,
                                dishName: dish.name,
                                currentImage: dish.image,
                              })
                            }
                            className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 group shadow-sm"
                            title="Toca para cambiar la foto"
                          >
                            {dish.image ? (
                              <img
                                src={dish.image}
                                alt={dish.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                                <Camera className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Camera className="w-4 h-4" />
                            </div>
                          </button>

                          {/* Dish Details */}
                          <div className="flex-1 min-w-0 pr-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {dish.name}
                              </h4>
                              {dish.isSpecialty && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200">
                                  Chef ⭐
                                </span>
                              )}
                              {!dish.isAvailable && (
                                <span className="text-[9px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded border border-rose-200">
                                  Agotado
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {dish.description}
                            </p>

                            <div className="flex items-center gap-3 mt-1">
                              <button
                                onClick={() =>
                                  setEditingPhotoDish({
                                    dishId: dish.id,
                                    categoryId: category.id,
                                    dishName: dish.name,
                                    currentImage: dish.image,
                                  })
                                }
                                className="text-[10px] font-bold text-torre-700 hover:text-torre-800 flex items-center gap-1"
                              >
                                <Camera className="w-3 h-3" />
                                <span>{dish.image ? 'Foto' : '+ Foto'}</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditDish(category.id, dish)}
                                className="text-[10px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3 text-slate-500" />
                                <span>Editar</span>
                              </button>
                            </div>
                          </div>

                          {/* Controls: Price + Toggle + Edit + Delete */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {/* Price Input */}
                            <div className="flex items-center bg-white rounded-xl border border-slate-300 px-2 py-1 shadow-sm">
                              <input
                                type="number"
                                step="0.10"
                                defaultValue={dish.price}
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val)) {
                                    updateDish(currentRestaurant.id, category.id, dish.id, { price: val });
                                    setSavedSuccess(true);
                                    setTimeout(() => setSavedSuccess(false), 2000);
                                  }
                                }}
                                className="w-12 text-center text-xs font-black text-slate-900 focus:outline-none"
                              />
                              <span className="text-xs font-bold text-slate-500">€</span>
                            </div>

                            {/* Availability Toggle, Edit and Delete */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleDishAvailability(currentRestaurant.id, category.id, dish.id)}
                                className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all active:scale-95 ${
                                  dish.isAvailable
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-200 hover:bg-rose-300 text-rose-900 border border-rose-300'
                                }`}
                              >
                                {dish.isAvailable ? 'Disponible' : 'Agotado'}
                              </button>

                              <button
                                onClick={() => handleOpenEditDish(category.id, dish)}
                                className="p-1 text-slate-400 hover:text-torre-600 rounded-lg hover:bg-torre-50 transition-colors"
                                title="Editar plato completo"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => deleteDish(currentRestaurant.id, category.id, dish.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Eliminar plato"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: DAILY MENU (MENÚ DEL DÍA) */}
      {activeTab === 'daily-menu' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Explanatory Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-torre-500/10 p-4 rounded-3xl border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Menú del Día Express</h3>
                  <p className="text-[11px] text-slate-600">Actualiza el menú de hoy en 30 segundos cada mañana</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                dailyMenuActive 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse' 
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {dailyMenuActive ? '🟢 ACTIVO EN CARTA' : '⚪ DESACTIVADO'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveDailyMenu} className="space-y-4">
            {/* Activation Switch Card */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">Estado del Menú del Día</h4>
                  <p className="text-[11px] text-slate-500">¿Deseas mostrar el menú del día hoy en la carta digital?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDailyMenuActive(!dailyMenuActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    dailyMenuActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      dailyMenuActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Price Field */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-900 block">Precio del Menú (€)</label>
                  <span className="text-[10px] text-slate-500">IVA incluido por comensal</span>
                </div>
                <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 px-3 py-1.5 w-28 shadow-inner">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={dailyMenuPrice}
                    onChange={(e) => setDailyMenuPrice(e.target.value)}
                    placeholder="13.50"
                    className="w-full text-right text-sm font-black text-slate-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500 ml-1">€</span>
                </div>
              </div>
            </div>

            {/* Courses Inputs */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-soft space-y-4">
              {/* Primeros Platos */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center">1º</span>
                    Primeros Platos
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Un plato por línea</span>
                </div>
                <textarea
                  rows={3}
                  value={dailyMenuFirstCourses}
                  onChange={(e) => setDailyMenuFirstCourses(e.target.value)}
                  placeholder="Ejemplo:&#10;Salmorejo cordobés con crujiente de ibérico&#10;Ensalada templada de queso de cabra&#10;Lentejas estofadas con chorizo de la sierra"
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Segundos Platos */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-torre-100 text-torre-800 text-[10px] font-black flex items-center justify-center">2º</span>
                    Segundos Platos
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Un plato por línea</span>
                </div>
                <textarea
                  rows={3}
                  value={dailyMenuSecondCourses}
                  onChange={(e) => setDailyMenuSecondCourses(e.target.value)}
                  placeholder="Ejemplo:&#10;Entrecot de ternera a la parrilla con patatas&#10;Lubina a la plancha con bilbaína suave&#10;Secreto ibérico con pimientos de Padrón"
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-torre-500 leading-relaxed text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Postres */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">🍰</span>
                    Postres / Café
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Un postre por línea</span>
                </div>
                <textarea
                  rows={2}
                  value={dailyMenuDesserts}
                  onChange={(e) => setDailyMenuDesserts(e.target.value)}
                  placeholder="Ejemplo:&#10;Tarta de queso casera horneada&#10;Flan de huevo con nata&#10;Fruta de temporada o Café arábica"
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Qué incluye */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-black text-slate-900 block">
                  Qué incluye el menú
                </label>
                <input
                  type="text"
                  value={dailyMenuIncludes}
                  onChange={(e) => setDailyMenuIncludes(e.target.value)}
                  placeholder="Incluye primer plato, segundo plato, pan, 1 bebida y postre o café."
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-torre-500 text-slate-800"
                />
              </div>

              {/* Horario y notas */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-black text-slate-900 block">
                  Días y horario de validez
                </label>
                <input
                  type="text"
                  value={dailyMenuNotes}
                  onChange={(e) => setDailyMenuNotes(e.target.value)}
                  placeholder="Disponible de Lunes a Viernes de 13:30 a 16:30 (no festivos)."
                  className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-torre-500 text-slate-800"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4 text-oro-400" />
              <span>Guardar y Publicar Menú del Día</span>
            </button>
          </form>

          {/* Live Mobile Preview */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-torre-600" />
                <span>Vista Previa en el Móvil del Comensal</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">Tiempo Real</span>
            </div>

            {dailyMenuActive ? (
              <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-600/15 border-2 border-amber-400/60 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-500 text-base">☀️</span>
                    <span className="text-xs font-black text-amber-950 uppercase tracking-wide">Menú del Día de Hoy</span>
                  </div>
                  <span className="bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-sm">
                    {parseFloat(dailyMenuPrice || '13.50').toFixed(2)} €
                  </span>
                </div>

                <p className="text-[11px] text-amber-900/90 font-medium italic">
                  {dailyMenuIncludes}
                </p>

                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-amber-200/60 text-xs">
                  {dailyMenuFirstCourses && (
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block mb-1">
                        Primeros a elegir:
                      </span>
                      <ul className="text-[11px] text-slate-800 space-y-0.5 list-disc list-inside">
                        {dailyMenuFirstCourses.split('\n').filter(Boolean).map((dish, i) => (
                          <li key={i} className="font-medium">{dish}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dailyMenuSecondCourses && (
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block mb-1">
                        Segundos a elegir:
                      </span>
                      <ul className="text-[11px] text-slate-800 space-y-0.5 list-disc list-inside">
                        {dailyMenuSecondCourses.split('\n').filter(Boolean).map((dish, i) => (
                          <li key={i} className="font-medium">{dish}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dailyMenuDesserts && (
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
                      <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block mb-1">
                        Postres o Café:
                      </span>
                      <ul className="text-[11px] text-slate-800 space-y-0.5 list-disc list-inside">
                        {dailyMenuDesserts.split('\n').filter(Boolean).map((dish, i) => (
                          <li key={i} className="font-medium">{dish}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-amber-800 font-semibold pt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>{dailyMenuNotes}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <p className="text-xs font-bold text-slate-600">El Menú del Día está actualmente desactivado</p>
                <p className="text-[10px] text-slate-400">Activa el interruptor arriba para que aparezca publicado en tu carta digital.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STATS & IMPACT METRICS */}
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

          {/* Scans by Day Distribution */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-3">
            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-torre-600" />
              <span>Actividad por Día de la Semana</span>
            </h4>

            <div className="flex items-end justify-between gap-2 pt-3 h-28">
              {stats.scansByDay.map((d, idx) => {
                const maxCount = Math.max(...stats.scansByDay.map((s) => s.count));
                const heightPct = Math.round((d.count / maxCount) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[10px] font-bold text-slate-600">{d.count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-torre-600 to-oro-400 rounded-lg transition-all"
                      style={{ height: `${Math.max(12, heightPct)}%` }}
                    ></div>
                    <span className="text-[10px] font-semibold text-slate-400">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RESTAURANT INFO FORM */}
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

          {/* Horarios configurables */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Clock className="w-4 h-4 text-torre-600" />
              <h4 className="text-xs font-bold text-slate-900">Horarios de Apertura (Píldora en tiempo real)</h4>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Días de Servicio</label>
              <input
                type="text"
                name="scheduleDays"
                defaultValue={currentRestaurant.schedule.days}
                placeholder="Ej: Martes a Domingo / Lunes a Domingo"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Servicio Comidas</label>
                <input
                  type="text"
                  name="scheduleLunch"
                  defaultValue={currentRestaurant.schedule.lunch}
                  placeholder="Ej: 13:30 - 16:30"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Servicio Cenas (Opcional)</label>
                <input
                  type="text"
                  name="scheduleDinner"
                  defaultValue={currentRestaurant.schedule.dinner || ''}
                  placeholder="Ej: 20:30 - 23:45"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Enlace a Google Maps (Para Reseñas ⭐)</span>
              <span className="text-[10px] text-oro-600 font-semibold">Multiplicador de Reseñas</span>
            </label>
            <input
              type="url"
              name="googleMapsUrl"
              defaultValue={currentRestaurant.googleMapsUrl}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Los clientes que califiquen con 5 estrellas serán redirigidos a este enlace.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Datos</span>
          </button>
        </form>
      )}

      {/* TAB 4: QR GENERATOR & DOWNLOAD */}
      {activeTab === 'qr' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4 text-center">
          <div className="p-3.5 bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl text-slate-900 text-xs font-medium border border-torre-200/80 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-torre-900">
              <QrCode className="w-4 h-4 text-torre-600" />
              <span>Código QR Inmutable para Mesa</span>
            </p>
            <p className="text-[11px] text-slate-600">
              El código QR que imprimas para tus mesas <strong>nunca caduca</strong>. Los clientes verán siempre los precios y fotos actualizados.
            </p>
          </div>

          <button
            onClick={() => setIsQrOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            <span>Abrir Generador & Descargar PNG de Mesa</span>
          </button>
        </div>
      )}

      {/* TAB 5: HELP & ONBOARDING GUIDE */}
      {activeTab === 'help' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-4 text-xs">
          <div className="space-y-1 border-b border-slate-100 pb-2">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-orange-600" />
              <span>Preguntas Frecuentes para Hosteleros</span>
            </h3>
            <p className="text-slate-500 text-[11px]">
              Funcionamiento básico del portal GastroTorre.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <h4 className="font-bold text-slate-900">¿Cómo cambio las fotos de mis platos?</h4>
              <p className="text-[11px] text-slate-600">
                En la pestaña de <strong>Platos</strong>, toca directamente la foto cuadrada del plato. Podrás subir una foto tomada con la cámara de tu móvil, elegir de nuestra galería profesional o pegar un enlace.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <h4 className="font-bold text-slate-900">¿Qué pasa si cambio un precio o un plato?</h4>
              <p className="text-[11px] text-slate-600">
                Se actualiza automáticamente al segundo en la carta digital. No tienes que volver a imprimir ningún código QR en tus mesas.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <h4 className="font-bold text-slate-900">¿Cómo me contactan los comensales para reservar?</h4>
              <p className="text-[11px] text-slate-600">
                A través del botón directo de llamada telefónica o con un mensaje automático de WhatsApp a tu número de reservas. Sin intermediarios ni comisiones.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Button */}
      <div className="pt-3 text-center">
        <button
          onClick={() => {
            if (confirm('¿Restablecer los datos originales de demostración para los 5 restaurantes?')) {
              resetAllData();
              setSavedSuccess(true);
              setTimeout(() => setSavedSuccess(false), 2000);
            }
          }}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer datos demo originales</span>
        </button>
      </div>

      {/* ADD DISH MODAL */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-3 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900">
                {editingDish ? `Editar: ${editingDish.dish.name}` : 'Añadir Nuevo Plato'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddDishModal(false);
                  setEditingDish(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddDishSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sección de la carta</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500 cursor-pointer"
                  required
                >
                  {currentRestaurant.menu.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del plato</label>
                <input
                  type="text"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="Ej: Pulpo a la Brasa con Parmentier"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Precio (€)</label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Ingredientes principales, preparación..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              {/* Photo selector (Device upload + Presets) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Foto del Plato (Opcional):</label>
                
                {/* Upload from device button */}
                <label className="flex items-center justify-center gap-2 p-3 bg-torre-50/70 hover:bg-torre-100/70 rounded-xl border-2 border-dashed border-torre-200 cursor-pointer transition-all active:scale-98 text-center">
                  <Upload className="w-4 h-4 text-torre-600" />
                  <span className="text-xs font-bold text-torre-950">Subir foto desde este dispositivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewDishImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {/* Selected Photo Preview */}
                {newDishImage && (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-torre-300 shadow-sm group">
                    <img src={newDishImage} alt="Vista previa" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewDishImage('')}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors"
                      title="Quitar foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      Foto seleccionada ✓
                    </span>
                  </div>
                )}

                {/* Quick Presets Carousel */}
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1">O elige una de la galería:</span>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {FOOD_PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setNewDishImage(p.url)}
                        className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          newDishImage === p.url ? 'border-torre-500 ring-2 ring-torre-400/30 scale-105' : 'border-slate-200 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 14 Official EU Allergens Picker */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Alérgenos del plato (Reglamento UE 1169/2011):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {OFFICIAL_ALLERGENS.map((alg) => {
                    const isSelected = newDishAllergens.includes(alg.id);
                    return (
                      <button
                        key={alg.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewDishAllergens(newDishAllergens.filter((id) => id !== alg.id));
                          } else {
                            setNewDishAllergens([...newDishAllergens, alg.id]);
                          }
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-torre-600 text-white border-torre-700 shadow-xs scale-102'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{alg.emoji}</span>
                        <span>{alg.shortName}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="specialty"
                    checked={newDishSpecialty}
                    onChange={(e) => setNewDishSpecialty(e.target.checked)}
                    className="rounded text-torre-600 focus:ring-torre-500"
                  />
                  <label htmlFor="specialty" className="text-xs font-bold text-slate-700">
                    Marcar como Especialidad del Chef ⭐
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="glutenfree"
                    checked={newDishGlutenFree}
                    onChange={(e) => setNewDishGlutenFree(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="glutenfree" className="text-xs font-bold text-slate-700">
                    Apto Celíacos (Sin Gluten) 🌾❌
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vegan"
                    checked={newDishVegan}
                    onChange={(e) => setNewDishVegan(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="vegan" className="text-xs font-bold text-slate-700">
                    Opción Vegana / Vegetariana 🌱
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDishModal(false);
                    setEditingDish(null);
                  }}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  {editingDish ? 'Guardar Cambios' : 'Guardar Plato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-torre-50 text-torre-600 flex items-center justify-center">
                  <FolderPlus className="w-4 h-4 text-torre-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Nueva Sección de Carta</h3>
                  <p className="text-[10px] text-slate-400">Organiza tus platos a tu gusto</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCategoryModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Sugerencias rápidas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Entrantes de la Casa',
                  'Para Compartir',
                  'Carnes & Brasa',
                  'Pescados Frescos',
                  'Pizzas & Pastas',
                  'Postres Artesanos',
                  'Vinos & Bebidas',
                  'Menú del Día',
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setNewCategoryName(sug)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 hover:bg-torre-50 hover:text-torre-700 text-slate-700 border border-slate-200/80 transition-all active:scale-95"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
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
