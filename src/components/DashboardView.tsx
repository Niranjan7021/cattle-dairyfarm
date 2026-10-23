import React from 'react';
import { Cow, MilkRecord, NotificationAlert } from '../types';
import {
  ShieldAlert,
  AlertTriangle,
  Droplets,
  Video,
  Activity,
  ArrowRight,
  TrendingDown,
  Info,
  Sparkles,
  Camera,
  CheckCircle,
} from 'lucide-react';
import { CheckTodayQueue } from './CheckTodayQueue';

interface DashboardViewProps {
  cows: Cow[];
  milkRecords: MilkRecord[];
  ownerPhone?: string;
  onNavigateToTab: (tab: 'check-today' | 'video-analyzer' | 'milk-tracker' | 'cows') => void;
  onSelectCowForDetail: (cow: Cow) => void;
  onSendSmsAlert: (cow: Cow) => void;
  onSendSmsAlertToAll?: (cows: Cow[]) => void;
  onOpenVideoAnalyzer: (tag: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cows,
  milkRecords,
  ownerPhone,
  onNavigateToTab,
  onSelectCowForDetail,
  onSendSmsAlert,
  onSendSmsAlertToAll,
  onOpenVideoAnalyzer,
}) => {
  // Flagged cows
  const flaggedCows = cows.filter(
    (c) => c.scoring.priority !== 'normal' || c.status === 'in_heat'
  );

  // Herd metrics
  const avgMilk = cows.reduce((sum, c) => sum + c.today.milkYield, 0) / (cows.length || 1);
  const totalMilkToday = cows.reduce((sum, c) => sum + c.today.milkYield, 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Headline Banner */}
      <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Autonomous Dairy Early-Warning System</span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-400">ONSPOT Non-Invasive Computer Vision</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Catching Illness Before the Milk Drops
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Every cow has her own normal. By continuously reading milk yield, feed bunk duration, and jaw rumination oscillations, HerdSentinel identifies behavioral drops 48–72 hours before milk crashes.
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateToTab('check-today')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-lg shadow-amber-950/40"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Check Today List ({flaggedCows.length})
            </button>
            <button
              onClick={() => onOpenVideoAnalyzer('0412')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" /> Launch Video AI
            </button>
          </div>
        </div>

        {/* Subtle decorative background tint */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-950/40 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
            <span>Check Today Priority</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono-numbers mt-1.5">
            {flaggedCows.length} <span className="text-xs font-normal text-neutral-400">cows flagged</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            2 High · 1 Medium · 1 Estrus filter
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
            <span>Herd Milk Total Today</span>
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono-numbers mt-1.5">
            {totalMilkToday.toFixed(1)} <span className="text-xs font-normal text-neutral-400">Liters</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono-numbers">
            Avg {avgMilk.toFixed(1)} L/cow (within 3% of baseline)
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
            <span>Active Barn Cameras</span>
            <Camera className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono-numbers mt-1.5">
            3 <span className="text-xs font-normal text-neutral-400">online streams</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Overhead feed bunk & stall telemetry
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
            <span>Total Cows Managed</span>
            <span className="text-xs font-mono-numbers text-emerald-400">100% active</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono-numbers mt-1.5">
            {cows.length} <span className="text-xs font-normal text-neutral-400">in herd</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Zero wearable collars needed
          </div>
        </div>
      </div>

      {/* Ranked Check Today Queue */}
      <CheckTodayQueue
        cows={cows}
        ownerPhone={ownerPhone}
        onSelectCowForChart={onSelectCowForDetail}
        onOpenVideoAnalyzer={onOpenVideoAnalyzer}
        onSendSmsAlert={onSendSmsAlert}
        onSendSmsAlertToAll={onSendSmsAlertToAll}
        onSelectCowForDetail={onSelectCowForDetail}
      />
    </div>
  );
};
