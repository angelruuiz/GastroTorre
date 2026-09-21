'use client';

import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Check, Sparkles, Trash2, Zap } from 'lucide-react';
import { FOOD_PHOTO_PRESETS } from '@/data/photoPresets';
import { compressImageFile, CompressionResult } from '@/utils/imageCompressor';

interface DishPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishName: string;
  currentImage?: string;
  onSavePhoto: (photoUrl?: string) => void;
}

export const DishPhotoModal: React.FC<DishPhotoModalProps> = ({
  isOpen,
  onClose,
  dishName,
  currentImage,
  onSavePhoto,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>(currentImage || '');
  const [activeSource, setActiveSource] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const result = await compressImageFile(file, 1200, 1200, 0.82);
        setPhotoUrl(result.dataUrl);
        setCompressionInfo(result);
      } catch (err) {
        console.error('Error al comprimir foto:', err);
        // Fallback standard read
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSave = () => {
    onSavePhoto(photoUrl || undefined);
    onClose();
  };

  const handleRemove = () => {
    onSavePhoto(undefined);
    setCompressionInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp space-y-4 p-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider block">
              Foto del Plato
            </span>
            <h3 className="text-sm font-black text-slate-900 truncate max-w-[220px]">
              {dishName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Photo Preview Box */}
        <div className="text-center space-y-2">
          <div className="relative mx-auto w-full h-40 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 shadow-inner flex items-center justify-center group">
            {isCompressing ? (
              <div className="flex flex-col items-center gap-2 text-torre-600 animate-pulse">
                <Zap className="w-8 h-8 animate-bounce" />
                <span className="text-xs font-black">Optimizando y Comprimiendo...</span>
              </div>
            ) : photoUrl ? (
              <img
                src={photoUrl}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 flex flex-col items-center gap-1.5">
                <ImageIcon className="w-8 h-8 text-slate-300" />
                <span className="text-xs font-semibold">Sin foto asignada</span>
              </div>
            )}
          </div>

          {compressionInfo && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-200 font-bold flex items-center justify-between animate-fadeIn">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Optimizada: {compressionInfo.originalSizeFormatted} ➔ <strong>{compressionInfo.compressedSizeFormatted}</strong></span>
              </span>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                -{compressionInfo.savingsPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Source Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
          <button
            onClick={() => setActiveSource('upload')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeSource === 'upload'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir</span>
          </button>

          <button
            onClick={() => setActiveSource('presets')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeSource === 'presets'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Galería</span>
          </button>

          <button
            onClick={() => setActiveSource('url')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeSource === 'url'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Enlace</span>
          </button>
        </div>

        {/* Source 1: Upload from Phone / PC */}
        {activeSource === 'upload' && (
          <div className="space-y-2">
            <label className="flex flex-col items-center justify-center p-4 bg-torre-50/60 hover:bg-torre-100/60 rounded-2xl border-2 border-dashed border-torre-200 cursor-pointer transition-all active:scale-98">
              <Upload className="w-6 h-6 text-torre-600 mb-1" />
              <span className="text-xs font-bold text-torre-950">Elige una foto de tu móvil o PC</span>
              <span className="text-[10px] text-torre-700/80">Cámara, Galería de fotos (JPG, PNG)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Source 2: Presets Gallery */}
        {activeSource === 'presets' && (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-500 font-medium">Fotos profesionales de alta resolución:</p>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto no-scrollbar p-1">
              {FOOD_PHOTO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setPhotoUrl(preset.url)}
                  className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition-all ${
                    photoUrl === preset.url
                      ? 'bg-torre-100 border-torre-500 ring-2 ring-torre-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-8 h-8 rounded-lg object-cover shrink-0"
                  />
                  <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Source 3: Paste URL */}
        {activeSource === 'url' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Enlace de la imagen (URL):</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {photoUrl ? (
            <button
              onClick={handleRemove}
              className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors"
              title="Quitar foto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Foto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
