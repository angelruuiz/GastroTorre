import Link from 'next/link';
import { UtensilsCrossed, ArrowLeft, Search, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm border border-blue-100 dark:border-blue-900">
        <UtensilsCrossed className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-sm">
        <span className="text-xs font-black text-blue-600 uppercase tracking-wider">Error 404</span>
        <h1 className="text-2xl font-black tracking-tight">Página no encontrada</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          El restaurante o plato que buscas no existe o ha cambiado de dirección en la guía de Torrelodones.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Compass className="w-4 h-4" />
          <span>Ver Restaurantes</span>
        </Link>
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
}
