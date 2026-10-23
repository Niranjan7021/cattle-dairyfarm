import React, { useState } from 'react';
import { Cow } from '../types';
import {
  X,
  Send,
  Video,
  Activity,
  Droplets,
  Clock,
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
} from 'lucide-react';
import { BaselineChart } from './BaselineChart';

interface CowDetailModalProps {
  cow: Cow | null;
  isOpen: boolean;
  onClose: () => void;
  onSendSms: (cow: Cow) => void;
  onOpenVideoAnalyzer: (tag: string) => void;
}

export const CowDetailModal: React.FC<CowDetailModalProps> = ({
  cow,
  isOpen,
  onClose,
  onSendSms,
  onOpenVideoAnalyzer,
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'history' | 'vet_notes'>('chart');
  const [vetNotes, setVetNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  if (!isOpen || !cow) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vetNotes.trim()) return;
    setSavedNotes([
      `Dr. Jenkins (${new Date().toLocaleDateString()}): ${vetNotes.trim()}`,
      ...savedNotes,
    ]);
    setVetNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121a16] border border-[#273a30] text-neutral-100 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#23332b] flex items-center justify-between sticky top-0 bg-[#121a16] z-10">
          <div className="flex items-center gap-3">
            {cow.photoUrl && (
              <img
                src={cow.photoUrl}
                alt={cow.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-lg object-cover border border-[#2d4237]"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Cow #{cow.tagNumber} · {cow.name}
                </h2>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    cow.scoring.priority === 'high'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                      : cow.status === 'in_heat'
                      ? 'bg-violet-950/80 text-violet-300 border border-violet-800'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {cow.status === 'in_heat' ? 'In Heat (Estrus)' : `${cow.scoring.priority} Priority`}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {cow.breed} · {cow.pen} · Lactation #{cow.lactationNumber} ({cow.daysInMilk} DIM)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendSms(cow)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> SMS Farmer
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#1f2d26] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stat Pill Strip */}
        <div className="px-6 py-4 bg-[#0d1310] border-b border-[#23332b] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-[#141f19] border border-[#22332a]">
            <div className="text-[10px] uppercase text-neutral-400">Combined Risk Index</div>
            <div className="text-lg font-bold text-amber-400 font-mono-numbers">
              {cow.scoring.combinedRiskIndex} / 100
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#141f19] border border-[#22332a]">
            <div className="text-[10px] uppercase text-neutral-400">Rumination Time</div>
            <div className="text-lg font-bold text-neutral-200 font-mono-numbers">
              {cow.today.ruminationTime}m
            </div>
            <div className="text-[10px] text-rose-400 font-mono-numbers">
              {cow.scoring.ruminationVariancePercent}% vs baseline
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#141f19] border border-[#22332a]">
            <div className="text-[10px] uppercase text-neutral-400">Feed Bunk Duration</div>
            <div className="text-lg font-bold text-neutral-200 font-mono-numbers">
              {cow.today.feedingTime}m
            </div>
            <div className="text-[10px] text-rose-400 font-mono-numbers">
              {cow.scoring.feedVariancePercent}% vs baseline
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#141f19] border border-[#22332a]">
            <div className="text-[10px] uppercase text-neutral-400">Milk Today</div>
            <div className="text-lg font-bold text-emerald-400 font-mono-numbers">
              {cow.today.milkYield} L
            </div>
            <div className="text-[10px] text-neutral-400 font-mono-numbers">
              {cow.baseline.milkYieldMean} L baseline
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 flex border-b border-[#23332b] bg-[#0f1612]">
          <button
            onClick={() => setActiveTab('chart')}
            className={`py-3 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'chart'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            14-Day Baseline Trajectory
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Daily Sensor Readings Table
          </button>
          <button
            onClick={() => setActiveTab('vet_notes')}
            className={`py-3 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'vet_notes'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Clinical & Vet Inspection Notes
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'chart' && (
            <div className="space-y-4">
              <BaselineChart cow={cow} onRunVideoAnalysis={onOpenVideoAnalyzer} />

              <div className="p-4 rounded-xl bg-[#0e1612] border border-[#23332b] text-xs space-y-2">
                <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
                  ONSPOT Diagnostic Protocol:
                </h4>
                <p className="text-neutral-300 leading-relaxed">
                  Notice that {cow.name}'s milk yield remains relatively stable while rumination has decreased by {Math.abs(cow.scoring.ruminationVariancePercent)}%. Under traditional dairy management, this illness would only be spotted after the milk drops significantly in Stage 3. Because rumination and feed bunk duration are lead indicators, the farm team can perform non-invasive oral inspection, check rumen fill, or administer supportive fluids days in advance.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0a0f0d] text-neutral-400 uppercase tracking-wider text-[10px] border-b border-[#23332b]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Milk Yield (L)</th>
                    <th className="py-2.5 px-3 text-right">Feed Time (mins)</th>
                    <th className="py-2.5 px-3 text-right">Rumination (mins)</th>
                    <th className="py-2.5 px-3 text-right">Activity Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202e26]">
                  {cow.history14Days.map((reading) => (
                    <tr key={reading.date} className="hover:bg-[#18231d]/60">
                      <td className="py-2 px-3 text-white font-mono-numbers">{reading.date}</td>
                      <td className="py-2 px-3 text-right font-mono-numbers text-emerald-400">
                        {reading.milkYield}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-numbers text-sky-400">
                        {reading.feedTime}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-numbers text-amber-400 font-bold">
                        {reading.ruminationTime}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-numbers text-neutral-300">
                        {reading.activityScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'vet_notes' && (
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="block text-xs font-medium text-neutral-300">
                  Add Veterinary Observation or Treatment Note
                </label>
                <textarea
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  placeholder="e.g. Conducted oral exam: minor cud wad retention, rumen motility sluggish. Recommending probiotic bolus."
                  rows={3}
                  className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Save Vet Note
                </button>
              </form>

              <div className="pt-3 border-t border-[#23332b] space-y-2">
                <h5 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Log History
                </h5>
                {savedNotes.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#0a0f0d] border border-[#23332b] text-xs text-neutral-300">
                    {note}
                  </div>
                ))}
                <div className="p-2.5 rounded-lg bg-[#0a0f0d] border border-[#23332b] text-xs text-neutral-400">
                  <strong>System Audit:</strong> 14-day rolling baseline calibrated on registration. Last AI video tracking validation executed today at 08:45 AM.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
