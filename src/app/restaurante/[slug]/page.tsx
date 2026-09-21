'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRestaurants } from '@/context/RestaurantContext';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Star, 
  Clock, 
  Sparkles, 
  Check, 
  Navigation, 
  Filter,
  Share2,
  UtensilsCrossed,
  Info,
  ShieldCheck,
  X,
  RotateCcw,
  Users
} from 'lucide-react';
import { AllergenBadge } from '@/components/AllergenBadge';
import { GoogleReviewsBooster } from '@/components/GoogleReviewsBooster';
import { getOpenStatus } from '@/utils/schedule';
import { INITIAL_RESTAURANTS } from '@/data/restaurants';
import { OFFICIAL_ALLERGENS, DIET_FILTERS } from '@/data/allergens';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { getRestaurantBySlug } = useRestaurants();

  // Find restaurant with fallback to initial data to guarantee zero empty render
  const restaurant = 
    getRestaurantBySlug(slug) || 
    INITIAL_RESTAURANTS.find((r) => r.slug === slug);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedDietFilter, setSelectedDietFilter] = useState<string | null>(null);
  const [showAllergensGuide, setShowAllergensGuide] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default active category
  useEffect(() => {
    if (restaurant && restaurant.menu.length > 0 && !activeCategory) {
      setActiveCategory(restaurant.menu[0].id);
    }
  }, [restaurant, activeCategory]);

  if (!restaurant) {
    return (
      <div className="p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-950 min-h-[60vh] flex flex-col items-center justify-center">
        <UtensilsCrossed className="w-12 h-12 text-slate-300" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Restaurante no encontrado</h2>
        <p className="text-xs text-slate-500 max-w-xs">El restaurante solicitado no está disponible en la guía de Torrelodones.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-torre-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio</span>
        </Link>
      </div>
    );
  }

  const liveStatus = mounted ? getOpenStatus(restaurant.schedule) : null;

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `${restaurant.name} en GastroTorre`,
        text: `Mira la carta digital de ${restaurant.name} en Torrelodones`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Count total and matching dishes
  const allDishes = restaurant.menu.flatMap((cat) => cat.dishes);
  const currentFilterObj = DIET_FILTERS.find((f) => f.id === selectedDietFilter);
  const matchingDishesCount = currentFilterObj
    ? allDishes.filter(currentFilterObj.check).length
    : allDishes.length;

  // Schema.org Restaurant Schema JSON-LD for rich snippets
  const schemaRestaurant = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description,
    image: restaurant.coverImage,
    servesCuisine: restaurant.cuisine,
    priceRange: restaurant.priceLevel,
    telephone: restaurant.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
      addressLocality: 'Torrelodones',
      addressRegion: 'Madrid',
      postalCode: '28250',
      addressCountry: 'ES',
    },
    hasMenu: {
      '@type': 'Menu',
      name: `Carta de ${restaurant.name}`,
      hasMenuSection: restaurant.menu.map((cat) => ({
        '@type': 'MenuSection',
        name: cat.name,
        hasMenuItem: cat.dishes.map((d) => ({
          '@type': 'MenuItem',
          name: d.name,
          description: d.description,
          offers: {
            '@type': 'Offer',
            price: d.price.toFixed(2),
            priceCurrency: 'EUR',
          },
        })),
      })),
    },
  };

  return (
    <div className="space-y-4 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaRestaurant) }}
      />

      {/* Top Navigation & Cover Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="relative h-64 w-full bg-slate-950 overflow-hidden">
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/40 to-black/50"></div>

          {/* Top Floating Buttons Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all active:scale-90 shadow-md"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {/* LIQUID GLASS REAL-TIME OPEN STATUS PILL */}
              {liveStatus && (
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(true)}
                  className="group relative backdrop-blur-2xl bg-white/20 hover:bg-white/30 dark:bg-black/40 dark:hover:bg-black/60 border border-white/40 dark:border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] px-3 py-1.5 rounded-full flex items-center gap-2 transition-all active:scale-95"
                  title="Toca para ver el horario completo"
                >
                  {liveStatus.isOpen ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                    </span>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-400 shadow-[0_0_8px_#f43f5e]"></span>
                  )}

                  <span className="text-[11px] font-black tracking-tight text-white drop-shadow-sm whitespace-nowrap">
                    {liveStatus.isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
                  </span>

                  <Clock className="w-3 h-3 text-white/90 group-hover:rotate-12 transition-transform" />
                </button>
              )}

              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all active:scale-90 shadow-md"
                title="Compartir carta"
              >
                {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Restaurant Title Info on Cover */}
          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-oro-300 font-bold uppercase tracking-wider">
              <span>{restaurant.cuisine}</span>
              <span>•</span>
              <span className="text-white bg-white/20 px-1.5 py-0.2 rounded font-black">{restaurant.priceLevel}</span>
            </div>
            <h1 className="text-2xl font-black leading-tight drop-shadow-md">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-200 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-oro-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {restaurant.rating}
              </span>
              <span>({restaurant.reviewCount} opiniones)</span>
              
              {restaurant.capacity && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-bold text-white">
                    <Users className="w-3 h-3 text-oro-300" />
                    <span>Aforo: {restaurant.capacity} plazas</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Contact & Action Buttons Bar */}
        {Boolean(
          (restaurant.phone && restaurant.phone.trim().length > 0) ||
          (restaurant.whatsapp && restaurant.whatsapp.trim().length > 0) ||
          (restaurant.googleMapsUrl && restaurant.googleMapsUrl.trim().length > 0)
        ) && (
          <div className="px-4 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            {restaurant.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {restaurant.description}
              </p>
            )}

            {(() => {
              const hasPhone = Boolean(restaurant.phone && restaurant.phone.trim().length > 0);
              const hasWhatsapp = Boolean(restaurant.whatsapp && restaurant.whatsapp.trim().length > 0);
              const hasGps = Boolean(restaurant.googleMapsUrl && restaurant.googleMapsUrl.trim().length > 0);
              const totalActions = [hasPhone, hasWhatsapp, hasGps].filter(Boolean).length;

              if (totalActions === 0) return null;

              const gridColsClass = 
                totalActions === 3 ? 'grid-cols-3' :
                totalActions === 2 ? 'grid-cols-2' : 'grid-cols-1';

              return (
                <div className={`grid ${gridColsClass} gap-2 pt-1`}>
                  {/* Phone */}
                  {hasPhone && (
                    <a
                      href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 text-center transition-all active:scale-95 shadow-sm"
                    >
                      <Phone className="w-4 h-4 text-slate-700 dark:text-slate-300 mb-1" />
                      <span className="text-[11px] font-bold">Llamar</span>
                    </a>
                  )}

                  {/* WhatsApp */}
                  {hasWhatsapp && (
                    <a
                      href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}?text=Hola,%20quisiera%20reservar%20una%20mesa%20en%20${encodeURIComponent(restaurant.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-center transition-all active:scale-95 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                      <span className="text-[11px] font-bold">WhatsApp</span>
                    </a>
                  )}

                  {/* GPS */}
                  {hasGps && (
                    <a
                      href={restaurant.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-torre-50 dark:bg-torre-950/40 hover:bg-torre-100 dark:hover:bg-torre-900/40 text-torre-950 dark:text-torre-200 border border-torre-200 dark:border-torre-800 text-center transition-all active:scale-95 shadow-sm"
                    >
                      <Navigation className="w-4 h-4 text-torre-600 dark:text-torre-400 mb-1" />
                      <span className="text-[11px] font-bold">Cómo llegar</span>
                    </a>
                  )}
                </div>
              );
            })()}

          {/* Schedule, Address & Capacity info */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 truncate min-w-0">
              <MapPin className="w-3.5 h-3.5 text-torre-600 shrink-0" />
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {restaurant.capacity && (
                <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Users className="w-3 h-3 text-torre-600" />
                  <span>Aforo: {restaurant.capacity}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-torre-600 dark:hover:text-torre-400 transition-colors"
              >
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{restaurant.schedule.days}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* DAILY MENU (MENÚ DEL DÍA) SPECIAL SECTION */}
      {restaurant.dailyMenu && restaurant.dailyMenu.isActive && (
        <section className="px-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-600/15 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-900/40 border-2 border-amber-400/70 dark:border-amber-600/50 rounded-3xl p-5 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <span className="text-base">☀️</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    Recomendación de Mediodía
                  </span>
                  <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    Menú del Día de Hoy
                  </h2>
                </div>
              </div>

              <div className="text-right">
                <span className="bg-amber-500 text-white font-black text-sm px-3 py-1 rounded-2xl shadow-sm inline-block">
                  {restaurant.dailyMenu.price.toFixed(2)} €
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium mt-0.5">IVA incl.</span>
              </div>
            </div>

            {restaurant.dailyMenu.includes && (
              <p className="text-xs text-amber-900 dark:text-amber-200 font-medium italic bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                ✨ {restaurant.dailyMenu.includes}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {restaurant.dailyMenu.firstCourses && restaurant.dailyMenu.firstCourses.length > 0 && (
                <div className="bg-white/90 dark:bg-slate-850 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-amber-200/60 dark:border-slate-700 space-y-1.5 shadow-sm">
                  <span className="text-[11px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-black flex items-center justify-center">1</span>
                    Primeros a Elegir
                  </span>
                  <ul className="text-xs text-slate-800 dark:text-slate-200 space-y-1 pl-1">
                    {restaurant.dailyMenu.firstCourses.map((dish, i) => (
                      <li key={i} className="flex items-start gap-1.5 font-medium">
                        <span className="text-amber-500">•</span>
                        <span>{dish}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {restaurant.dailyMenu.secondCourses && restaurant.dailyMenu.secondCourses.length > 0 && (
                <div className="bg-white/90 dark:bg-slate-850 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-amber-200/60 dark:border-slate-700 space-y-1.5 shadow-sm">
                  <span className="text-[11px] font-black text-torre-800 dark:text-torre-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-torre-100 dark:bg-torre-900/50 text-torre-800 dark:text-torre-300 text-[10px] font-black flex items-center justify-center">2</span>
                    Segundos a Elegir
                  </span>
                  <ul className="text-xs text-slate-800 dark:text-slate-200 space-y-1 pl-1">
                    {restaurant.dailyMenu.secondCourses.map((dish, i) => (
                      <li key={i} className="flex items-start gap-1.5 font-medium">
                        <span className="text-torre-500">•</span>
                        <span>{dish}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {restaurant.dailyMenu.desserts && restaurant.dailyMenu.desserts.length > 0 && (
              <div className="bg-white/90 dark:bg-slate-850 dark:bg-slate-800/80 p-3 rounded-2xl border border-amber-200/60 dark:border-slate-700 space-y-1 shadow-sm">
                <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🍰</span>
                  Postres Caseros o Café
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium pl-1">
                  {restaurant.dailyMenu.desserts.join(' • ')}
                </p>
              </div>
            )}

            {restaurant.dailyMenu.scheduleNotes && (
              <div className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1.5 pt-0.5">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{restaurant.dailyMenu.scheduleNotes}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ADVANCED ALLERGEN & DIETARY FILTER BAR */}
      <div className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-torre-600" />
            <span>Filtro de Alérgenos & Dietas:</span>
          </div>

          <button
            onClick={() => setShowAllergensGuide(true)}
            className="text-[11px] font-bold text-torre-700 dark:text-torre-400 hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Info 14 Alérgenos</span>
          </button>
        </div>

        {/* Filter Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedDietFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              selectedDietFilter === null
                ? 'bg-torre-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Ver toda la carta</span>
          </button>

          {DIET_FILTERS.map((filter) => {
            const isSelected = selectedDietFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedDietFilter(isSelected ? null : filter.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-torre-600 text-white shadow-sm ring-2 ring-torre-400/40'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{filter.emoji}</span>
                <span>{filter.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Filter status banner if active */}
        {selectedDietFilter && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-2.5 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
            <span className="font-semibold text-amber-900 dark:text-amber-200">
              Mostrando <strong className="font-bold">{matchingDishesCount}</strong> platos aptos para <strong className="font-bold">{currentFilterObj?.name}</strong>
            </span>
            <button
              onClick={() => setSelectedDietFilter(null)}
              className="text-[11px] font-bold text-amber-800 dark:text-amber-300 underline ml-2"
            >
              Quitar filtro
            </button>
          </div>
        )}
      </div>

      {/* Sticky Menu Categories Tabs */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-y border-slate-200 dark:border-slate-800 px-4 py-2.5 shadow-sm">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {restaurant.menu.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                const el = document.getElementById(`cat-${category.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeCategory === category.id
                  ? 'bg-torre-700 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Categories and Dishes */}
      <div className="px-4 space-y-6 pt-1">
        {restaurant.menu.map((category) => {
          // Filter dishes in category based on dietary check
          const dishes = category.dishes.filter((d) => {
            if (!currentFilterObj) return true;
            return currentFilterObj.check(d);
          });

          if (dishes.length === 0) return null;

          return (
            <section
              key={category.id}
              id={`cat-${category.id}`}
              className="scroll-mt-32 space-y-3"
            >
              {/* Category Header */}
              <div className="border-b border-torre-200 dark:border-torre-800 pb-2 flex items-baseline justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{category.description}</p>
                  )}
                </div>
                <span className="text-[11px] font-bold text-torre-700 dark:text-torre-300 bg-torre-50 dark:bg-torre-950 px-2.5 py-0.5 rounded-full border border-torre-200 dark:border-torre-800">
                  {dishes.length} {dishes.length === 1 ? 'plato' : 'platos'}
                </span>
              </div>

              {/* Dishes List */}
              <div className="space-y-3">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className={`p-4 rounded-3xl border transition-all ${
                      dish.isAvailable
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-float hover:border-torre-200 dark:hover:border-torre-700'
                        : 'bg-slate-100/70 dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex gap-3.5">
                      {/* Dish Details */}
                      <div className="flex-1 space-y-1.5">
                        {/* Specialty / Available / Diet Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {dish.isSpecialty && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider border border-amber-200 dark:border-amber-700">
                              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              Especialidad
                            </span>
                          )}

                          {!dish.isAvailable && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 text-[10px] font-black uppercase border border-rose-200 dark:border-rose-700">
                              Agotado hoy
                            </span>
                          )}

                          {dish.isVegan && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold border border-emerald-200 dark:border-emerald-700">
                              Vegano 🌱
                            </span>
                          )}

                          {dish.isGlutenFree && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[10px] font-bold border border-amber-200 dark:border-amber-700">
                              Sin Gluten 🌾❌
                            </span>
                          )}
                        </div>

                        {/* Dish Name */}
                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                          {dish.name}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {dish.description}
                        </p>

                        {/* Allergens Row */}
                        {dish.allergens && dish.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {dish.allergens.map((alg, idx) => (
                              <AllergenBadge key={idx} type={alg} showText={true} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Price and Thumbnail Image */}
                      <div className="flex flex-col items-end justify-between shrink-0">
                        <span className="text-base font-black text-torre-700 dark:text-torre-300 bg-torre-50 dark:bg-torre-950 px-2.5 py-1 rounded-xl border border-torre-100 dark:border-torre-800 shadow-sm">
                          {dish.price.toFixed(2)}€
                        </span>

                        {dish.image && (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mt-2">
                            <img
                              src={dish.image}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* SMART GOOGLE REVIEWS BOOSTER */}
      <div className="px-4 pt-4">
        <GoogleReviewsBooster restaurant={restaurant} />
      </div>

      {/* BRANDING FOOTER */}
      <div className="px-4 py-8 text-center space-y-2 border-t border-slate-200 dark:border-slate-800 mt-6 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-800 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-torre-600"></span>
          <span>Proporcionado por GastroTorre</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Cartas digitales en tiempo real y directorio gastronómico de Torrelodones.
        </p>
        <Link
          href="/"
          className="inline-block text-xs font-bold text-torre-600 dark:text-torre-400 hover:underline pt-1"
        >
          Explorar más restaurantes de Torrelodones →
        </Link>
      </div>

      {/* SCHEDULE MODAL (Triggered by Liquid Glass Pill) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-scaleUp border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${liveStatus?.isOpen ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60'}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{restaurant.name}</h3>
                  <span className={`text-[10px] font-bold ${liveStatus?.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {liveStatus?.label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Días de apertura:</span>
                <span className="font-black text-slate-900 dark:text-white">{restaurant.schedule.days}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Servicio Comidas:</span>
                <span className="font-black text-torre-700 dark:text-torre-300">{restaurant.schedule.lunch}</span>
              </div>

              {restaurant.schedule.dinner && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Servicio Cenas:</span>
                  <span className="font-black text-torre-700 dark:text-torre-300">{restaurant.schedule.dinner}</span>
                </div>
              )}

              {restaurant.capacity && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-torre-600" />
                    <span>Aforo total del local:</span>
                  </span>
                  <span className="font-black text-torre-700 dark:text-torre-300">{restaurant.capacity} comensales</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowScheduleModal(false)}
              className="w-full py-2.5 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold transition-all shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* ALLERGENS COMPLIANCE GUIDE MODAL */}
      {showAllergensGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-scaleUp max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Información de Alérgenos</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Reglamento UE 1169/2011</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllergensGuide(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              En <strong className="text-slate-900 dark:text-white font-bold">{restaurant.name}</strong> y GastroTorre identificamos los 14 alérgenos de declaración obligatoria para que disfrutes de tu comida con total seguridad y tranquilidad:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OFFICIAL_ALLERGENS.map((alg) => (
                <div
                  key={alg.id}
                  className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2"
                >
                  <span className="text-lg shrink-0">{alg.emoji}</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{alg.shortName}</h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{alg.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold block">⚠️ Aviso importante para personas con alergias graves:</span>
              <p>Aunque cuidamos al máximo la elaboración, en cocina puede existir contaminación cruzada involuntaria. Por favor avisa a nuestro personal al llegar.</p>
            </div>

            <button
              onClick={() => setShowAllergensGuide(false)}
              className="w-full py-2.5 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-bold transition-all shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
