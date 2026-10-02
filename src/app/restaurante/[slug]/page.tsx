'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
import { RatingHeader } from '@/components/RatingHeader';
import { RatingFooter } from '@/components/RatingFooter';
import { ReviewGateModal } from '@/components/ReviewGateModal';
import { DishDetailModal } from '@/components/DishDetailModal';
import { getOpenStatus } from '@/utils/schedule';
import { INITIAL_RESTAURANTS, Dish } from '@/data/restaurants';
import { OFFICIAL_ALLERGENS, DIET_FILTERS } from '@/data/allergens';
import { dbService } from '@/lib/database/dbService';

export default function RestaurantDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { getRestaurantBySlug } = useRestaurants();

  // Check if visitor came directly from scanning physical table QR code
  const isTableQr = searchParams?.get('src') === 'qr_mesa' || searchParams?.get('src') === 'qr';

  // Find restaurant with fallback to initial data to guarantee zero empty render
  const restaurant = 
    getRestaurantBySlug(slug) || 
    INITIAL_RESTAURANTS.find((r) => r.slug === slug);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedDietFilter, setSelectedDietFilter] = useState<string | null>(null);
  const [showAllergensGuide, setShowAllergensGuide] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDishForModal, setSelectedDishForModal] = useState<{ dish: Dish; categoryName: string } | null>(null);
  const [modalInitialScore, setModalInitialScore] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Live reputation state
  const [liveRating, setLiveRating] = useState<number>(restaurant?.rating || 4.8);
  const [liveReviewsCount, setLiveReviewsCount] = useState<number>(restaurant?.reviewCount || 420);

  const handleDishClick = (dish: Dish, categoryName: string) => {
    setSelectedDishForModal({ dish, categoryName });
    if (restaurant?.id || restaurant?.slug) {
      dbService.trackEvent(restaurant.id || restaurant.slug, 'dish_view', dish.id);
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id || restaurant.slug,
          event_type: 'DISH_VIEW',
          event_value: `DISH_VIEW:${dish.name}`,
          dish_id: dish.id,
          dish_name: dish.name,
          category_name: categoryName
        })
      }).catch(() => {});
    }
  };

  useEffect(() => {
    setMounted(true);
    if (restaurant?.id || restaurant?.slug) {
      dbService.trackEvent(restaurant.id || restaurant.slug, isTableQr ? 'qr_scan' : 'page_view');
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id || restaurant.slug,
          event_type: isTableQr ? 'QR_SCAN' : 'PAGE_VIEW',
          event_value: isTableQr ? 'TABLE_QR' : 'WEB_DIRECT'
        })
      }).catch(() => {});
    }
  }, [restaurant?.id, restaurant?.slug, isTableQr]);

  // Default active category and fetch live reputation from Supabase
  useEffect(() => {
    if (restaurant && restaurant.menu.length > 0 && !activeCategory) {
      setActiveCategory(restaurant.menu[0].id);
    }
    if (restaurant) {
      setLiveRating(restaurant.rating || 4.8);
      setLiveReviewsCount(restaurant.reviewCount || 420);
    }

    // Live sync with Supabase database
    async function syncLiveReputation() {
      if (!slug) return;
      try {
        const res = await fetch('/api/restaurants');
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          const current = list.find((r: any) => r.slug === slug);
          if (current) {
            if (typeof current.rating === 'number') setLiveRating(current.rating);
            if (typeof current.reviews_count === 'number') setLiveReviewsCount(current.reviews_count);
            else if (typeof current.reviewCount === 'number') setLiveReviewsCount(current.reviewCount);
          }
        }
      } catch (e) {
        // graceful fallback
      }
    }

    syncLiveReputation();
  }, [restaurant, activeCategory, slug]);

  if (!restaurant) {
    return (
      <div className="p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-950 min-h-[60vh] flex flex-col items-center justify-center">
        <UtensilsCrossed className="w-12 h-12 text-slate-300" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Restaurante no encontrado</h2>
        <p className="text-xs text-slate-500 max-w-xs">El restaurante solicitado no está disponible en la guía de Torrelodones.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFCC00] text-[#111111] text-xs font-black shadow-md hover:bg-[#e6b800] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio</span>
        </Link>
      </div>
    );
  }

  const liveStatus = mounted ? getOpenStatus(restaurant.schedule) : null;

  const handleShare = () => {
    if (restaurant?.id || restaurant?.slug) {
      dbService.trackEvent(restaurant.id || restaurant.slug, 'share_click');
    }
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

  // Radar de Alérgenos: Interceptar filtro y emitir telemetría Big Data
  const handleFilterChange = (filterId: string | null) => {
    setSelectedDietFilter(filterId);
    if (filterId && (restaurant?.id || restaurant?.slug)) {
      const restId = restaurant.id || restaurant.slug;
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restId,
          event_type: 'FILTER_ALLERGEN',
          event_value: filterId.toUpperCase()
        })
      }).catch(() => {});
    }
  };

  // Handle dynamic rating update
  const handleRatingSubmitted = (newScore: number) => {
    const updatedCount = liveReviewsCount + 1;
    const updatedRating = parseFloat(((liveRating * liveReviewsCount + newScore) / updatedCount).toFixed(2));
    setLiveRating(updatedRating);
    setLiveReviewsCount(updatedCount);
  };

  // Open smart review modal
  const handleOpenReviewGate = (score: number) => {
    setModalInitialScore(score);
    setShowReviewModal(true);
  };

  // Count total and matching dishes
  const allDishes = (restaurant.menu || []).flatMap((cat) => cat.dishes || []);
  const currentFilterObj = DIET_FILTERS.find((f) => f.id === selectedDietFilter);
  const matchingDishesCount = currentFilterObj
    ? allDishes.filter(currentFilterObj.check).length
    : allDishes.length;

  // Schema.org Restaurant Schema JSON-LD for rich snippets
  const schemaRestaurant = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name || 'Restaurante en Torrelodones',
    description: restaurant.description || '',
    image: restaurant.coverImage || '',
    servesCuisine: restaurant.cuisine || 'Gastronomía',
    priceRange: restaurant.priceLevel || '€€',
    telephone: restaurant.phone || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address || 'Torrelodones, Madrid',
      addressLocality: 'Torrelodones',
      addressRegion: 'Madrid',
      postalCode: '28250',
      addressCountry: 'ES',
    },
    hasMenu: {
      '@type': 'Menu',
      name: `Carta de ${restaurant.name}`,
      hasMenuSection: (restaurant.menu || []).map((cat) => ({
        '@type': 'MenuSection',
        name: cat.name || 'Categoría',
        hasMenuItem: (cat.dishes || []).map((d) => ({
          '@type': 'MenuItem',
          name: d.name || 'Plato',
          description: d.description || '',
          offers: {
            '@type': 'Offer',
            price: typeof d.price === 'number' ? d.price.toFixed(2) : String(d.price || '0.00'),
            priceCurrency: 'EUR',
          },
        })),
      })),
    },
  };

  return (
    <div className="space-y-4 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors pb-12">
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
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/');
                }
              }}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all active:scale-90 shadow-md"
              title="Volver al directorio"
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
                    {liveStatus.isOpen ? 'Abierto ahora' : (liveStatus.label || 'Cerrado ahora')}
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
            <div className="flex items-center gap-1.5 text-xs text-[#FFCC00] font-bold uppercase tracking-wider">
              <span>{restaurant.cuisine}</span>
              <span>•</span>
              <span className="text-white bg-white/20 px-1.5 py-0.2 rounded font-black">{restaurant.priceLevel}</span>
            </div>
            <h1 className="text-2xl font-black leading-tight drop-shadow-md">
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-200 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-[#FFCC00]">
                <Star className="w-3.5 h-3.5 fill-[#FFCC00] text-[#FFCC00]" />
                {liveRating.toFixed(1)}
              </span>
              <span>({liveReviewsCount} opiniones)</span>
              
              {restaurant.capacity && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-bold text-white">
                    <Users className="w-3 h-3 text-[#FFCC00]" />
                    <span>Aforo: {restaurant.capacity} plazas</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Banner de Aviso si el Restaurante está Cerrado Temporalmente */}
        {liveStatus && !liveStatus.isOpen && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 shadow-sm">
            <span className="flex h-3 w-3 relative flex-shrink-0">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <div className="text-xs">
              <span className="font-bold">Aviso del Local:</span> {liveStatus.label}
            </div>
          </div>
        )}

        {/* Quick Contact & Action Buttons Bar */}
        <div className="px-4 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          {/* Rating Header Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
            <RatingHeader
              rating={liveRating}
              reviewsCount={liveReviewsCount}
              isVerified={restaurant.isVerified ?? true}
              googleMapsUrl={restaurant.googleMapsUrl}
              onOpenReviews={() => setShowReviewModal(true)}
            />
          </div>

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
                    onClick={() => {
                      dbService.trackEvent(restaurant.id || restaurant.slug, 'call_click');
                      fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          restaurant_id: restaurant.id || restaurant.slug,
                          event_type: 'CLICK_CALL'
                        })
                      }).catch(() => {});
                    }}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 text-center transition-all active:scale-95 shadow-sm"
                  >
                    <Phone className="w-4 h-4 text-slate-700 dark:text-slate-300 mb-1" />
                    <span className="text-[11px] font-bold">Llamar</span>
                  </a>
                )}

                {/* WhatsApp */}
                {hasWhatsapp && (
                  <a
                    href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}?text=Hola,%20he%20visto%20vuestra%20carta%20en%20GastroTorre%20y%20quer%C3%ADa%20haceros%20una%20consulta%20sobre%20${encodeURIComponent(restaurant.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => dbService.trackEvent(restaurant.id || restaurant.slug, 'whatsapp_click')}
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
                    onClick={() => dbService.trackEvent(restaurant.id || restaurant.slug, 'directions_click')}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 text-center transition-all active:scale-95 shadow-sm"
                  >
                    <Navigation className="w-4 h-4 text-[#FFCC00] mb-1" />
                    <span className="text-[11px] font-bold">Cómo llegar</span>
                  </a>
                )}
              </div>
            );
          })()}

          {/* Schedule, Address & Capacity info */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 truncate min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#FFCC00] shrink-0" />
              <span className="truncate font-medium text-slate-700 dark:text-slate-300">{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {restaurant.capacity && (
                <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Users className="w-3 h-3 text-[#FFCC00]" />
                  <span>Aforo: {restaurant.capacity}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-[#FFCC00] transition-colors"
              >
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{restaurant.schedule.days}</span>
              </button>
            </div>
          </div>
        </div>
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

      {/* ADVANCED ALLERGEN & DIETARY FILTER BAR (RADAR DE ALÉRGENOS) */}
      <div className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-[#FFCC00]" />
            <span>Filtro de Alérgenos & Dietas:</span>
          </div>

          <button
            onClick={() => setShowAllergensGuide(true)}
            className="text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#FFCC00] hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Info 14 Alérgenos</span>
          </button>
        </div>

        {/* Filter Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => handleFilterChange(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all shrink-0 flex items-center gap-1.5 ${
              selectedDietFilter === null
                ? 'bg-[#FFCC00] text-[#111111] font-black border-2 border-[#111111] shadow-sm ring-2 ring-[#FFCC00]/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs'
            }`}
          >
            <span>🍽️ Toda la carta</span>
          </button>

          {DIET_FILTERS.map((filter) => {
            const isSelected = selectedDietFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(isSelected ? null : filter.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-black border-2 border-emerald-500 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-400/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs'
                }`}
              >
                <span className="text-sm">{filter.emoji}</span>
                <span className="text-slate-900 dark:text-white font-bold">{filter.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Filter status banner if active */}
        {selectedDietFilter && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400 dark:border-emerald-600 p-3 rounded-2xl text-xs flex items-center justify-between shadow-sm animate-fadeIn">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>✅</span>
              <span>Mostrando <strong className="text-emerald-700 dark:text-emerald-300 font-black">{matchingDishesCount}</strong> platos aptos para <strong className="text-emerald-700 dark:text-emerald-300 font-black">{currentFilterObj?.name}</strong></span>
            </span>
            <button
              onClick={() => handleFilterChange(null)}
              className="text-xs font-black text-emerald-800 dark:text-emerald-200 hover:underline bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-lg shrink-0 border border-emerald-300 dark:border-emerald-700"
            >
              Quitar filtro ✕
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
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs transition-all shrink-0 ${
                activeCategory === category.id
                  ? 'bg-[#FFCC00] text-[#111111] font-black shadow-md border-2 border-[#111111]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs'
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
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-baseline justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{category.description}</p>
                  )}
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  {dishes.length} {dishes.length === 1 ? 'plato' : 'platos'}
                </span>
              </div>

              {/* Dishes List */}
              <div className="space-y-3">
                {dishes.map((dish) => {
                  const dishPhoto = dish.image || (dish as any).photo_url;
                  return (
                    <div
                      key={dish.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDishClick(dish, category.name);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleDishClick(dish, category.name);
                        }
                      }}
                      className={`p-4 rounded-3xl border transition-all cursor-pointer group active:scale-[0.98] select-none ${
                        dish.isAvailable
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft hover:shadow-float hover:border-[#FFCC00] hover:ring-2 hover:ring-[#FFCC00]/20'
                          : 'bg-slate-100/70 dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex gap-3.5">
                        {/* Dish Details */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          {/* Specialty / Available / Diet Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {dish.isSpecialty && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFCC00]/20 dark:bg-[#FFCC00]/20 text-[#111111] dark:text-[#FFCC00] text-[10px] font-black uppercase tracking-wider border border-[#FFCC00]/40">
                                <Sparkles className="w-3 h-3 text-[#FFCC00]" />
                                Especialidad
                              </span>
                            )}

                            {!dish.isAvailable && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-950 dark:text-rose-200 text-[10px] font-black uppercase border border-rose-300 dark:border-rose-800">
                                Agotado hoy
                              </span>
                            )}

                            {dish.isGlutenFree && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                                ✅ Apto Celíacos (Sin Gluten)
                              </span>
                            )}
                          </div>

                          {/* Dish Name */}
                          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-amber-500 dark:group-hover:text-[#FFCC00] transition-colors flex items-center justify-between gap-2">
                            <span>{dish.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal opacity-0 group-hover:opacity-100 transition-opacity">Ver detalle 🔍</span>
                          </h4>

                          {/* Description */}
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {dish.description}
                          </p>

                          {/* Allergens Row with Clear Labeling */}
                          {dish.allergens && dish.allergens.length > 0 && (
                            <div className="pt-1.5">
                              <div className="flex flex-wrap items-center gap-1">
                                {dish.allergens.map((alg, idx) => (
                                  <AllergenBadge key={idx} type={alg} showText={true} prefix={true} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price and Thumbnail Image */}
                        <div className="flex flex-col items-end justify-between shrink-0">
                          <span className="text-base font-black text-[#111111] dark:text-white bg-[#FFCC00]/20 dark:bg-[#FFCC00]/25 px-2.5 py-1 rounded-xl border border-[#FFCC00]/50 shadow-sm">
                            {dish.price.toFixed(2)}€
                          </span>

                          {dishPhoto && (
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mt-2 group-hover:scale-105 transition-transform">
                              <img
                                src={dishPhoto}
                                alt={dish.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* RATING FOOTER (VALORACIÓN RÁPIDA 1-5 ESTRELLAS) */}
      <div className="px-4 pt-4">
        <RatingFooter
          restaurantId={restaurant.id || restaurant.slug}
          restaurantName={restaurant.name}
          onRatingSubmitted={handleRatingSubmitted}
          onOpenReviewGate={handleOpenReviewGate}
        />
      </div>

      {/* BRANDING FOOTER */}
      <div className="px-4 py-8 text-center space-y-2 border-t border-slate-200 dark:border-slate-800 mt-6 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-center gap-1.5 text-xs font-black text-slate-800 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-[#FFCC00]"></span>
          <span>Proporcionado por GastroTorre</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Cartas digitales en tiempo real y directorio gastronómico de Torrelodones.
        </p>
        <Link
          href="/"
          className="inline-block text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-[#FFCC00] dark:hover:text-[#FFCC00] hover:underline pt-1"
        >
          Explorar más restaurantes de Torrelodones →
        </Link>
      </div>

      {/* SMART REVIEW GATE MODAL (1.5H & ?demo=true) */}
      <ReviewGateModal
        restaurantId={restaurant.id || restaurant.slug}
        restaurantName={restaurant.name}
        googleMapsUrl={restaurant.googleMapsUrl}
        isOpenExplicitly={showReviewModal}
        initialScore={modalInitialScore}
        onClose={() => setShowReviewModal(false)}
      />

      {/* SCHEDULE MODAL */}
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
              {restaurant.schedule.isTemporarilyClosed && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/70 rounded-2xl border border-rose-200 dark:border-rose-800 text-xs space-y-1">
                  <div className="font-black text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>Aviso de Cierre Temporal</span>
                  </div>
                  <p className="text-rose-800 dark:text-rose-300 text-[11px] leading-relaxed">
                    {restaurant.schedule.closedReason || 'Cerrado temporalmente por asuntos propios.'}
                  </p>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Días de apertura:</span>
                <span className="font-black text-slate-900 dark:text-white">{restaurant.schedule.days}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Servicio Comidas:</span>
                <span className="font-black text-slate-900 dark:text-white">{restaurant.schedule.lunch}</span>
              </div>

              {restaurant.schedule.dinner && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Servicio Cenas:</span>
                  <span className="font-black text-slate-900 dark:text-white">{restaurant.schedule.dinner}</span>
                </div>
              )}

              {restaurant.capacity && (
                <div className="p-3 bg-[#FFCC00]/10 dark:bg-[#FFCC00]/10 rounded-2xl border border-[#FFCC00]/30 flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#FFCC00]" />
                    <span>Aforo total del local:</span>
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">{restaurant.capacity} comensales</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowScheduleModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#FFCC00] hover:bg-[#e6b800] text-[#111111] text-xs font-black transition-all shadow-md"
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
              {OFFICIAL_ALLERGENS.map((alg) => {
                const matchingDiet = DIET_FILTERS.find((f) => (f as any).allergenId === alg.id);
                return (
                  <button
                    key={alg.id}
                    type="button"
                    onClick={() => {
                      if (matchingDiet) {
                        handleFilterChange(matchingDiet.id);
                        setShowAllergensGuide(false);
                      }
                    }}
                    className={`p-2.5 rounded-2xl border ${alg.bg} ${alg.border} flex items-start gap-2.5 transition-all text-left hover:scale-[1.02] active:scale-95 group cursor-pointer`}
                    title={`Filtrar platos sin ${alg.shortName}`}
                  >
                    <span className="text-xl shrink-0 select-none">{alg.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className={`text-xs font-black ${alg.color}`}>{alg.name}</h5>
                        {matchingDiet && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white/70 dark:bg-black/40 px-1.5 py-0.5 rounded-md shrink-0">
                            Filtrar ➔
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight mt-0.5">{alg.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold block">⚠️ Aviso importante para personas con alergias graves:</span>
              <p>Aunque cuidamos al máximo la elaboración, en cocina puede existir contaminación cruzada involuntaria. Por favor avisa a nuestro personal al llegar.</p>
            </div>

            <button
              onClick={() => setShowAllergensGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#FFCC00] hover:bg-[#e6b800] text-[#111111] text-xs font-black transition-all shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* DISH DETAIL LIGHTBOX / MODAL */}
      <DishDetailModal
        isOpen={Boolean(selectedDishForModal)}
        onClose={() => setSelectedDishForModal(null)}
        dish={selectedDishForModal?.dish || null}
        categoryName={selectedDishForModal?.categoryName}
        restaurantName={restaurant.name}
        restaurantSlug={restaurant.slug}
      />
    </div>
  );
}
