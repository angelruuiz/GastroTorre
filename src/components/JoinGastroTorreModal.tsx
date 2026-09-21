'use client';

import React, { useState } from 'react';
import { X, Store, Check, Sparkles, MessageCircle, Send, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DatabaseService } from '@/lib/database/dbService';

interface JoinGastroTorreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinGastroTorreModal: React.FC<JoinGastroTorreModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [zone, setZone] = useState('Torrelodones Pueblo');
  const [cuisine, setCuisine] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DatabaseService.createLead({
        restaurantName: name,
        contactName: owner,
        phone,
        email: email || `${phone.replace(/\s+/g, '')}@lead.gastrotorre.es`,
        plan: 'Plan Pro (59€/mes)',
        zone,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.warn('Error saving lead to database:', err);
    } finally {
      setSubmitted(true);
    }
  };

  const handleWhatsAppDirect = () => {
    const text = `¡Hola GastroTorre! Quiero dar de alta mi restaurante en la plataforma:\n\n• *Restaurante:* ${name || 'Mi Restaurante'}\n• *Contacto:* ${owner || 'Encargado'}\n• *Teléfono:* ${phone || 'Móvil'}\n• *Zona:* ${zone}\n• *Cocina:* ${cuisine || 'Especialidades'}\n\n¿Cuáles son los siguientes pasos?`;
    window.open(`https://wa.me/34612345678?text=${encodeURIComponent(text)}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-scaleUp max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-torre-950 via-slate-900 to-slate-800 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-torre-600 text-white">
              <Store className="w-4 h-4" />
            </span>
            <span className="text-[10px] uppercase font-bold text-oro-400 tracking-wider">
              Hostelería de Torrelodones
            </span>
          </div>

          <h3 className="text-lg font-black text-white leading-tight">
            Digitaliza tu Restaurante en <span className="text-oro-400">24 Horas</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Únete a la guía oficial de Torrelodones, consigue tu código QR para mesas y atrae a más clientes.
          </p>
        </div>

        {/* Form or Confirmation */}
        <div className="p-5 space-y-4">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900">¡Solicitud Recibida en la Base de Datos!</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Nos pondremos en contacto contigo en menos de 24h para digitalizar tu carta y entregarte tus códigos QR listos.
              </p>
              <button
                onClick={handleWhatsAppDirect}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hablar ahora por WhatsApp</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Promo badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950">
                <Zap className="w-4 h-4 text-oro-500 shrink-0" />
                <span>🎁 Promo Lanzamiento: 2 Meses Gratis sin permanencia</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Restaurante / Bar *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Mesón El Guadarrama"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de Contacto (Dueño/Encargado) *</label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Ej: Carlos Gómez"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="612 34 56 78"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Zona</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                  >
                    <option value="Torrelodones Pueblo">Torrelodones Pueblo</option>
                    <option value="Torrelodones Colonia">Torrelodones Colonia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Comida / Especialidad</label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="Ej: Carnes a la brasa, Tapas, Pizzería..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-torre-500"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-torre-600 hover:bg-torre-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Solicitud de Alta</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppDirect}
                  className="w-full py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Solicitar directo por WhatsApp</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
