'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Calculator, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Award, 
  Lock, 
  Server, 
  Globe, 
  Sparkles, 
  ChevronRight, 
  Printer, 
  ArrowLeft, 
  Store, 
  Target, 
  Users, 
  Briefcase, 
  Zap, 
  AlertTriangle,
  HelpCircle,
  Clock,
  QrCode,
  Flame,
  Check,
  X,
  Layers,
  BarChart4,
  Bot,
  Send,
  MessageSquare,
  Cpu,
  CheckCheck,
  Smartphone
} from 'lucide-react';

export default function VentasPlanNegocioPage() {
  // Interactive Financial Simulator State
  const [clientCount, setClientCount] = useState<number>(20);
  const [avgPlanPrice, setAvgPlanPrice] = useState<number>(59); // Plan Pro por defecto (59€)
  const [autonomosTier, setAutonomosTier] = useState<'tarifa_plana' | 'segundo_ano' | 'tarifa_cero_cam'>('tarifa_plana');
  const [includeVercelPro, setIncludeVercelPro] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'resumen' | 'legal' | 'tech' | 'ventas' | 'precios' | 'calculadora'>('resumen');

  // Calculation of monthly costs
  const autonomosCost = useMemo(() => {
    if (autonomosTier === 'tarifa_cero_cam') return 0; // Comunidad de Madrid subvenciona primer año
    if (autonomosTier === 'tarifa_plana') return 80; // Tarifa plana nacional
    return 294; // Tramo medio estándar a partir de año 2
  }, [autonomosTier]);

  const gestoriaCost = 60; // Asesor fiscal mensual promedio
  const hostingCost = includeVercelPro ? 19 : 0; // Vercel Pro ($20/mes aprox)
  const domainAndDnsCost = 3; // Amortización dominio .es + Cloudflare
  const databaseCost = clientCount > 25 ? 23 : 0; // Supabase Pro si hay alto volumen

  const totalMonthlyFixedCost = autonomosCost + gestoriaCost + hostingCost + domainAndDnsCost + databaseCost;

  // Revenue calculation (100% Software SaaS - Cero costes de manipulación ni materiales físicos)
  const grossMonthlyRevenue = clientCount * avgPlanPrice;
  const grossAnnualRevenue = grossMonthlyRevenue * 12;

  const totalMonthlyExpenses = totalMonthlyFixedCost;
  const netMonthlyProfit = grossMonthlyRevenue - totalMonthlyExpenses;
  const netAnnualProfit = netMonthlyProfit * 12;
  const profitMargin = grossMonthlyRevenue > 0 ? ((netMonthlyProfit / grossMonthlyRevenue) * 100).toFixed(1) : '0';

  // Break-even clients required (pure software)
  const breakEvenClients = Math.ceil(totalMonthlyFixedCost / avgPlanPrice);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 py-3 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-torre-600 dark:hover:text-torre-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Directorio</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Store className="w-3.5 h-3.5 text-oro-500" />
              <span>Panel Hostelero</span>
            </Link>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Dossier PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero Header Card */}
        <div className="bg-slate-900 dark:bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oro-400/20 text-oro-300 border border-oro-400/30 text-xs font-black">
              <Briefcase className="w-3.5 h-3.5 text-oro-400" />
              <span>Dossier de Viabilidad & Plan de Negocio</span>
            </div>
            <span className="text-[11px] text-slate-300 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Torrelodones (Madrid) • Modelo Micro-SaaS B2B
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Estudio Integral de Producto, Legalidad y Estrategia de Ventas
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
              Análisis completo para ejecutar y comercializar <strong className="text-white font-bold">GastroTorre</strong>: cuota de autónomos, ayudas a fondo perdido (CAM), costes de infraestructura, márgenes financieros y el sistema de automatización de cambios por Telegram con IA.
            </p>
          </div>

          {/* Quick Metrics Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-300 block font-bold">Mercado Objetivo</span>
              <span className="text-base font-black text-white">60-80 locales</span>
              <span className="text-[9px] text-slate-400 block">Pueblo + Colonia + CC</span>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-300 block font-bold">Ticket Medio Mensual</span>
              <span className="text-base font-black text-oro-400">59 € / mes</span>
              <span className="text-[9px] text-slate-400 block">Plan Pro Recomendado</span>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-300 block font-bold">Punto de Equilibrio</span>
              <span className="text-base font-black text-emerald-400">{breakEvenClients} clientes</span>
              <span className="text-[9px] text-slate-400 block">Cubre costes fijos</span>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-300 block font-bold">Margen Bruto</span>
              <span className="text-base font-black text-emerald-300">92% - 96%</span>
              <span className="text-[9px] text-slate-400 block">Alta rentabilidad SaaS</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs (Hidden in Print) */}
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-1 overflow-x-auto no-scrollbar text-xs font-bold print:hidden">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'resumen'
                ? 'bg-torre-700 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-oro-500" />
            <span>1. Resumen Ejecutivo</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'legal'
                ? 'bg-torre-700 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-oro-500" />
            <span>2. Legal & Autónomos</span>
          </button>

          <button
            onClick={() => setActiveTab('tech')}
            className={`py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'tech'
                ? 'bg-torre-700 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-oro-500" />
            <span>3. Infraestructura Tech</span>
          </button>

          <button
            onClick={() => setActiveTab('ventas')}
            className={`py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'ventas'
                ? 'bg-torre-700 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-oro-500" />
            <span>4. Telegram Bot + IA</span>
          </button>

          <button
            onClick={() => setActiveTab('precios')}
            className={`py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'precios'
                ? 'bg-torre-700 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-oro-500" />
            <span>5. Planes & Pricing</span>
          </button>

          <button
            onClick={() => setActiveTab('calculadora')}
            className={`py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'calculadora'
                ? 'bg-torre-700 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-oro-500" />
            <span>6. Simulador Financiero</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: RESUMEN EJECUTIVO */}
        {/* ========================================================================= */}
        {(activeTab === 'resumen' || typeof window === 'undefined') && (
          <div className="space-y-6 animate-fadeIn">
            {/* Value Proposition Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-torre-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    1. ¿Qué es GastroTorre y por qué es un negocio viable?
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Propuesta de valor inmutable vs soluciones tradicionales de hostelería
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                GastroTorre resuelve los tres mayores problemas que sufren los hosteleros de Torrelodones con las cartas tradicionales:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1.5">
                  <span className="text-rose-900 dark:text-rose-300 font-black text-xs flex items-center gap-1.5">
                    <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    El Problema Actual
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    Reimprimir cartas de papel cuesta <strong>300€-600€/año</strong>. Los PDFs en QR son ilegibles en móvil (pesan 20MB, hay que hacer zoom) y no reflejan si un plato se ha agotado o si hay menú del día hoy.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
                  <span className="text-emerald-900 dark:text-emerald-300 font-black text-xs flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Nuestra Solución
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    Carta interactiva instantánea (<strong className="text-emerald-700 dark:text-emerald-400">LCP &lt; 0.8s</strong>), con fotos reales en alta definición, filtros oficiales de 14 alérgenos y panel donde cambian precios o el menú del día en <strong>15 segundos</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                  <span className="text-torre-900 dark:text-torre-300 font-black text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-torre-600 dark:text-torre-400" />
                    El Impacto Económico
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    El hostelero ahorra dinero desde el primer mes, cumple la normativa sanitaria sin multas y el comensal gasta entre un <strong>12% y un 18% más</strong> al ver fotos atractivas de carnes, vinos y postres artesanos.
                  </p>
                </div>
              </div>
            </div>

            {/* Business Model Summary Table */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart4 className="w-4 h-4 text-oro-500" />
                <span>Resumen de Economía Unitaria (Unit Economics)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold bg-slate-50 dark:bg-slate-800">
                      <th className="py-2.5 px-3">Concepto</th>
                      <th className="py-2.5 px-3">Estimación</th>
                      <th className="py-2.5 px-3">Detalle Operativo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    <tr>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Coste de Adquisición (CAC)</td>
                      <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">~10 € - 15 €</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Venta directa presencial en Torrelodones mostrando la demo en el móvil</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Ingreso Medio por Cliente (ARPU)</td>
                      <td className="py-3 px-3 font-black text-torre-600 dark:text-torre-400">59 € / mes (708 €/año)</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Plan Pro con Menú del Día Express y bot automatizado de Telegram</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Coste Fijo Servidor por Cliente</td>
                      <td className="py-3 px-3 font-black text-slate-900 dark:text-white">&lt; 0,50 € / mes</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Arquitectura Edge en Vercel con caching ultraeficiente</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Tasa de Cancelación (Churn)</td>
                      <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">&lt; 3% anual</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Alto valor retenido: el QR es permanente y ahorra costes de imprenta</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">Tiempo de Retorno (Payback)</td>
                      <td className="py-3 px-3 font-black text-emerald-600 dark:text-emerald-400">Inmediato (&lt; 1 mes)</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">Cero costes de materiales físicos; beneficio neto desde el día 1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LEGAL, FISCAL Y MARCAS EN ESPAÑA */}
        {/* ========================================================================= */}
        {(activeTab === 'legal' || typeof window === 'undefined') && (
          <div className="space-y-6 animate-fadeIn">
            {/* Legal Steps Cards */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    2. Marco Legal, Fiscal y Protección de Marca en España
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Trámites obligatorios y optimización de costes iniciales
                  </p>
                </div>
              </div>

              {/* 1. Cuota Autónomos */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-torre-600 text-white text-[11px] font-black flex items-center justify-center">A</span>
                    Alta en Autónomos (RETA) y Tarifa Plana
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                    80 € / mes (Año 1) • 0 € con Tarifa Cero CAM
                  </span>
                </div>

                <ul className="text-xs text-slate-800 dark:text-slate-200 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Tarifa Plana Estatal (Primeros 12 meses):</strong> Cuota fija reducida de <strong>80 €/mes</strong> durante el primer año de actividad. Prorrogable a 24 meses si los rendimientos netos no superan el SMI.
                  </li>
                  <li>
                    <strong>Bonificación "Tarifa Cero" de la Comunidad de Madrid:</strong> La CAM (Consejería de Economía) subvenciona el 100% de la cuota durante los primeros 12 meses a los nuevos autónomos empadronados y dados de alta en la región. <em>Coste neto real del autónomo: 0€ el primer año tras solicitar la subvención.</em>
                  </li>
                  <li>
                    <strong>IAE (Impuesto sobre Actividades Económicas):</strong> Epígrafe <strong>844</strong> (Servicios de publicidad, relaciones públicas y similares) o <strong>769.9</strong> (Servicios de telecomunicación y software). Exento de pago de IAE para facturación inferior a 1.000.000€.
                  </li>
                </ul>
              </div>

              {/* 2. Registro de Marca OEPM */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-oro-500 text-slate-950 text-[11px] font-black flex items-center justify-center">B</span>
                    Registro de Marca y Nombre Comercial (OEPM)
                  </h3>
                  <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-md">
                    ~127,88 € (Válido por 10 años)
                  </span>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  Para blindar el nombre <strong className="font-bold">GastroTorre</strong> y evitar que otra empresa o agencia copie el concepto en la Comunidad de Madrid o España, se registra la marca en la <strong>Oficina Española de Patentes y Marcas (OEPM)</strong>:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block">Clase 35 (Niza)</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">Servicios de publicidad, marketing para hostelería y directorio comercial online.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block">Clase 42 (Niza)</span>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">Software como servicio (SaaS), diseño y alojamiento de cartas digitales y códigos QR.</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span>Tasa oficial telemática 1ª clase (descuento 15% sede electrónica):</span>
                  <strong className="text-slate-900 dark:text-white">127,88 €</strong>
                </div>
              </div>

              {/* 3. Normativa Alérgenos y RGPD */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">C</span>
                    Cumplimiento RGPD, LOPD-GDD y Reglamento Alérgenos UE
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                    100% Cumplido
                  </span>
                </div>

                <ul className="text-xs text-slate-800 dark:text-slate-200 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Reglamento UE 1169/2011 (Alérgenos):</strong> Obligatorio por ley para todo local de restauración. La carta de GastroTorre ya incorpora el desglose de los <strong>14 alérgenos de declaración obligatoria</strong> con iconos oficiales y selector rápido para clientes celíacos, intolerantes a la lactosa o veganos.
                  </li>
                  <li>
                    <strong>Privacidad RGPD:</strong> No utilizamos cookies de rastreo intrusivas ni vendemos datos a terceros. Almacenamiento local en cliente (localStorage) de alto rendimiento.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: INFRAESTRUCTURA TÉCNICA Y SEGURIDAD */}
        {/* ========================================================================= */}
        {(activeTab === 'tech' || typeof window === 'undefined') && (
          <div className="space-y-6 animate-fadeIn">
            {/* Tech Architecture & Cloudflare/Vercel */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-torre-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    3. Infraestructura Cloud, Dominio y Seguridad Anti-DDoS
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Costes fijos mínimos, velocidad ultrarrápida y alta disponibilidad
                  </p>
                </div>
              </div>

              {/* Infrastructure Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dominio */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-torre-600 dark:text-torre-400" />
                      Dominio Web Oficial (.es / .com)
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">12 € - 16 € / año</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Registro en DonDominio, Namecheap o Porkbun con renovación anual y protección whois incluida.
                  </p>
                </div>

                {/* Vercel Pro */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Alojamiento Edge (Vercel Plus / Pro)
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">~18,50 € / mes (20 $)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    1TB de ancho de banda mensual, despliegue global en servidores de Madrid/Frankfurt y SLA de 99.99% para picos de fin de semana.
                  </p>
                </div>

                {/* Firewall & WAF */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Firewall, WAF & Cloudflare Anti-DDoS
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">0 € / mes (Free Tier)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Mitigación de ataques DDoS de capa 3/4/7, Rate Limiting contra scrapers maliciosos y certificados SSL/TLS 1.3 automáticos.
                  </p>
                </div>

                {/* Base de Datos */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-oro-500" />
                      Base de Datos (Supabase / Postgres)
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">0 € a 23 € / mes</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Capa gratuita hasta 50.000 usuarios activos mensuales. Se escala a Pro ($25/mes) únicamente cuando haya más de 30 restaurantes activos.
                  </p>
                </div>
              </div>

              {/* Digital Assets Delivery */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Kit de Archivos QR Vectoriales para el Restaurante (PNG / SVG / PDF)
                  </h3>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
                    Descarga en 1 Clic
                  </span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  Entregamos al hostelero el pack gráfico digital de su código QR en alta resolución vectorial con el logotipo de su restaurante para que lo coloque donde prefiera (sus cartas existentes, servilleteros, displays, pegatinas o soportes propios):
                </p>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span>Coste de entrega y soporte digital:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">0,00 € (100% Software SaaS)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TELEGRAM BOT + AUTOMATIZACIÓN CON IA (CERO LLAMADAS) */}
        {/* ========================================================================= */}
        {(activeTab === 'ventas' || typeof window === 'undefined') && (
          <div className="space-y-6 animate-fadeIn">
            {/* Telegram + AI Workflow Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-torre-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    4. Sistema de Tickets por Telegram + IA (Cero Llamadas Telefónicas)
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Cómo blindar tu tiempo: la IA redacta los cambios y tú solo pulsas "Aprobar"
                  </p>
                </div>
              </div>

              {/* The Telegram AI Workflow Diagram */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-oro-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-oro-400" />
                    Flujo de Automatización en 3 Segundos
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Tu tiempo por cambio: 1 segundo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-oro-300">
                      <MessageSquare className="w-4 h-4" />
                      <span>1. El Hostelero escribe o envía audio</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      El dueño manda un mensaje a un bot privado de Telegram: <em>«Pon el cachopo a 16,50€ y hoy de menú tenemos salmorejo y lubina»</em>.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-torre-300">
                      <Bot className="w-4 h-4" />
                      <span>2. La IA parsea y formatea el cambio</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      La IA interpreta el plato, el precio y el menú del día, y te envía a tu Telegram personal una notificación con los cambios listos.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-2xl bg-white/10 border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <CheckCheck className="w-4 h-4" />
                      <span>3. Tú solo tocas [✅ APROBAR]</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Pulsas el botón inline en Telegram y la API actualiza la carta digital en 0.2 segundos. Cero llamadas y cero teclear platos.
                    </p>
                  </div>
                </div>
              </div>

              {/* The 60-Second Pitch */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-torre-700 dark:text-torre-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-oro-500" />
                  <span>El Pitch de Venta Presencial (Guion de 60 Segundos)</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic border-l-4 border-torre-600 pl-3">
                  «Hola [Nombre del Dueño/Encargado], mira tu móvil un momento. Hemos creado la carta digital ultra-rápida de Torrelodones con tus mejores platos ya cargados con fotos en alta definición. Cada vez que cambias un precio o tienes menú del día, lo actualizas en 15 segundos desde tu panel o enviando un audio por Telegram sin volver a gastarte 400€ en imprentas. Te damos tu código QR inmutable en alta resolución para tus mesas y 15 días gratis para que tus camareros y clientes lo prueben sin compromiso.»
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                    Tasa de Cierre Estimada: 35% - 45%
                  </span>
                </div>
              </div>

              {/* 3-Step Cold Approach Strategy */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Protocolo de Captación Puerta a Puerta (3 Pasos):
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="w-6 h-6 rounded-xl bg-torre-600 text-white font-black text-xs flex items-center justify-center">1</span>
                    <h4 className="font-black text-slate-900 dark:text-white">Demo Pre-cargada</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      Llegas al local habiendo introducido previamente 4 de sus platos con foto apetitosa en GastroTorre. Le muestras su propio restaurante funcionando en vivo.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="w-6 h-6 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center">2</span>
                    <h4 className="font-black text-slate-900 dark:text-white">Demostración en 1 Clic</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      Le pides que te diga un precio a cambiar o un plato que no tenga hoy; lo cambias en el panel delante de él y ve cómo se actualiza al instante en la pantalla.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="w-6 h-6 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">3</span>
                    <h4 className="font-black text-slate-900 dark:text-white">Cierre "Riesgo Cero"</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      Le ofreces pago anual con 2 meses de descuento o pago mensual sin permanencia. Recibe su kit de QR digital listo para usar en 5 minutos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ESTRUCTURA DE PRECIOS Y PLANES (PRICING) */}
        {/* ========================================================================= */}
        {(activeTab === 'precios' || typeof window === 'undefined') && (
          <div className="space-y-6 animate-fadeIn">
            {/* Pricing Matrix */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      5. Estructura Comercial de Planes & Tarifas
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Precios adaptados al alto ticket medio de Torrelodones
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Plan Básico */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Plan Esencial</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Carta Digital QR</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">35 €</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ mes + IVA</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">o 350 €/año (2 meses de ahorro)</span>

                    <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200">Carta digital con platos ilimitados</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200">Código QR inmutable de alta resolución</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200">Cumplimiento 14 alérgenos UE</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200">Horarios en tiempo real (Abierto/Cerrado)</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <X className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Sin módulo Menú del Día Express</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Plan Pro (Destacado) */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-torre-600 dark:border-torre-500 shadow-md space-y-4 flex flex-col justify-between relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-torre-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-sm">
                    Recomendado / Más Vendido
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-torre-700 dark:text-torre-400 tracking-wider">Plan Pro Hostelero</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">GastroTorre Pro</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-torre-600 dark:text-torre-400">59 €</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ mes + IVA</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">o 590 €/año (2 meses de ahorro)</span>

                    <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-900 dark:text-white font-bold">Todo lo del Plan Básico</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-900 dark:text-white font-bold">Módulo Menú del Día Express</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200">Gestión de Aforo y visualización de mesas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200">Estadísticas mensuales de visualizaciones</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-900 dark:text-white font-bold">Canal de Telegram con IA para cambios en 1 clic</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Plan Premium 360 (VIP) */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500 dark:border-amber-400 shadow-md space-y-4 flex flex-col justify-between relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-sm">
                    Servicio VIP Completo
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">Plan Destacado & VIP</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Premium 360º VIP</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400">89 €</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ mes + IVA</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">o 890 €/año (2 meses de ahorro)</span>

                    <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-900 dark:text-white font-bold">Todo lo del Plan Pro</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-900 dark:text-white font-bold">Kit digital de QR en alta definición (SVG/PDF)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200">Posicionamiento como "Restaurante de la Semana"</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200">Sesión de optimización de fotos gastronómicas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-900 dark:text-white font-bold">Soporte VIP prioritario con IA y revisión directa</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SIMULADOR FINANCIERO Y CALCULADORA DE RENTABILIDAD */}
        {/* ========================================================================= */}
        {(activeTab === 'calculadora' || typeof window === 'undefined') && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-torre-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    6. Simulador Interactivo de Rentabilidad y Ganancias
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Ajusta los parámetros para ver los ingresos netos según los restaurantes captados
                  </p>
                </div>
              </div>

              {/* Interactive Sliders and Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {/* Client Count Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <label className="text-slate-900 dark:text-white">Restaurantes Activos:</label>
                    <span className="text-torre-600 dark:text-torre-400 font-black text-base px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm">
                      {clientCount} locales
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="60"
                    step="1"
                    value={clientCount}
                    onChange={(e) => setClientCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-torre-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>3 (Piloto)</span>
                    <span>25 (Local)</span>
                    <span>60 (Comarcal)</span>
                  </div>
                </div>

                {/* Average Price Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Precio Medio del Plan:
                  </label>
                  <select
                    value={avgPlanPrice}
                    onChange={(e) => setAvgPlanPrice(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none shadow-sm"
                  >
                    <option value={35}>35 €/mes (Plan Básico)</option>
                    <option value={59}>59 €/mes (Plan Pro Recomendado)</option>
                    <option value={89}>89 €/mes (Plan Premium 360º VIP)</option>
                  </select>
                </div>

                {/* Autonomos Scenario */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-white block">
                    Escenario de Autónomos:
                  </label>
                  <select
                    value={autonomosTier}
                    onChange={(e) => setAutonomosTier(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none shadow-sm"
                  >
                    <option value="tarifa_cero_cam">Tarifa Cero Madrid (0 €/mes)</option>
                    <option value="tarifa_plana">Tarifa Plana Nacional (80 €/mes)</option>
                    <option value="segundo_ano">Cuota Ordinaria Año 2+ (294 €/mes)</option>
                  </select>
                </div>
              </div>

              {/* Financial Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* MRR */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1 border border-slate-800 shadow-sm">
                  <span className="text-[11px] text-slate-300 font-bold block">Ingresos Recurrentes (MRR)</span>
                  <span className="text-2xl font-black text-white">{grossMonthlyRevenue} €</span>
                  <span className="text-[10px] text-slate-400 block">{grossAnnualRevenue.toLocaleString()} € al año</span>
                </div>

                {/* Gastos Totales */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold block">Gastos Totales Mes</span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{totalMonthlyExpenses.toFixed(0)} €</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Autónomos + Servidor + Gestoría</span>
                </div>

                {/* Beneficio Limpio */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-1">
                  <span className="text-[11px] text-emerald-900 dark:text-emerald-300 font-bold block">Beneficio Limpio Mes</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{netMonthlyProfit.toFixed(0)} €</span>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold block">
                    {netAnnualProfit.toLocaleString()} € limpios/año
                  </span>
                </div>

                {/* Margen */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1">
                  <span className="text-[11px] text-amber-900 dark:text-amber-300 font-bold block">Margen Neto Limpio</span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-400">{profitMargin} %</span>
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block">
                    Break-even: {breakEvenClients} clientes
                  </span>
                </div>
              </div>

              {/* Action Roadmap */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Plan de Escalado y Hoja de Ruta Temporal</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-black text-torre-600 dark:text-torre-400 block text-[11px]">Mes 1: Validación</span>
                    <strong className="text-slate-900 dark:text-white">3 Clientes Piloto</strong>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">Gratis 15 días a cambio de testimonio y feedback real.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-black text-amber-600 dark:text-amber-400 block text-[11px]">Mes 2-3: Legal & Launch</span>
                    <strong className="text-slate-900 dark:text-white">10 Clientes Pagando</strong>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">Registro OEPM con los primeros cobros anuales.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 block text-[11px]">Mes 4-6: Consolidación</span>
                    <strong className="text-slate-900 dark:text-white">25-30 Clientes</strong>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">Monopolio local en Torrelodones Pueblo y Colonia.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-black text-purple-600 dark:text-purple-400 block text-[11px]">Mes 7-12: Expansión</span>
                    <strong className="text-slate-900 dark:text-white">50+ Clientes</strong>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">Expansión a Las Rozas, Majadahonda y Galapagar.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
