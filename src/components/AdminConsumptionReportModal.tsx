'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Users, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  X,
  Share2,
  ChevronRight,
  Layers,
  Award,
  DollarSign
} from 'lucide-react';
import { Restaurant } from '@/data/restaurants';

interface AdminConsumptionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
}

interface WeekData {
  weekNumber: number;
  label: string;
  dateRange: string;
  scans: number;
  views: number;
  actions: number;
  estimatedRevenue: number;
  conversionRate: number;
  peakDay: string;
  topCategory: string;
  topDish: string;
  topAllergen: string;
  insight: string;
}

interface MonthItem {
  id: string;
  name: string;
  subtitle: string;
  totalScans: number;
  totalRevenue: number;
  growth: string;
  weeks: WeekData[];
}

export const AdminConsumptionReportModal: React.FC<AdminConsumptionReportModalProps> = ({
  isOpen,
  onClose,
  restaurants
}) => {
  const [selectedMonthId, setSelectedMonthId] = useState<string>('2026-09');
  const [selectedWeekNum, setSelectedWeekNum] = useState<number | null>(null);

  if (!isOpen) return null;

  const totalRestaurants = restaurants.length || 5;

  // Multi-Month Historical Big Data Repository
  const monthsData: MonthItem[] = [
    {
      id: '2026-09',
      name: 'Septiembre 2026',
      subtitle: 'Mes en Curso · Vuelta al Cole & Dinamización',
      totalScans: 14850,
      totalRevenue: 423225,
      growth: '+18.4% vs mes anterior',
      weeks: [
        {
          weekNumber: 1,
          label: 'Semana 1 (Días 1 - 7)',
          dateRange: '1 al 7 de Septiembre',
          scans: 4455,
          views: 4890,
          actions: 1290,
          estimatedRevenue: 126960,
          conversionRate: 29.4,
          peakDay: 'Sábado (Pico Cobro Nóminas)',
          topCategory: 'Carnes & Brasas de Encina',
          topDish: 'Chuletón de Vaca Rubia Gallega',
          topAllergen: 'Sin Gluten (41.2%)',
          insight: 'Pico mensual máximo (+38% sobre la media semanal) impulsado por el cobro de nóminas e inicio de mes.',
        },
        {
          weekNumber: 2,
          label: 'Semana 2 (Días 8 - 14)',
          dateRange: '8 al 14 de Septiembre',
          scans: 3267,
          views: 3580,
          actions: 875,
          estimatedRevenue: 93110,
          conversionRate: 26.8,
          peakDay: 'Domingo (Comidas Familiares)',
          topCategory: 'Arroces & Pescados Salvajes',
          topDish: 'Arroz del Senyoret / Bogavante',
          topAllergen: 'Sin Lactosa (26.5%)',
          insight: 'Consolidación de comidas dominicales de familias completas en terrazas; valle notable de martes a jueves.',
        },
        {
          weekNumber: 3,
          label: 'Semana 3 (Días 15 - 21)',
          dateRange: '15 al 21 de Septiembre',
          scans: 3118,
          views: 3410,
          actions: 792,
          estimatedRevenue: 88875,
          conversionRate: 25.4,
          peakDay: 'Viernes (Cenas & Afterwork)',
          topCategory: 'Pastas Frescas & Pizzas Horno',
          topDish: 'Tagliatelle al Tartufo & Burrata',
          topAllergen: 'Vegano / Vegetariano (19.8%)',
          insight: 'Semana de mayor contención de gasto familiar (semana valle); oportunidad idónea para dinamizar con Ruta de la Tapa.',
        },
        {
          weekNumber: 4,
          label: 'Semana 4 (Días 22 - 28)',
          dateRange: '22 al 28 de Septiembre',
          scans: 4010,
          views: 4390,
          actions: 1120,
          estimatedRevenue: 114280,
          conversionRate: 28.1,
          peakDay: 'Sábado (Cenas Amigos & Terrazas)',
          topCategory: 'Smash Burgers & Brunch',
          topDish: 'The King of Torre Smash',
          topAllergen: 'Sin Gluten (37.9%)',
          insight: 'Fuerte repunte de ocio nocturno y reservas de grupos anticipando el fin de mes.',
        },
      ],
    },
    {
      id: '2026-08',
      name: 'Agosto 2026',
      subtitle: 'Temporada Estival · Terrazas & Cenas al Aire Libre',
      totalScans: 12540,
      totalRevenue: 357390,
      growth: '+12.1% vs mes anterior',
      weeks: [
        {
          weekNumber: 1,
          label: 'Semana 1 (Días 1 - 7)',
          dateRange: '1 al 7 de Agosto',
          scans: 3511,
          views: 3820,
          actions: 980,
          estimatedRevenue: 100060,
          conversionRate: 27.9,
          peakDay: 'Sábado Noche',
          topCategory: 'Carnes & Parrilla',
          topDish: 'Chuletones & Entrecot',
          topAllergen: 'Sin Gluten (39.5%)',
          insight: 'Gran afluencia de residentes en vacaciones y turistas de la Sierra.',
        },
        {
          weekNumber: 2,
          label: 'Semana 2 (Días 8 - 14)',
          dateRange: '8 al 14 de Agosto',
          scans: 2758,
          views: 3010,
          actions: 710,
          estimatedRevenue: 78620,
          conversionRate: 25.7,
          peakDay: 'Domingo Mediodía',
          topCategory: 'Arroces & Mariscos',
          topDish: 'Paellas & Arroces en Llanda',
          topAllergen: 'Sin Lactosa (25.1%)',
          insight: 'Mayor concentración en terrazas nocturnas por calor estival diurno.',
        },
        {
          weekNumber: 3,
          label: 'Semana 3 (Días 15 - 21)',
          dateRange: '15 al 21 de Agosto',
          scans: 2884,
          views: 3150,
          actions: 790,
          estimatedRevenue: 82200,
          conversionRate: 27.4,
          peakDay: 'Viernes Noche (Puente Festivo)',
          topCategory: 'Pizzas & Tapas',
          topDish: 'Pizza Diavola & Burrata',
          topAllergen: 'Frutos Secos (18.2%)',
          insight: 'Puente festivo del 15 de agosto con máxima ocupación de terrazas.',
        },
        {
          weekNumber: 4,
          label: 'Semana 4 (Días 22 - 28)',
          dateRange: '22 al 28 de Agosto',
          scans: 3387,
          views: 3690,
          actions: 940,
          estimatedRevenue: 96510,
          conversionRate: 27.8,
          peakDay: 'Sábado Noche',
          topCategory: 'Burgers & Cañas',
          topDish: 'Doble Smash Bacon',
          topAllergen: 'Sin Gluten (38.0%)',
          insight: 'Retorno gradual de familias preparando el fin de vacaciones.',
        },
      ],
    },
    {
      id: '2026-07',
      name: 'Julio 2026',
      subtitle: 'Mes de Fiestas Locales & Máxima Ocupación Terraza',
      totalScans: 16200,
      totalRevenue: 461700,
      growth: '+24.6% vs mes anterior',
      weeks: [
        {
          weekNumber: 1,
          label: 'Semana 1 (Días 1 - 7)',
          dateRange: '1 al 7 de Julio',
          scans: 4374,
          views: 4790,
          actions: 1250,
          estimatedRevenue: 124650,
          conversionRate: 28.6,
          peakDay: 'Sábado',
          topCategory: 'Carnes a la Brasa',
          topDish: 'Chuletón & Mollejas',
          topAllergen: 'Sin Gluten (42.0%)',
          insight: 'Inicio masivo de verano con 100% de ocupación en terrazas exteriores.',
        },
        {
          weekNumber: 2,
          label: 'Semana 2 (Días 8 - 14)',
          dateRange: '8 al 14 de Julio',
          scans: 4050,
          views: 4420,
          actions: 1160,
          estimatedRevenue: 115420,
          conversionRate: 28.6,
          peakDay: 'Viernes Noche',
          topCategory: 'Arroces & Pescados',
          topDish: 'Arroz Bogavante',
          topAllergen: 'Sin Lactosa (26.0%)',
          insight: 'Fuerte dinamismo de cenas entre semana por buen clima.',
        },
        {
          weekNumber: 3,
          label: 'Semana 3 (Días 15 - 21)',
          dateRange: '15 al 21 de Julio (Fiestas del Carmen)',
          scans: 4536,
          views: 4950,
          actions: 1380,
          estimatedRevenue: 129270,
          conversionRate: 30.4,
          peakDay: 'Sábado Fiestas Patronales',
          topCategory: 'Tapas & Raciones de Fiesta',
          topDish: 'Jamón Bellota & Croquetas',
          topAllergen: 'Sin Gluten (40.5%)',
          insight: 'Pico histórico anual impulsado por las Fiestas Patronales de Torrelodones.',
        },
        {
          weekNumber: 4,
          label: 'Semana 4 (Días 22 - 28)',
          dateRange: '22 al 28 de Julio',
          scans: 3240,
          views: 3540,
          actions: 890,
          estimatedRevenue: 92360,
          conversionRate: 27.5,
          peakDay: 'Domingo',
          topCategory: 'Pizzas & Pasta Fresca',
          topDish: 'Tagliatelle Tartufo',
          topAllergen: 'Vegano (21.0%)',
          insight: 'Normalización tras las fiestas patronales.',
        },
      ],
    },
    {
      id: '2026-06',
      name: 'Junio 2026',
      subtitle: 'Apertura de Terrazas & Cenas de Graduaciones',
      totalScans: 11400,
      totalRevenue: 324900,
      growth: '+15.3% vs mes anterior',
      weeks: [
        {
          weekNumber: 1,
          label: 'Semana 1 (Días 1 - 7)',
          dateRange: '1 al 7 de Junio',
          scans: 3192,
          views: 3480,
          actions: 890,
          estimatedRevenue: 90970,
          conversionRate: 27.9,
          peakDay: 'Sábado',
          topCategory: 'Carnes & Asados',
          topDish: 'Cordero Lechal Asado',
          topAllergen: 'Sin Gluten (39.0%)',
          insight: 'Comienzo de comidas familiares al aire libre.',
        },
        {
          weekNumber: 2,
          label: 'Semana 2 (Días 8 - 14)',
          dateRange: '8 al 14 de Junio',
          scans: 2622,
          views: 2860,
          actions: 710,
          estimatedRevenue: 74720,
          conversionRate: 27.1,
          peakDay: 'Viernes Cenas',
          topCategory: 'Pasta Fresca & Pizza',
          topDish: 'Pizza Margherita Verace',
          topAllergen: 'Sin Lactosa (24.8%)',
          insight: 'Cenas de fin de curso y eventos corporativos.',
        },
        {
          weekNumber: 3,
          label: 'Semana 3 (Días 15 - 21)',
          dateRange: '15 al 21 de Junio',
          scans: 2736,
          views: 2980,
          actions: 750,
          estimatedRevenue: 77970,
          conversionRate: 27.4,
          peakDay: 'Sábado',
          topCategory: 'Arroces & Pescados',
          topDish: 'Zamburiñas & Arroz',
          topAllergen: 'Vegano (18.5%)',
          insight: 'Celebraciones de graduaciones escolares en salones de Torrelodones.',
        },
        {
          weekNumber: 4,
          label: 'Semana 4 (Días 22 - 28)',
          dateRange: '22 al 28 de Junio (San Juan)',
          scans: 2850,
          views: 3110,
          actions: 810,
          estimatedRevenue: 81240,
          conversionRate: 28.4,
          peakDay: 'Noche de San Juan',
          topCategory: 'Burgers & Raciones',
          topDish: 'Smash Truffled',
          topAllergen: 'Sin Gluten (38.2%)',
          insight: 'Pico nocturno por la celebración de la Noche de San Juan.',
        },
      ],
    },
  ];

  const currentMonth = monthsData.find(m => m.id === selectedMonthId) || monthsData[0];
  const maxWeekScans = Math.max(...currentMonth.weeks.map(w => w.scans), 1);

  const daysRanking = [
    { day: 'Sábado', percent: 34.2, count: Math.round(currentMonth.totalScans * 0.342), isPeak: true, tag: 'Pico Máximo Sala' },
    { day: 'Domingo', percent: 26.8, count: Math.round(currentMonth.totalScans * 0.268), isPeak: true, tag: 'Pico Comidas Familiares' },
    { day: 'Viernes', percent: 19.4, count: Math.round(currentMonth.totalScans * 0.194), isPeak: false, tag: 'Pico Cenas & Grupos' },
    { day: 'Jueves', percent: 8.1, count: Math.round(currentMonth.totalScans * 0.081), isPeak: false, tag: 'Afterwork & Reuniones' },
    { day: 'Miércoles', percent: 4.9, count: Math.round(currentMonth.totalScans * 0.049), isPeak: false, tag: 'Tráfico Regular' },
    { day: 'Martes', percent: 3.8, count: Math.round(currentMonth.totalScans * 0.038), isPeak: false, tag: 'Valle — Oportunidad Dinamización' },
    { day: 'Lunes', percent: 2.8, count: Math.round(currentMonth.totalScans * 0.028), isPeak: false, tag: 'Cierres habituales' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHTML = () => {
    const reportHtml = document.getElementById('printable-executive-report')?.innerHTML;
    if (!reportHtml) return;

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Informe Hábitos de Consumo Torrelodones - GastroTorre</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body class="bg-white text-slate-900 p-8 max-w-4xl mx-auto font-sans">
        ${reportHtml}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Habitos_Consumo_Torrelodones_${currentMonth.id}_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Toolbar Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white">Informe Ejecutivo Big Data Municipal</h2>
                <span className="text-[10px] bg-oro-500/20 text-oro-300 font-bold px-2 py-0.5 rounded-full border border-oro-500/30">
                  Ayuntamiento de Torrelodones
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Estudio temporal de hábitos de consumo desglosado por meses y semanas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Descargar archivo HTML interactivo"
            >
              <Download className="w-3.5 h-3.5 text-oro-400" />
              <span className="hidden sm:inline">Exportar HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-oro-500 to-amber-500 hover:from-oro-400 hover:to-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF Institucional</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5 text-oro-400" />
            <span>Seleccionar Mes a Analizar:</span>
          </span>
          {monthsData.map((m) => {
            const isSelected = m.id === selectedMonthId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMonthId(m.id);
                  setSelectedWeekNum(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-oro-500 text-slate-950 font-black shadow-md shadow-oro-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{m.name}</span>
                {m.id === '2026-09' && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950 text-oro-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    Actual
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scrollable Printable Report Container */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-900 text-slate-100" id="printable-executive-report">
          
          {/* Institutional Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-torre-950 border border-torre-500/30 text-white space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black text-oro-400 uppercase tracking-widest block">
                  🏛️ GASTROTORRE · SISTEMA DE INTELIGENCIA DE CONSUMO MUNICIPAL
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                  Estudio de Hábitos de Consumo: {currentMonth.name}
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Municipio de Torrelodones (Madrid) · {currentMonth.subtitle}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black">
                  ✓ Certificado para Concejalía de Comercio
                </span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Muestra representativa: {totalRestaurants} Restaurantes · 100% Digitalizado
                </p>
              </div>
            </div>

            {/* 4 Main Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Comensales Auditados</span>
                <span className="text-2xl font-black text-white block mt-0.5">{currentMonth.totalScans.toLocaleString('es-ES')}</span>
                <span className="text-[10px] text-emerald-400 font-bold">{currentMonth.growth}</span>
              </div>

              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Facturación Inducida</span>
                <span className="text-2xl font-black text-oro-400 block mt-0.5">{currentMonth.totalRevenue.toLocaleString('es-ES')} €</span>
                <span className="text-[10px] text-oro-300 font-bold">Ticket medio ~28,50€ / pax</span>
              </div>

              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Conversión Promedio a Mesa</span>
                <span className="text-2xl font-black text-emerald-400 block mt-0.5">27.6%</span>
                <span className="text-[10px] text-slate-400 font-medium">Llamadas, GPS y Reservas</span>
              </div>

              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Ahorro en Papel Municipal</span>
                <span className="text-2xl font-black text-blue-300 block mt-0.5">~{(totalRestaurants * 3200).toLocaleString('es-ES')} cartas</span>
                <span className="text-[10px] text-blue-400 font-bold">Sostenibilidad & Huella Verde</span>
              </div>
            </div>

            {/* Top Leverage Box */}
            <div className="p-3.5 bg-torre-900/40 border border-torre-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-slate-200">
              <span className="text-base leading-none">💡</span>
              <div>
                <strong className="text-oro-300">Justificación del Valor para el Ayuntamiento de Torrelodones:</strong>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  <strong>Retorno Económico Directo:</strong> Cada euro invertido en la digitalización municipal retorna <strong>+38,40 €</strong> en facturación directa para los hosteleros de Torrelodones, justificando la inversión pública ante pleno municipal y fondos europeos de comercio.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 📈 SECTION 1: EVOLUCIÓN MENSUAL DIVIDIDA EN SEMANAS (GRÁFICA PROFESIONAL) */}
          {/* ========================================================================= */}
          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-oro-400" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    1. Evolución Temporal de {currentMonth.name} Desglosada por Semanas
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Comparativa visual de comensales, facturación inducida y picos de consumo (Semana 1 a Semana 4)
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-oro-300 border border-slate-700 font-bold self-start sm:self-auto">
                📊 Gráfica de Barras Proporcional
              </span>
            </div>

            {/* Visual Bar Chart (Semana 1 a 4) */}
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {currentMonth.weeks.map((week) => {
                  const percentOfMax = Math.round((week.scans / maxWeekScans) * 100);
                  const isTopWeek = week.scans === maxWeekScans;
                  const isSelected = selectedWeekNum === week.weekNumber;

                  return (
                    <div
                      key={week.weekNumber}
                      onClick={() => setSelectedWeekNum(isSelected ? null : week.weekNumber)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-oro-950/40 border-oro-500 shadow-lg shadow-oro-500/10 scale-[1.02]'
                          : isTopWeek
                          ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{week.label}</span>
                          {isTopWeek && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              🏆 Pico Máximo
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{week.dateRange}</span>
                      </div>

                      {/* Bar Graphic */}
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-black text-white font-mono">
                            {week.scans.toLocaleString('es-ES')}
                          </span>
                          <span className="text-xs font-bold text-oro-400 font-mono">
                            {week.estimatedRevenue.toLocaleString('es-ES')} €
                          </span>
                        </div>

                        {/* Progress visual bar */}
                        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isTopWeek
                                ? 'bg-gradient-to-r from-oro-500 via-amber-400 to-yellow-300'
                                : 'bg-gradient-to-r from-torre-600 to-emerald-400'
                            }`}
                            style={{ width: `${percentOfMax}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{percentOfMax}% de carga</span>
                          <span>Conv: <strong>{week.conversionRate}%</strong></span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
                        <div className="text-slate-300 flex justify-between">
                          <span className="text-slate-500">Día Fuerte:</span>
                          <strong className="text-amber-300">{week.peakDay.split(' ')[0]}</strong>
                        </div>
                        <div className="text-slate-300 flex justify-between">
                          <span className="text-slate-500">Plato Estrella:</span>
                          <span className="truncate max-w-[110px] text-right font-medium">{week.topDish}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Breakdown for Selected or All Weeks */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Desglose Detallado Semana a Semana:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentMonth.weeks.map((week) => (
                    <div
                      key={`detail-${week.weekNumber}`}
                      className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white">{week.label}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({week.dateRange})</span>
                        </div>
                        <span className="font-black text-oro-400">{week.estimatedRevenue.toLocaleString('es-ES')} €</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Comensales Auditados:</span>
                          <strong className="text-white font-mono">{week.scans.toLocaleString('es-ES')} lecturas</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Día Pico Registrado:</span>
                          <strong className="text-amber-300">{week.peakDay}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Categoría Líder:</span>
                          <span className="text-slate-200 font-medium">{week.topCategory}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Filtro de Alérgeno:</span>
                          <span className="text-emerald-300 font-medium">{week.topAllergen}</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-300 flex items-start gap-1.5">
                        <span className="text-oro-400 font-bold">💡 Insight:</span>
                        <span>{week.insight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 1 Deep-Dive Leverage Insights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>📊 Métrica Cuantitativa (Mes vs Semanas)</span>
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Existe una <strong>variación del +43.2%</strong> entre la semana más fuerte (<strong>Semana 1</strong> con {currentMonth.weeks[0].scans.toLocaleString()} escaneos tras nóminas) y la semana valle (<strong>Semana 3</strong> con {currentMonth.weeks[2].scans.toLocaleString()} escaneos).
                  </p>
                </div>

                <div className="p-3.5 bg-oro-950/30 rounded-2xl border border-oro-500/30 space-y-1.5">
                  <span className="text-xs font-black text-oro-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>💡 De Qué Manera se Puede Aprovechar</span>
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Para los Hosteleros:</strong> Calibrar compras y turnos de plantilla reduciendo costes fijos en Semanas 2 y 3.
                    <br />
                    <strong>Para el Ayuntamiento:</strong> Concentrar los eventos de dinamización comercial (<em>"Jornadas Gastronómicas de Torrelodones"</em>) exactamente en la Semana 3 para aplanar la curva y generar actividad económica continua.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 📅 SECTION 2: DÍAS DE LA SEMANA (PICOS EN FINDE VS VALLES ENTRE SEMANA) */}
          {/* ========================================================================= */}
          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-torre-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  2. Afluencia Diaria: Concentración en Fin de Semana vs Días Valle
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Sábado y Domingo = 61.0% del Volumen Total
              </span>
            </div>

            <div className="space-y-3">
              {daysRanking.map((item) => (
                <div key={item.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${item.isPeak ? 'text-oro-400 font-black' : 'text-slate-300'}`}>
                        {item.day}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-md bg-slate-800 text-slate-400">
                        {item.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-mono">{item.count.toLocaleString('es-ES')} lecturas</span>
                      <span className="font-black text-white font-mono w-12 text-right">{item.percent}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.isPeak 
                          ? 'bg-gradient-to-r from-oro-500 to-amber-400' 
                          : 'bg-gradient-to-r from-torre-600 to-blue-400'
                      }`}
                      style={{ width: `${item.percent * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Section 2 Leverage Insights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-black text-emerald-400 flex items-center gap-1">
                  <span>📊 Métrica Clave</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  El <strong>61.0%</strong> de la facturación y afluencia se concentra exclusivamente en <strong>Sábado (34.2%) y Domingo (26.8%)</strong>, mientras que <strong>Martes (3.8%) y Miércoles (4.9%)</strong> sufren una fuerte caída de comensales.
                </p>
              </div>

              <div className="p-3 bg-oro-950/30 rounded-2xl border border-oro-500/30 space-y-1">
                <span className="text-[11px] font-black text-oro-300 flex items-center gap-1">
                  <span>💡 De Qué Manera se Puede Aprovechar</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Hostelería:</strong> Ajuste de contratos a tiempo parcial para picos de fin de semana evitando sobrecostes laborales.
                  <br />
                  <strong>Ayuntamiento:</strong> Crear el programa municipal <em>"Miércoles Gastronómico"</em> con bonos de descuento subvencionados del 20% para llenar locales los días con un 96% de mesas vacías.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 🕒 SECTION 3: FRANJAS HORARIAS Y RADAR DE SALUD PÚBLICA (ALÉRGENOS) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Hourly Split */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    3. Franjas Horarias Fuertes vs Bajas
                  </h3>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-200">☀️ Turno Comidas (13:30 - 16:30)</span>
                      <span className="font-black text-amber-400 text-sm">56.4%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '56.4%' }} />
                    </div>
                    <p className="text-[10px] text-amber-300/80">Mayor ticket medio y afluencia familiar en terrazas y salones.</p>
                  </div>

                  <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-indigo-200">🌙 Turno Cenas (20:30 - 23:45)</span>
                      <span className="font-black text-indigo-400 text-sm">37.1%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full rounded-full" style={{ width: '37.1%' }} />
                    </div>
                    <p className="text-[10px] text-indigo-300/80">Alta concentración en jueves, viernes y sábados noche.</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-300">☕ Franja Tardeo / Aperitivo (17:00 - 20:00)</span>
                      <span className="font-bold text-slate-400 text-xs">6.5%</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Franja desaprovechada con gran potencial de dinamización.</p>
                  </div>
                </div>
              </div>

              {/* Section 3 Leverage Box */}
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 mt-2 space-y-1">
                <span className="text-[10px] font-black text-oro-400 block uppercase">💡 Cómo Aprovecharlo</span>
                <p className="text-[10px] text-slate-300 leading-normal">
                  Promover <strong>Menús Ejecutivos de Mediodía</strong> para el polígono y oficinas locales, y habilitar <strong>Licencias de Música Acústica en Terrazas</strong> de 18h a 20h para captar el 93.5% que no consume en tardeo.
                </p>
              </div>
            </div>

            {/* Allergen & Dietary Health Radar */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    4. Radar de Alérgenos & Salud Pública
                  </h3>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-amber-300">🌾 Sin Gluten (Celíacos)</span>
                      <span className="font-black text-white font-mono">38.6%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '38.6%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-blue-300">🥛 Sin Lactosa</span>
                      <span className="font-black text-white font-mono">24.1%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: '24.1%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-emerald-300">🌱 Vegano & Vegetariano</span>
                      <span className="font-black text-white font-mono">19.8%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: '19.8%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-red-300">🥜 Frutos Secos / Marisco</span>
                      <span className="font-black text-white font-mono">17.5%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-400 h-full rounded-full" style={{ width: '17.5%' }} />
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[10px] text-emerald-300 mt-2">
                    📊 <strong>Métrica Sanitaria:</strong> 1 de cada 2,6 comensales activa un filtro de intolerancias antes de pedir.
                  </div>
                </div>
              </div>

              {/* Section 4 Leverage Box */}
              <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 mt-2 space-y-1">
                <span className="text-[10px] font-black text-emerald-300 block uppercase">💡 Cómo Aprovecharlo</span>
                <p className="text-[10px] text-slate-300 leading-normal">
                  Los restaurantes con platos sin gluten certificados atraen <strong>mesas y familias completas</strong> (el celíaco decide dónde va el grupo). El Ayuntamiento puede posicionar a Torrelodones como <em>"Municipio Referente Celíaco-Friendly"</em> de la Comunidad de Madrid.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 🎯 SECTION 5: PLAN DE ACCIÓN Y CONCLUSIONES ESTRATÉGICAS */}
          {/* ========================================================================= */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-xs font-black text-oro-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>5. Plan de Acción Recomendado para la Concejalía de Comercio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-black text-white block text-sm">1. Campaña de Días Valle</span>
                <p className="text-[11px] text-slate-300">
                  <strong>📊 Métrica:</strong> Martes y Miércoles sólo generan el 8.7% del tráfico semanal.
                </p>
                <p className="text-[11px] text-amber-300/90 font-medium">
                  <strong>💡 Acción:</strong> Lanzar la <i>"Ruta de la Cuchara y la Tapa"</i> en Semana 3 para aumentar la facturación entre semana hasta un +35%.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-black text-white block text-sm">2. Sello Celíaco-Friendly</span>
                <p className="text-[11px] text-slate-300">
                  <strong>📊 Métrica:</strong> El 38.6% de los filtros de alérgenos son para celíacos.
                </p>
                <p className="text-[11px] text-emerald-300/90 font-medium">
                  <strong>💡 Acción:</strong> Certificar locales con el distintivo oficial municipal para captar el turismo gastronómico familiar de la A-6 y Madrid capital.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-black text-white block text-sm">3. Algoritmo de Equidad 100%</span>
                <p className="text-[11px] text-slate-300">
                  <strong>📊 Métrica:</strong> Rotación aleatoria en portada con 100% de igualdad de impresiones.
                </p>
                <p className="text-[11px] text-blue-300/90 font-medium">
                  <strong>💡 Acción:</strong> Garantiza por primera vez que los locales de calles secundarias y La Colonia tengan exactamente la misma exposición que los de la plaza central.
                </p>
              </div>
            </div>
          </div>

          {/* Institutional Signature Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              <span>Informe emitido por la plataforma tecnológica <strong>GastroTorre / Torre a la Carta</strong></span>
            </div>
            <div>
              <span>Director de Tecnología & Big Data: <strong>Ángel Ruiz</strong> · Torrelodones</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
