import React from 'react';
import {
  CalendarDays,
  Smartphone,
  Grid,
  FileText,
  HardDrive,
  Shield,
  ShieldCheck,
  Lock,
  LogOut,
  KeyRound
} from 'lucide-react';
import type { AdminUser } from '../types';

interface NavbarProps {
  currentView: 'detail' | 'list';
  onViewChange: (view: 'detail' | 'list') => void;
  onOpenQrModal: () => void;
  onOpenBackupModal: () => void;
  onOpenLoginModal: () => void;
  onOpenChangePasswordModal: () => void;
  onLogout: () => void;
  isAdmin: boolean;
  adminUser: AdminUser | null;
  isOnline: boolean;
  lastUpdated: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenQrModal,
  onOpenBackupModal,
  onOpenLoginModal,
  onOpenChangePasswordModal,
  onLogout,
  isAdmin,
  adminUser,
  isOnline,
  lastUpdated,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base tracking-tight">
                38 Haftalık Program
              </h1>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Yönetici
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                  <Shield className="w-3 h-3 text-slate-400" />
                  Öğrenci / Ziyaretçi
                </span>
              )}
            </div>
            {/* Live Sync Status */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300">
                {isOnline ? 'Canlı Senkronize' : 'Çevrimdışı'}
              </span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline text-slate-400 text-[10px]">
                {lastUpdated
                  ? `Son Güncelleme: ${new Date(lastUpdated).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Aktif'}
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher, Admin Buttons & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700/80">
            <button
              onClick={() => onViewChange('detail')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'detail'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hafta İncele</span>
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tüm 38 Hafta</span>
            </button>
          </div>

          {/* Admin Auth Button */}
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenChangePasswordModal}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl border border-slate-700 transition-colors"
                title="Şifre Değiştir"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Şifre</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs rounded-xl border border-rose-500/30 transition-colors"
                title="Yönetici Çıkışı Yap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl border border-indigo-500/40 shadow-xs transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Yönetici Girişi</span>
            </button>
          )}

          {/* Open on Phone / QR Button */}
          <button
            onClick={onOpenQrModal}
            className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 transition-all"
            title="Telefon veya Tablette Aç (QR Kod)"
          >
            <Smartphone className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden md:inline ml-1.5">Telefonda Aç</span>
          </button>

          {/* Backup Button (only accessible to admin or preview) */}
          <button
            onClick={onOpenBackupModal}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors"
            title="Yedekleme & Veri"
          >
            <HardDrive className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
