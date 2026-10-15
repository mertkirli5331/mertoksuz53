import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, Smartphone, Tablet, ExternalLink, X, Wifi } from 'lucide-react';

interface QrSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrSyncModal: React.FC<QrSyncModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && canvasRef.current && currentUrl) {
      QRCode.toCanvas(
        canvasRef.current,
        currentUrl,
        {
          width: 230,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR Kod oluşturma hatası:', error);
        }
      );
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Telefonda veya Tablette Aç
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Canlı senkronize çalışma bağlantısı
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 mb-4">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Wifi className="w-3.5 h-3.5" />
            <span>Tüm Cihazlar Eşzamanlı Senkronize</span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
            Telefonunuzun veya tabletinizin kamerasını bu QR koda tutarak hemen açabilirsiniz.
            Eklediğiniz tüm <strong>Google Drive linkleri</strong> ve <strong>haftalık yazılar</strong> otomatik senkronize olur.
          </p>

          {/* URL Copy Bar */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2 flex items-center gap-2 border border-slate-200 dark:border-slate-700 mb-4">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 flex-1 px-2 outline-none truncate font-mono"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Linki Kopyala</span>
                </>
              )}
            </button>
          </div>

          {/* Device Badges */}
          <div className="grid grid-cols-2 gap-3 w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Telefonlarda tam ekran ve dokunmatik uyumlu</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <Tablet className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Tabletlerde yatay & dikey hızlı erişim</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            Tamam, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
