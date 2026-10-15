import React from 'react';
import { CheckCircle2, Clock, Folder, Award, TrendingUp } from 'lucide-react';
import type { WeekPlan } from '../types';

interface StatsOverviewProps {
  weeks: WeekPlan[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ weeks }) => {
  const totalWeeks = 38;
  const completedWeeks = weeks.filter((w) => w.status === 'completed').length;
  const inProgressWeeks = weeks.filter((w) => w.status === 'in_progress').length;
  const notStartedWeeks = weeks.filter((w) => w.status === 'not_started').length;

  const totalDriveLinks = weeks.reduce(
    (acc, w) => acc + (w.driveLinks ? w.driveLinks.length : 0),
    0
  );

  const totalTasks = weeks.reduce((acc, w) => acc + (w.tasks ? w.tasks.length : 0), 0);
  const completedTasks = weeks.reduce(
    (acc, w) => acc + (w.tasks ? w.tasks.filter((t) => t.completed).length : 0),
    0
  );

  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100);

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-900 text-white border-b border-indigo-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Title & Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                38 Haftalık Müfredat & Plan
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                %{progressPercent} Tamamlandı
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Haftalık Çalışma ve Google Drive Kaynak Takibi
            </h1>

            {/* Progress Bar */}
            <div className="w-full sm:w-96 bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Stat Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {/* Completed */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tamamlanan</span>
              </div>
              <p className="text-xl font-bold mt-1 text-white">
                {completedWeeks} <span className="text-xs text-slate-400 font-normal">/ 38</span>
              </p>
            </div>

            {/* In Progress */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
                <Clock className="w-4 h-4" />
                <span>Devam Eden</span>
              </div>
              <p className="text-xl font-bold mt-1 text-white">
                {inProgressWeeks} <span className="text-xs text-slate-400 font-normal">hafta</span>
              </p>
            </div>

            {/* Drive Links */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-medium">
                <Folder className="w-4 h-4" />
                <span>Google Drive</span>
              </div>
              <p className="text-xl font-bold mt-1 text-white">
                {totalDriveLinks} <span className="text-xs text-slate-400 font-normal">link</span>
              </p>
            </div>

            {/* Tasks */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>Görevler</span>
              </div>
              <p className="text-xl font-bold mt-1 text-white">
                {completedTasks} <span className="text-xs text-slate-400 font-normal">/ {totalTasks}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
