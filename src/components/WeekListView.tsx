import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Table,
  Presentation,
  FileCode,
  File,
  Link2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Circle,
  Search,
  Plus,
  ArrowRight
} from 'lucide-react';
import type { WeekPlan, DriveLinkType } from '../types';

interface WeekListViewProps {
  weeks: WeekPlan[];
  onSelectWeek: (weekNumber: number) => void;
  onOpenDriveModal: (weekNumber: number) => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

export const WeekListView: React.FC<WeekListViewProps> = ({
  weeks,
  onSelectWeek,
  onOpenDriveModal,
  isAdmin,
  onRequireAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<'all' | 'stage1' | 'stage2' | 'stage3'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'has_drive' | 'completed' | 'in_progress'>('all');

  const filteredWeeks = weeks.filter((w) => {
    // Stage filter
    if (filterStage === 'stage1' && w.weekNumber > 13) return false;
    if (filterStage === 'stage2' && (w.weekNumber < 14 || w.weekNumber > 26)) return false;
    if (filterStage === 'stage3' && w.weekNumber < 27) return false;

    // Status filter
    if (filterStatus === 'has_drive' && (!w.driveLinks || w.driveLinks.length === 0)) return false;
    if (filterStatus === 'completed' && w.status !== 'completed') return false;
    if (filterStatus === 'in_progress' && w.status !== 'in_progress') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = w.title.toLowerCase().includes(q);
      const inNotes = w.notes.toLowerCase().includes(q);
      const inLinks = w.driveLinks?.some(
        (l) => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)
      );
      if (!inTitle && !inNotes && !inLinks) return false;
    }

    return true;
  });

  const getDriveTypeIcon = (type: DriveLinkType) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-3.5 h-3.5 text-amber-500" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case 'spreadsheet':
        return <Table className="w-3.5 h-3.5 text-emerald-500" />;
      case 'presentation':
        return <Presentation className="w-3.5 h-3.5 text-orange-500" />;
      case 'form':
        return <FileCode className="w-3.5 h-3.5 text-purple-500" />;
      case 'pdf':
        return <File className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Link2 className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Hafta adı, not veya Drive linki ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Stage filter */}
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Tüm Dönemler (38 Hafta)</option>
              <option value="stage1">1. Aşama (Hafta 1 - 13)</option>
              <option value="stage2">2. Aşama (Hafta 14 - 26)</option>
              <option value="stage3">3. Aşama (Hafta 27 - 38)</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="has_drive">📂 Sadece Drive Linki Olanlar</option>
              <option value="completed">✓ Tamamlananlar</option>
              <option value="in_progress">⏳ Devam Edenler</option>
            </select>
          </div>
        </div>

        {/* Counter summary */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Toplam {filteredWeeks.length} hafta listeleniyor</span>
          <span>Google Drive linklerine doğrudan tıklayıp açabilirsiniz</span>
        </div>
      </div>

      {/* Grid of Weeks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWeeks.map((week) => {
          const isDone = week.status === 'completed';
          const isInProgress = week.status === 'in_progress';
          const completedTasks = (week.tasks || []).filter((t) => t.completed).length;
          const totalTasks = (week.tasks || []).length;

          return (
            <div
              key={week.weekNumber}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-400 dark:hover:border-indigo-600"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {week.weekNumber}
                    </span>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">
                      {week.title}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : isInProgress
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {isDone ? 'Tamamlandı' : isInProgress ? 'Devam Ediyor' : 'Başlanmadı'}
                  </span>
                </div>

                {/* Subtitle / Stage */}
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                  {week.subtitle}
                </p>

                {/* Notes Snippet */}
                {week.notes ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                    {week.notes}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic mb-3">
                    Henüz not eklenmedi
                  </p>
                )}

                {/* Drive Links Direct Clickable Badges */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3.5 h-3.5 text-blue-500" />
                      Google Drive Kaynakları ({(week.driveLinks || []).length})
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isAdmin) {
                          onRequireAdmin();
                        } else {
                          onOpenDriveModal(week.weekNumber);
                        }
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Ekle
                    </button>
                  </div>

                  {(!week.driveLinks || week.driveLinks.length === 0) ? (
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg text-[11px] text-slate-400 text-center">
                      Drive linki yok
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {week.driveLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200/60 dark:border-blue-900/40 transition-colors text-xs text-blue-900 dark:text-blue-200"
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {getDriveTypeIcon(link.type)}
                            <span className="truncate font-medium">{link.title}</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-blue-500 shrink-0 ml-1" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                {totalTasks > 0 ? (
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {completedTasks}/{totalTasks} görev
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">Görev yok</span>
                )}

                <button
                  type="button"
                  onClick={() => onSelectWeek(week.weekNumber)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Detaya Git</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
