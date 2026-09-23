'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRestaurants } from '@/context/RestaurantContext';
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  MessageCircle, 
  ArrowRight, 
  Clock, 
  Flame, 
  UtensilsCrossed,
  Building2,
  Users
} from 'lucide-react';
import { FeaturedWeeklyBanner } from '@/components/FeaturedWeeklyBanner';
import { getOpenStatus } from '@/utils/schedule';
import { Restaurant } from '@/data/restaurants';

type FilterCategory = 'todos' | 'carnes' | 'italiana' | 'mediterranea' | 'burgers' | 'brunch' | 'terraza' | 'celiacos';
type ZoneFilter = 'todas' | 'pueblo' | 'colonia';

export default function HomePage() {
  const { restaurants } = useRestaurants();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('todos');
  const [selectedZone, setSelectedZone] = useState<ZoneFilter>('todas');
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Scroll position restoration for seamless back-navigation
  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const savedScroll = sessionStorage.getItem('gastrotorre_home_scroll');
      if (savedScroll) {
        const targetY = Number(savedScroll);
        // Instant restore after layout tick
        const timeout = setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: 'instant' });
        }, 60);
        return () => clearTimeout(timeout);
      }

      const onScroll = () => {
        if (window.scrollY > 0) {
          sessionStorage.setItem('gastrotorre_home_scroll', String(window.scrollY));
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, []);

  // Helper to normalize strings removing accents/tildes
  const normalizeText = (text: string) =>
    text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  // Count currently open restaurants
  const openCount = useMemo(() => {
    return restaurants.filter((r) => getOpenStatus(r.schedule).isOpen).length;
  }, [restaurants]);

  // Filter logic
  const filteredRestaurants = useMemo(() => {
    const normalizedQuery = normalizeText(searchTerm);

    return restaurants.filter((r) => {
      // Open now filter
      if (onlyOpenNow) {
        const status = getOpenStatus(r.schedule);
        if (!status.isOpen) return false;
      }

      // Zone filter
      if (selectedZone === 'pueblo' && !normalizeText(r.zone).includes('pueblo')) return false;
      if (selectedZone === 'colonia' && !normalizeText(r.zone).includes('colonia')) return false;

      // Search term matching
      if (normalizedQuery) {
        const matchesSearch =
          normalizeText(r.name).includes(normalizedQuery) ||
          normalizeText(r.cuisine).includes(normalizedQuery) ||
          normalizeText(r.tagline).includes(normalizedQuery) ||
          normalizeText(r.zone).includes(normalizedQuery) ||
          (r.features || []).some((f) => normalizeText(f).includes(normalizedQuery)) ||
          (r.menu || []).some((cat) =>
            normalizeText(cat.name).includes(normalizedQuery) ||
            (cat.dishes || []).some((d) =>
              normalizeText(d.name).includes(normalizedQuery) ||
              normalizeText(d.description).includes(normalizedQuery)
            )
          );

        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedFilter === 'todos') return true;
      if (selectedFilter === 'terraza') {
        return (r.features || []).some((f) => normalizeText(f).includes('terraza'));
      }
      if (selectedFilter === 'celiacos') {
        return (r.features || []).some((f) => normalizeText(f).includes('celiac') || normalizeText(f).includes('sin gluten')) ||
          (r.menu || []).some(cat => (cat.dishes || []).some(d => d.isGlutenFree));
      }
      return r.category === selectedFilter;
    });
  }, [restaurants, searchTerm, selectedFilter, selectedZone, onlyOpenNow]);

  const categories = [
    { id: 'todos', label: '🔥 Todos' },
    { id: 'carnes', label: '🥩 Brasas & Carnes' },
    { id: 'italiana', label: '🍕 Italiana & Pizza' },
    { id: 'mediterranea', label: '🥘 Arroces & Mercado' },
    { id: 'burgers', label: '🍔 Smash Burgers' },
    { id: 'brunch', label: '☕ Brunch & Café' },
    { id: 'terraza', label: '🌿 Con Terraza' },
    { id: 'celiacos', label: '🌾 Sin Gluten' },
  ];

  // Schema.org JSON-LD LocalBusiness directory data for Google & GEO
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Guía de Restaurantes y Hostelería de Torrelodones',
    description: 'Directorio y cartas digitales de los mejores restaurantes de Torrelodones (Madrid).',
    itemListElement: restaurants.map((r, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Restaurant',
        name: r.name,
        description: r.description,
        servesCuisine: r.cuisine,
        priceRange: r.priceLevel,
        telephone: r.phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: r.address,
          addressLocality: 'Torrelodones',
          addressRegion: 'Madrid',
          postalCode: '28250',
          addressCountry: 'ES',
        },
      },
    })),
  };

  return (
    <div className="space-y-5">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Hero Search Section */}
      <section className="bg-gradient-to-b from-torre-50/80 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 px-4 pt-5 pb-1">
        <div className="text-center space-y-1.5 mb-3">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            ¿Dónde comer hoy en <span className="text-torre-600">Torrelodones</span>?
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
            Cartas digitales con precios actualizados y fotos reales
          </p>
        </div>

        {/* Search input */}
        <div className="relative mt-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por restaurante, plato (chuletón, pizza, smash...)"
            className="w-full pl-10 pr-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-torre-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Zone Selector: Pueblo vs Colonia */}
        <div className="mt-3 flex items-center justify-between bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setSelectedZone('todas')}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              selectedZone === 'todas'
                ? 'bg-torre-600 text-white shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todo Torrelodones
          </button>
          <button
            onClick={() => setSelectedZone('pueblo')}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              selectedZone === 'pueblo'
                ? 'bg-torre-600 text-white shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pueblo
          </button>
          <button
            onClick={() => setSelectedZone('colonia')}
            className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
              selectedZone === 'colonia'
                ? 'bg-torre-600 text-white shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Colonia
          </button>
        </div>

        {/* Filter Badges Carousel with Abiertos Ahora */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Real-time Open Now Toggle Button */}
          <button
            onClick={() => setOnlyOpenNow(!onlyOpenNow)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              onlyOpenNow
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30 scale-105'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlyOpenNow ? 'bg-white animate-ping' : 'bg-emerald-500'}`} />
            <span>Abiertos Ahora ({openCount})</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id as FilterCategory)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs transition-all shrink-0 ${
                selectedFilter === cat.id
                  ? 'bg-torre-600 text-white font-black shadow-md border-2 border-torre-500 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED RESTAURANT OF THE WEEK BANNER (Solo visible en 'Todo Torrelodones') */}
      {selectedZone === 'todas' && !searchTerm && !onlyOpenNow && (
        <section className="px-4">
          <FeaturedWeeklyBanner restaurants={restaurants} />
        </section>
      )}

      {/* Directory Listings */}
      <section className="px-4 space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">
              Restaurantes Disponibles
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
              {filteredRestaurants.length}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Cartas en vivo
          </span>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <UtensilsCrossed className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No encontramos ningún restaurante con esos filtros</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Prueba con otra búsqueda, cambia de zona o desactiva 'Abiertos Ahora'</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFilter('todos');
                setSelectedZone('todas');
                setOnlyOpenNow(false);
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-torre-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant) => {
              const liveStatus = mounted ? getOpenStatus(restaurant.schedule) : null;

              return (
                <div
                  key={restaurant.id}
                  className="bg-white dark:bg-slate-850 dark:bg-slate-800/90 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-soft hover:shadow-float transition-all duration-200 group"
                >
                  {/* Clickable Image Header */}
                  <Link
                    href={`/restaurante/${restaurant.slug}`}
                    className="block relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer group/img"
                  >
                    <img
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>

                    {/* Top Badges (Rating on Left, Real-Time Status on Right) */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-[11px] font-black text-slate-900 dark:text-white shadow-md flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{restaurant.rating}</span>
                        <span className="text-slate-400 font-normal">({restaurant.reviewCount})</span>
                      </span>

                      {liveStatus && (
                        liveStatus.isOpen ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black shadow-lg flex items-center gap-1.5 bg-emerald-600 text-white border border-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            <span>Abierto ahora</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-black shadow-lg flex items-center gap-1.5 bg-slate-900/90 text-rose-300 border border-rose-500/60 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                            <span>{liveStatus.label}</span>
                          </span>
                        )
                      )}
                    </div>

                    {/* Bottom Image Info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-oro-300 mb-0.5">
                        <span>{restaurant.cuisine}</span>
                        <span>•</span>
                        <span className="text-white bg-white/20 px-1.5 py-0.2 rounded font-black">{restaurant.priceLevel}</span>
                      </div>
                      <h3 className="text-lg font-black leading-tight drop-shadow-sm group-hover/img:text-oro-300 transition-colors">
                        {restaurant.name}
                      </h3>
                    </div>
                  </Link>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {restaurant.tagline}
                    </p>

                    {/* Meta info row */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-2 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-torre-600 shrink-0" />
                        <span>{restaurant.zone}</span>
                      </div>

                      {restaurant.capacity && (
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <Users className="w-3.5 h-3.5 text-torre-600 shrink-0" />
                          <span>Aforo: {restaurant.capacity} plazas</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium ml-auto">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{restaurant.schedule.days}</span>
                      </div>
                    </div>

                    {/* Highlights Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {restaurant.features.slice(0, 3).map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-torre-50 dark:bg-torre-950/60 text-torre-800 dark:text-torre-200 text-[10px] font-semibold border border-torre-100 dark:border-torre-800/40"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>

                    {/* CTA Action Buttons */}
                    {(() => {
                      const hasWhatsapp = Boolean(restaurant.whatsapp && restaurant.whatsapp.trim().length > 0);
                      const hasPhone = Boolean(restaurant.phone && restaurant.phone.trim().length > 0);
                      const showBooking = hasWhatsapp || hasPhone;

                      return (
                        <div className={`pt-2 grid ${showBooking ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                          <Link
                            href={`/restaurante/${restaurant.slug}`}
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                sessionStorage.setItem('gastrotorre_home_scroll', String(window.scrollY));
                              }
                            }}
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all text-center"
                          >
                            <span>Ver Carta Digital</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>

                          {hasWhatsapp && restaurant.bookingType === 'whatsapp' ? (
                            <a
                              href={`https://wa.me/${restaurant.whatsapp.replace(/[^0-9]/g, '')}?text=Hola,%20he%20visto%20vuestra%20carta%20en%20GastroTorre%20y%20quer%C3%ADa%20haceros%20una%20consulta%20sobre%20${encodeURIComponent(restaurant.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/50 active:scale-95 transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>WhatsApp</span>
                            </a>
                          ) : hasPhone ? (
                            <a
                              href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600 active:scale-95 transition-all"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                              <span>Llamar</span>
                            </a>
                          ) : null}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
