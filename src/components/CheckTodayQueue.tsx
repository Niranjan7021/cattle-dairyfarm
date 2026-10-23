import React, { useState } from 'react';
import { Cow, AlertPriority } from '../types';
import {
  AlertTriangle,
  Send,
  Video,
  HelpCircle,
  ArrowRight,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { BaselineChart } from './BaselineChart';

interface CheckTodayQueueProps {
  cows: Cow[];
  ownerPhone?: string;
  onSelectCowForChart: (cow: Cow) => void;
  onOpenVideoAnalyzer: (tag: string) => void;
  onSendSmsAlert: (cow: Cow) => void;
  onSendSmsAlertToAll?: (cows: Cow[]) => void;
  onSelectCowForDetail: (cow: Cow) => void;
}

export const CheckTodayQueue: React.FC<CheckTodayQueueProps> = ({
  cows,
  ownerPhone = '+1 (555) 382-9014',
  onSelectCowForChart,
  onOpenVideoAnalyzer,
  onSendSmsAlert,
  onSendSmsAlertToAll,
  onSelectCowForDetail,
}) => {
  // User selects cow name / tag first
  const [selectedCowTag, setSelectedCowTag] = useState<string | null>(null);

  // Filter anomalous cows only (exclude healthy nominal cows to prevent graph fatigue)
  const anomalousCows = cows
    .filter((c) => c.scoring.priority !== 'normal' || c.status === 'in_heat')
    .sort((a, b) => b.scoring.combinedRiskIndex - a.scoring.combinedRiskIndex);

  const selectedCow = cows.find((c) => c.tagNumber === selectedCowTag);

  const getPriorityBadge = (priority: AlertPriority, isEstrus: boolean) => {
    if (isEstrus) {
      return (
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950/70 border border-violet-300 dark:border-violet-700/60 text-violet-800 dark:text-violet-300 uppercase tracking-wide">
          Estrus (In Heat)
        </span>
      );
    }
    switch (priority) {
      case 'high':
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700/60 text-rose-800 dark:text-rose-300 uppercase tracking-wide">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 uppercase tracking-wide">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-700/60 text-sky-800 dark:text-sky-300 uppercase tracking-wide">
            Watchlist
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Concept Explanation */}
      <div className="bg-white dark:bg-[#121a16] border border-neutral-200 dark:border-[#23332b] rounded-xl p-5 transition-colors shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Ranked Priority Queue</span>
              <span className="text-neutral-400 dark:text-neutral-500">·</span>
              <span className="text-neutral-600 dark:text-neutral-400">Zero Graph Fatigue</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
              Check Today: Choose Cow Name to Inspect
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Select a cow name first to review her specific baseline deviations, daily telemetry, and recommended actions. Healthy cows are filtered out to prevent clutter.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-[#0c120f] px-3 py-2 rounded-lg border border-neutral-200 dark:border-[#23332b]">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Reports variances, not medical diagnoses</span>
          </div>
        </div>

        {/* Owner Mobile SMS Delivery Banner */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>Owner Mobile Active:</strong> <span className="font-mono-numbers font-bold text-neutral-900 dark:text-white px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/50">{ownerPhone}</span> — when a cow is affected, an SMS is sent from this app to the owner.
            </span>
          </div>
          {onSendSmsAlertToAll && anomalousCows.length > 0 && (
            <button
              onClick={() => onSendSmsAlertToAll(anomalousCows)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <Send className="w-3 h-3" />
              <span>SMS All {anomalousCows.length} Affected Cows</span>
            </button>
          )}
        </div>

        {/* Cow Selector Strip: User chooses cow name first */}
        <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-[#23332b] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Step 1: Choose Cow to Inspect ({anomalousCows.length} Flagged)
            </span>
            {selectedCowTag && (
              <button
                onClick={() => setSelectedCowTag(null)}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {anomalousCows.map((cow) => {
              const isSelected = selectedCowTag === cow.tagNumber;
              return (
                <button
                  key={cow.id}
                  onClick={() => setSelectedCowTag(cow.tagNumber)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-[#1b2b22] border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-neutral-50 dark:bg-[#0f1713] border-neutral-200 dark:border-[#223329] hover:border-emerald-300 dark:hover:border-[#334d3e]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-1.5">
                        <span>{cow.name}</span>
                        <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                          (Tag #{cow.tagNumber})
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{cow.breed}</div>
                    </div>
                    {getPriorityBadge(cow.scoring.priority, cow.scoring.isEstrusSuspected)}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-neutral-200 dark:border-[#23332b]/60 flex items-center justify-between text-[11px] font-mono-numbers">
                    <span className="text-neutral-500 dark:text-neutral-400">Risk Score:</span>
                    <span
                      className={`font-bold ${
                        cow.scoring.combinedRiskIndex >= 70
                          ? 'text-rose-600 dark:text-rose-400'
                          : cow.scoring.combinedRiskIndex >= 45
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {cow.scoring.combinedRiskIndex}/100
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 2: Show Data ONLY when a Cow is Selected */}
      {selectedCow ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Selected Cow Detail Banner */}
          <div
            className={`border rounded-xl p-5 transition-colors shadow-sm ${
              selectedCow.scoring.priority === 'high'
                ? 'bg-rose-50/50 dark:bg-[#181a17] border-rose-200 dark:border-rose-900/60'
                : selectedCow.scoring.isEstrusSuspected
                ? 'bg-violet-50/50 dark:bg-[#16161c] border-violet-200 dark:border-violet-900/60'
                : 'bg-amber-50/50 dark:bg-[#151c17] border-amber-200 dark:border-amber-900/60'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
              {/* Identity & Tags */}
              <div className="flex items-start gap-4">
                {selectedCow.photoUrl ? (
                  <img
                    src={selectedCow.photoUrl}
                    alt={`Cow ${selectedCow.tagNumber}`}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-[#2b3d33]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-[#1e2a24] border border-neutral-200 dark:border-[#2b3d33] flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <span className="text-[10px] text-neutral-500 uppercase">TAG</span>
                    <span className="text-base font-bold font-mono-numbers">{selectedCow.tagNumber}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      {selectedCow.name}
                      <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400 font-mono-numbers">
                        (Tag #{selectedCow.tagNumber})
                      </span>
                    </h3>
                    {getPriorityBadge(selectedCow.scoring.priority, selectedCow.scoring.isEstrusSuspected)}
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{selectedCow.breed}</span>
                    <span className="text-neutral-400 dark:text-neutral-500">·</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono-numbers">{selectedCow.pen}</span>
                  </div>

                  {/* Primary changes flagged */}
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                      Primary Behavioral Variances Flagged:
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedCow.scoring.primaryChanges.map((change, idx) => (
                        <div
                          key={idx}
                          className="text-xs font-medium px-2.5 py-1 rounded-md bg-white dark:bg-[#0d1310] border border-neutral-200 dark:border-[#26382e] text-neutral-800 dark:text-neutral-200 shadow-sm"
                        >
                          {change}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested action */}
                  <div className="mt-3 flex items-start gap-2 text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400 font-semibold shrink-0 uppercase tracking-wide">
                      Suggested Action:
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                      {selectedCow.scoring.suggestedAction}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <button
                  onClick={() => onSendSmsAlert(selectedCow)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Dispatch SMS to Owner ({ownerPhone})
                </button>

                <button
                  onClick={() => onOpenVideoAnalyzer(selectedCow.tagNumber)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-[#1e2a23] hover:bg-neutral-100 dark:hover:bg-[#283830] border border-neutral-300 dark:border-[#2d4237] rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Video className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Track Uploaded Video
                </button>

                <button
                  onClick={() => onSelectCowForDetail(selectedCow)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-[#1e2a23] hover:bg-neutral-100 dark:hover:bg-[#283830] border border-neutral-300 dark:border-[#2d4237] rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Medical Baseline Sheet <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Metric Comparison Counters */}
            <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-[#23332b] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#0d1310] border border-neutral-200 dark:border-[#22332a] shadow-sm">
                <div className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Combined Risk Index</div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono-numbers">
                  {selectedCow.scoring.combinedRiskIndex} / 100
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#0d1310] border border-neutral-200 dark:border-[#22332a] shadow-sm">
                <div className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Rumination Time</div>
                <div className="text-lg font-bold text-neutral-800 dark:text-neutral-200 font-mono-numbers">
                  {selectedCow.today.ruminationTime}m
                </div>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-mono-numbers">
                  {selectedCow.scoring.ruminationVariancePercent}% vs normal ({selectedCow.baseline.ruminationTimeMean}m)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#0d1310] border border-neutral-200 dark:border-[#22332a] shadow-sm">
                <div className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Feed Bunk Duration</div>
                <div className="text-lg font-bold text-neutral-800 dark:text-neutral-200 font-mono-numbers">
                  {selectedCow.today.feedingTime}m
                </div>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 font-mono-numbers">
                  {selectedCow.scoring.feedVariancePercent}% vs normal ({selectedCow.baseline.feedingTimeMean}m)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#0d1310] border border-neutral-200 dark:border-[#22332a] shadow-sm">
                <div className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Milk Yield Today</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono-numbers">
                  {selectedCow.today.milkYield} L
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono-numbers">
                  baseline {selectedCow.baseline.milkYieldMean} L
                </div>
              </div>
            </div>
          </div>

          {/* 14-Day Baseline Trajectory for this chosen cow */}
          <BaselineChart cow={selectedCow} onRunVideoAnalysis={onOpenVideoAnalyzer} />
        </div>
      ) : (
        /* Empty Prompt State when no cow is selected yet */
        <div className="bg-white dark:bg-[#121a16] border border-neutral-200 dark:border-[#23332b] rounded-xl p-10 text-center space-y-3 transition-colors shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-[#18261e] border border-emerald-200 dark:border-[#2b3d33] flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Choose a Cow Name Above</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            Please click on any flagged cow card above (e.g., <strong>Bella</strong>, <strong>Daisy</strong>, or <strong>Buttercup</strong>) to view her individual 14-day history, behavioral variances, and recommended actions.
          </p>
        </div>
      )}
    </div>
  );
};
