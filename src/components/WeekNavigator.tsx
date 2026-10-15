import React from 'react';
import { CheckCircle2, Clock, Circle, Folder, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WeekPlan } from '../types';

interface WeekNavigatorProps {
  weeks: WeekPlan[];
  selectedWeekNumber: number;
  onSelectWeek: (weekNumber: number) => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  weeks,
  selectedWeekNumber,
  onSelectWeek,
}) => {
  // Determine current active stage
  const currentStage =
    selectedWeekNumber <= 13 ? 1 : selectedWeekNumber <= 26 ? 2 : 3;

  const handleStageClick = (stage: number) => {
    if (stage === 1) onSelectWeek(1);
    if (stage === 2) onSelectWeek(14);
    if (stage === 3) onSelectWeek(27);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      {/* Stages Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => handleStageClick(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              currentStage === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span>
            1. Aşama (Hafta 1 - 13)
          </button>
          <button
            onClick={() => handleStageClick(2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              currentStage === 2
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
            2. Aşama (Hafta 14 - 26)
          </button>
          <button
            onClick={() => handleStageClick(3)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              currentStage === 3
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-300"></span>
            3. Aşama (Hafta 27 - 38)
          </button>
        </div>

        {/* Quick Stepper Buttons for Mobile */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => onSelectWeek(Math.max(1, selectedWeekNumber - 1))}
            disabled={selectedWeekNumber <= 1}
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Önceki Hafta"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-slate-700 dark:text-slate-300 font-semibold px-1.5">
            {selectedWeekNumber} / 38
          </span>
          <button
            onClick={() => onSelectWeek(Math.min(38, selectedWeekNumber + 1))}
            disabled={selectedWeekNumber >= 38}
            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Sonraki Hafta"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 38-Week Horizontal Scrollable Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {weeks.map((week) => {
            const isSelected = week.weekNumber === selectedWeekNumber;
            const hasDrive = week.driveLinks && week.driveLinks.length > 0;
            const isDone = week.status === 'completed';
            const isInProgress = week.status === 'in_progress';

            return (
              <button
                key={week.weekNumber}
                onClick={() => onSelectWeek(week.weekNumber)}
                className={`relative shrink-0 flex items-center justify-center min-w-[42px] h-9 px-2.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm scale-105'
                    : isDone
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    : isInProgress
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span>H.{week.weekNumber}</span>

                {/* Google Drive Link indicator dot / badge */}
                {hasDrive && (
                  <span
                    className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shadow-xs ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                    title={`${week.driveLinks.length} adet Google Drive linki`}
                  >
                    ▲
                  </span>
                )}

                {/* Status Dot */}
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    isDone
                      ? 'bg-emerald-500'
                      : isInProgress
                      ? 'bg-amber-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
