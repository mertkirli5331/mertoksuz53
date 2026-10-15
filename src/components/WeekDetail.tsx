import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FileText,
  Table,
  Presentation,
  FileCode,
  File,
  Link2,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Check,
  Save,
  CheckCircle2,
  Clock,
  Circle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  Lock,
  Eye,
  PenLine,
  ShieldAlert
} from 'lucide-react';
import type { WeekPlan, DriveLink, DriveLinkType, WeekStatus, ChecklistItem } from '../types';

interface WeekDetailProps {
  week: WeekPlan;
  onUpdateWeek: (updatedWeek: WeekPlan) => Promise<void>;
  onOpenDriveModal: (editingLink?: DriveLink | null) => void;
  onNavigateWeek: (weekNumber: number) => void;
  isSaving: boolean;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

export const WeekDetail: React.FC<WeekDetailProps> = ({
  week,
  onUpdateWeek,
  onOpenDriveModal,
  onNavigateWeek,
  isSaving,
  isAdmin,
  onRequireAdmin,
}) => {
  const [title, setTitle] = useState(week.title);
  const [subtitle, setSubtitle] = useState(week.subtitle || '');
  const [status, setStatus] = useState<WeekStatus>(week.status);
  const [notes, setNotes] = useState(week.notes);
  const [tasks, setTasks] = useState<ChecklistItem[]>(week.tasks || []);
  const [newTaskText, setNewTaskText] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>(isAdmin ? 'edit' : 'preview');
  const [saveStatusText, setSaveStatusText] = useState<string>('Tüm değişiklikler sunucuda kayıtlı');

  // Debounced auto-save timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when week changes or admin changes
  useEffect(() => {
    setTitle(week.title);
    setSubtitle(week.subtitle || '');
    setStatus(week.status);
    setNotes(week.notes);
    setTasks(week.tasks || []);
    setViewMode(isAdmin ? 'edit' : 'preview');
    setSaveStatusText('Tüm değişiklikler sunucuda kayıtlı');
  }, [week.weekNumber, isAdmin]);

  // Handle immediate update to parent
  const triggerSave = (updatedFields: Partial<WeekPlan>) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }

    const updated: WeekPlan = {
      ...week,
      title,
      subtitle,
      status,
      notes,
      tasks,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    setSaveStatusText('Kaydediliyor...');
    onUpdateWeek(updated)
      .then(() => {
        setSaveStatusText('Tüm cihazlarda güncellendi ✓');
        setTimeout(() => setSaveStatusText('Tüm değişiklikler sunucuda kayıtlı'), 3000);
      })
      .catch((err) => {
        setSaveStatusText(err.message || 'Kaydedilirken hata oluştu!');
      });
  };

  // Notes change handler with debounce
  const handleNotesChange = (val: string) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    setNotes(val);
    setSaveStatusText('Kaydedilmemiş değişiklik...');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      triggerSave({ notes: val });
    }, 900);
  };

  const handleStatusChange = (newStatus: WeekStatus) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    setStatus(newStatus);
    triggerSave({ status: newStatus });
  };

  const handleDeleteDriveLink = (linkId: string) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    if (window.confirm('Bu Google Drive bağlantısını silmek istediğinize emin misiniz?')) {
      const updatedLinks = (week.driveLinks || []).filter((l) => l.id !== linkId);
      triggerSave({ driveLinks: updatedLinks });
    }
  };

  const handleCopyLink = async (link: DriveLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedLinkId(link.id);
      setTimeout(() => setCopiedLinkId(null), 2500);
    } catch {
      // Ignored
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    triggerSave({ tasks: updatedTasks });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    if (!newTaskText.trim()) return;
    const newTask: ChecklistItem = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setNewTaskText('');
    triggerSave({ tasks: updatedTasks });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    triggerSave({ tasks: updatedTasks });
  };

  // Quick note template inserter
  const insertTemplate = (templateType: 'outline' | 'homework' | 'summary') => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    let templateText = '';
    if (templateType === 'outline') {
      templateText = `\n### 📌 ${week.weekNumber}. Hafta Konu Başlıkları:\n- Konu 1:\n- Konu 2:\n- Dikkat Edilmesi Gereken Noktalar:\n`;
    } else if (templateType === 'homework') {
      templateText = `\n### 📝 Bu Haftanın Ödev ve Görevleri:\n1. Google Drive klasöründeki kaynakları incele\n2. Alıştırma sorularını çöz\n3. Özeti çıkart ve dosyayı yükle\n`;
    } else if (templateType === 'summary') {
      templateText = `\n### 💡 Haftalık Özet ve Notlar:\n- Bu hafta öğrenilen en kritik nokta:\n- Tekrar edilmesi gerekenler:\n`;
    }
    const updated = (notes ? notes + '\n' : '') + templateText;
    setNotes(updated);
    triggerSave({ notes: updated });
  };

  const getDriveTypeIcon = (type: DriveLinkType) => {
    switch (type) {
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

  const getDriveTypeBadge = (type: DriveLinkType) => {
    switch (type) {
      case 'folder':
        return 'Klasör';
      case 'document':
        return 'Doküman (Docs)';
      case 'spreadsheet':
        return 'E-Tablo (Sheets)';
      case 'presentation':
        return 'Sunum (Slides)';
      case 'form':
        return 'Form';
      case 'pdf':
        return 'PDF Belgesi';
      default:
        return 'Drive Linki';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Visitor Banner if not logged in */}
      {!isAdmin && (
        <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-900 dark:text-blue-200">
            <span className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
              <Eye className="w-4 h-4" />
            </span>
            <span>
              <strong>Öğrenci & Ziyaretçi Modu:</strong> Tüm haftalık notları okuyabilir ve Google Drive linklerine tıklayarak dosyaları açabilirsiniz. Yeni link veya yazı eklemek için yönetici girişi yapınız.
            </span>
          </div>
          <button
            onClick={onRequireAdmin}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Yönetici Girişi</span>
          </button>
        </div>
      )}

      {/* Top Banner & Week Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-500/20 shrink-0">
              {week.weekNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => triggerSave({ title })}
                    className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                ) : (
                  <h2 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl">
                    {week.title}
                  </h2>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-3.5 h-3.5" />
                  {week.subtitle || `${week.weekNumber}. Hafta`}
                </span>
                <span>•</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {isAdmin ? saveStatusText : 'Canlı Senkronize'}
                </span>
              </div>
            </div>
          </div>

          {/* Status selector & Navigation buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Dropdown */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleStatusChange('not_started')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  status === 'not_started'
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Circle className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Başlanmadı</span>
              </button>
              <button
                onClick={() => handleStatusChange('in_progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  status === 'in_progress'
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Devam Ediyor</span>
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  status === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tamamlandı</span>
              </button>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onNavigateWeek(Math.max(1, week.weekNumber - 1))}
                disabled={week.weekNumber <= 1}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Önceki Hafta"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigateWeek(Math.min(38, week.weekNumber + 1))}
                disabled={week.weekNumber >= 38}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Sonraki Hafta"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Google Drive Links & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Google Drive Links Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span>Google Drive Linkleri</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium">
                      {(week.driveLinks || []).length}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Telefondan veya tabletten anında tıklayıp açabilirsiniz
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAdmin) {
                    onRequireAdmin();
                  } else {
                    onOpenDriveModal(null);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs hover:shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Link Ekle</span>
              </button>
            </div>

            {/* List of Drive Links */}
            <div className="pt-4 space-y-3">
              {(!week.driveLinks || week.driveLinks.length === 0) ? (
                <div
                  onClick={() => {
                    if (!isAdmin) onRequireAdmin();
                    else onOpenDriveModal(null);
                  }}
                  className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Henüz Google Drive linki eklenmemiş
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    {isAdmin
                      ? 'Bu haftaya ait ders klasörü, PDF dökümanı, Docs veya Sheets bağlantısı eklemek için tıklayınız.'
                      : 'Yönetici henüz bu hafta için bir Google Drive linki eklemedi.'}
                  </p>
                </div>
              ) : (
                week.driveLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/80 transition-all shadow-2xs hover:shadow-xs group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0 mt-0.5">
                          {getDriveTypeIcon(link.type)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {link.title}
                            </h4>
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {getDriveTypeBadge(link.type)}
                            </span>
                          </div>

                          {link.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                              {link.notes}
                            </p>
                          )}

                          <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1 truncate">
                            {link.url}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons: Direct Open is prominent for everyone */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Direct Open Button */}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all"
                          title="Doğrudan Google Drive'da Aç"
                        >
                          <span>Aç</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Copy link */}
                        <button
                          onClick={() => handleCopyLink(link)}
                          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                          title="Linki Kopyala"
                        >
                          {copiedLinkId === link.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Admin-only edit & delete */}
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onOpenDriveModal(link)}
                              className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteDriveLink(link.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Haftalık Görevler / Yapılacaklar (Checklist) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Haftalık Görev & Kontrol Listesi
                </h4>
              </div>
              <span className="text-xs text-slate-500">
                {tasks.filter((t) => t.completed).length}/{tasks.length} tamamlandı
              </span>
            </div>

            {isAdmin && (
              <form onSubmit={handleAddTask} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Yeni görev veya hedef ekleyin..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </form>
            )}

            <div className="mt-3 space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">
                  Bu hafta için henüz görev listesi oluşturulmadı.
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <label className={`flex items-center gap-2.5 flex-1 overflow-hidden ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled={!isAdmin}
                        onChange={() => handleToggleTask(task.id)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 disabled:opacity-75"
                      />
                      <span
                        className={`truncate ${
                          task.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {task.text}
                      </span>
                    </label>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Notes & Text Editor */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                  Haftalık Notlar & İçerik
                </h3>
              </div>

              {/* View / Edit Mode Toggle */}
              {isAdmin ? (
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                      viewMode === 'edit'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    <PenLine className="w-3 h-3" />
                    <span>Yaz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                      viewMode === 'preview'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Önizle</span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  Salt Okunur (Öğrenci)
                </span>
              )}
            </div>

            {/* Quick Template Inserters (Admin only) */}
            {isAdmin && (
              <div className="py-2.5 flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium mr-1">
                  Şablon:
                </span>
                <button
                  type="button"
                  onClick={() => insertTemplate('outline')}
                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-[11px] font-medium hover:bg-indigo-100 transition-colors"
                >
                  + Konu Başlıkları
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('homework')}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-medium hover:bg-blue-100 transition-colors"
                >
                  + Ödev & Görev
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('summary')}
                  className="px-2 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 rounded-lg text-[11px] font-medium hover:bg-purple-100 transition-colors"
                >
                  + Özet
                </button>
              </div>
            )}

            {/* Content Area */}
            <div className="pt-3 flex-1 flex flex-col">
              {isAdmin && viewMode === 'edit' ? (
                <textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Bu haftanın çalışma konularını, önemli hatırlatmalarını ve ayrıntılı açıklamalarını buraya yazabilirsiniz..."
                  className="w-full flex-1 min-h-[360px] p-3.5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-sans leading-relaxed resize-y"
                />
              ) : (
                <div className="w-full flex-1 min-h-[360px] p-4 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed overflow-y-auto">
                  {notes ? (
                    notes
                  ) : (
                    <span className="text-slate-400 italic">
                      Bu hafta için henüz yazılı not eklenmemiş.
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Save Status Footer */}
            <div className="pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isAdmin ? saveStatusText : 'Tüm Cihazlarda Güncel'}</span>
              </span>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => triggerSave({ notes })}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Manuel Kaydet</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequireAdmin}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Lock className="w-3 h-3" />
                  <span>Düzenlemek için Giriş Yap</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
