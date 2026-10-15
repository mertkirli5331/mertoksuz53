import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Folder, FileText, Table, Presentation, FileCode, File, Check, Link2, Sparkles } from 'lucide-react';
import type { DriveLink, DriveLinkType } from '../types';
import { detectDriveLinkType } from '../api';

interface DriveLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: DriveLink) => void;
  editingLink?: DriveLink | null;
  weekNumber: number;
}

export const DriveLinkModal: React.FC<DriveLinkModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingLink,
  weekNumber,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<DriveLinkType>('folder');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title);
      setUrl(editingLink.url);
      setType(editingLink.type);
      setNotes(editingLink.notes || '');
    } else {
      setTitle('');
      setUrl('');
      setType('folder');
      setNotes('');
    }
    setError('');
  }, [editingLink, isOpen]);

  // Auto detect type when URL changes
  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError('');
    const detected = detectDriveLinkType(value);
    setType(detected);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleUrlChange(text.trim());
      }
    } catch {
      // Ignored
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lütfen link için bir başlık giriniz.');
      return;
    }
    if (!url.trim()) {
      setError('Lütfen bir Google Drive bağlantısı (URL) giriniz.');
      return;
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newLink: DriveLink = {
      id: editingLink ? editingLink.id : `drive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      url: formattedUrl,
      type,
      notes: notes.trim(),
      addedAt: editingLink ? editingLink.addedAt : new Date().toISOString(),
    };

    onSave(newLink);
    onClose();
  };

  if (!isOpen) return null;

  const getTypeIcon = (t: DriveLinkType) => {
    switch (t) {
      case 'folder':
        return <Folder className="w-5 h-5 text-amber-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'spreadsheet':
        return <Table className="w-5 h-5 text-emerald-500" />;
      case 'presentation':
        return <Presentation className="w-5 h-5 text-orange-500" />;
      case 'form':
        return <FileCode className="w-5 h-5 text-purple-500" />;
      case 'pdf':
        return <File className="w-5 h-5 text-rose-500" />;
      default:
        return <Link2 className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getTypeLabel = (t: DriveLinkType) => {
    switch (t) {
      case 'folder':
        return 'Google Drive Klasörü';
      case 'document':
        return 'Google Docs (Doküman)';
      case 'spreadsheet':
        return 'Google Sheets (E-Tablo)';
      case 'presentation':
        return 'Google Slides (Sunum)';
      case 'form':
        return 'Google Formlar';
      case 'pdf':
        return 'PDF / Dosya';
      default:
        return 'Web Bağlantısı';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                {editingLink ? 'Google Drive Linkini Düzenle' : `${weekNumber}. Hafta için Google Drive Linki Ekle`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Telefon, tablet ve bilgisayarlardan doğrudan tıklanabilir bağlantı
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Link Başlığı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Örn: 1. Hafta Ders Notları PDF, Proje Klasörü, Çalışma Takvimi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* URL with Paste Helper */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Google Drive Bağlantısı (URL) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Panodan Yapıştır
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="https://drive.google.com/drive/folders/... veya docs.google.com/..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-xs"
              />
            </div>
          </div>

          {/* Link Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Dosya / Bağlantı Türü
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  'folder',
                  'document',
                  'spreadsheet',
                  'presentation',
                  'pdf',
                  'other',
                ] as DriveLinkType[]
              ).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs text-left transition-all ${
                    type === t
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500 font-medium'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {getTypeIcon(t)}
                  <span className="truncate">{getTypeLabel(t).split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              İsteğe Bağlı Açıklama / Not
            </label>
            <input
              type="text"
              placeholder="Örn: İndirip ilk 20 sayfayı okuyunuz..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Preview Box */}
          {url && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {getTypeIcon(type)}
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {title || 'Başlıksız Link'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                    {url}
                  </p>
                </div>
              </div>
              <a
                href={url.startsWith('http') ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <span>Test Et</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
            >
              <Check className="w-4 h-4" />
              <span>{editingLink ? 'Değişiklikleri Kaydet' : 'Drive Linkini Ekle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
