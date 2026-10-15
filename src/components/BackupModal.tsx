import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, AlertTriangle, Check, FileJson, Lock } from 'lucide-react';
import type { WeekPlan } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeks: WeekPlan[];
  onImport: (weeks: WeekPlan[]) => Promise<void>;
  onReset: () => Promise<void>;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  weeks,
  onImport,
  onReset,
  isAdmin,
  onRequireAdmin,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isResetConfirming, setIsResetConfirming] = useState(false);

  if (!isOpen) return null;

  // Export JSON file (Anyone can export)
  const handleExport = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ weeks, exportDate: new Date().toISOString() }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `38_haftalik_program_yedek_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setStatusMessage({ text: 'Yedek dosyası başarıyla indirildi!' });
    } catch (err) {
      setStatusMessage({ text: 'Yedekleme sırasında hata oluştu.', isError: true });
    }
  };

  // Import JSON file (Admin only)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const importedWeeks = parsed.weeks || (Array.isArray(parsed) ? parsed : null);

        if (!Array.isArray(importedWeeks) || importedWeeks.length === 0) {
          throw new Error('Geçersiz dosya formatı.');
        }

        await onImport(importedWeeks);
        setStatusMessage({ text: `${importedWeeks.length} haftalık veri başarıyla geri yüklendi!` });
      } catch (err: any) {
        setStatusMessage({ text: err.message || 'Dosya okunamadı veya yetki hatası.', isError: true });
      }
    };
    reader.readAsText(file);
  };

  const handleResetClick = async () => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }

    if (!isResetConfirming) {
      setIsResetConfirming(true);
      return;
    }
    try {
      await onReset();
      setIsResetConfirming(false);
      setStatusMessage({ text: 'Program başarıyla varsayılan 38 haftalık şablona sıfırlandı.' });
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Sıfırlama başarısız oldu.', isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Veri Yönetimi & Yedekleme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tüm haftaları ve Drive linklerini yedekleyin veya geri yükleyin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.isError
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {statusMessage.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Export Button (Available for all) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  Yedek Dosyası İndir
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tüm 38 haftanın notlarını ve linklerini bilgisayarınıza veya telefonunuza kaydeder.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>İndir (JSON)</span>
              </button>
            </div>
          </div>

          {/* Import Button (Admin only) */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Yedekten Geri Yükle
                  </h4>
                  {!isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-600 rounded">
                      Yönetici
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Daha önce indirdiğiniz JSON yedek dosyasını içeri aktarır.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isAdmin) {
                    onRequireAdmin();
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              >
                {!isAdmin ? <Lock className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{isAdmin ? 'Dosya Seç' : 'Giriş Yap'}</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Reset to Default (Admin only) */}
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-semibold text-rose-900 dark:text-rose-300">
                    Müfredatı Sıfırla
                  </h4>
                  {!isAdmin && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 rounded">
                      Yönetici
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                  {isResetConfirming
                    ? 'Emin misiniz? Tüm özel eklediğiniz link ve yazılar silinecektir.'
                    : 'Varsayılan 38 haftalık temiz şablona geri döner.'}
                </p>
              </div>
              <button
                onClick={handleResetClick}
                className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 ${
                  isResetConfirming
                    ? 'bg-rose-600 text-white hover:bg-rose-700 font-bold'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 hover:bg-rose-200'
                }`}
              >
                {!isAdmin ? <Lock className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{isAdmin ? (isResetConfirming ? 'Evet, Sıfırla!' : 'Sıfırla') : 'Giriş Yap'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
