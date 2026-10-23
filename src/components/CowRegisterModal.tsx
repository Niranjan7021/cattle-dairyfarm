import React, { useState } from 'react';
import { X, Plus, Tag, Info } from 'lucide-react';
import { Cow } from '../types';
import { calculateRiskScoring } from '../utils/scoring';

interface CowRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterCow: (cow: Cow) => void;
}

export const CowRegisterModal: React.FC<CowRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterCow,
}) => {
  const [tagNumber, setTagNumber] = useState('');
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Holstein-Friesian');
  const [birthDate, setBirthDate] = useState('2023-03-15');
  const [lactationNumber, setLactationNumber] = useState(2);
  const [daysInMilk, setDaysInMilk] = useState(90);
  const [pen, setPen] = useState('North Barn - Pen A2');
  const [weightKg, setWeightKg] = useState(650);
  const [baselineMilk, setBaselineMilk] = useState(30.0);
  const [baselineFeed, setBaselineFeed] = useState(250);
  const [baselineRumination, setBaselineRumination] = useState(470);
  const [photoOption, setPhotoOption] = useState<'portrait' | 'stall' | 'none'>('portrait');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tagNumber.trim()) {
      setError('Please provide an Ear Tag ID (e.g., 1042)');
      return;
    }
    if (!name.trim()) {
      setError('Please provide a name for this cow');
      return;
    }

    const baseline = {
      milkYieldMean: Number(baselineMilk),
      milkYieldStd: 1.8,
      feedingTimeMean: Number(baselineFeed),
      feedingTimeStd: 18,
      ruminationTimeMean: Number(baselineRumination),
      ruminationTimeStd: 22,
      activityMean: 100,
      activityStd: 12,
    };

    const today = {
      milkYield: Number(baselineMilk),
      feedingTime: Number(baselineFeed),
      ruminationTime: Number(baselineRumination),
      activityScore: 100,
      jawChewRate: 60,
      movementState: 'resting' as const,
      lastVideoAnalyzedAt: 'Just registered',
    };

    const scoring = calculateRiskScoring(baseline, today);

    // Initial 14 days generated nominal
    const history14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      history14Days.push({
        dayIndex: 14 - i,
        date: d.toISOString().split('T')[0],
        milkYield: Number((baselineMilk + (Math.sin(i) * 0.6)).toFixed(1)),
        feedTime: Math.round(baselineFeed + (Math.sin(i * 0.8) * 8)),
        ruminationTime: Math.round(baselineRumination + (Math.cos(i * 0.9) * 12)),
        activityScore: 100,
      });
    }

    let photoUrl: string | undefined = undefined;
    if (photoOption === 'portrait') {
      photoUrl = '/src/assets/images/cow_head_portrait_tag_1792781948691.jpg';
    } else if (photoOption === 'stall') {
      photoUrl = '/src/assets/images/cow_resting_ruminating_1792781967102.jpg';
    }

    const newCow: Cow = {
      id: `cow-${tagNumber.trim()}`,
      tagNumber: tagNumber.trim(),
      name: name.trim(),
      breed,
      birthDate,
      lactationNumber: Number(lactationNumber),
      daysInMilk: Number(daysInMilk),
      pen,
      weightKg: Number(weightKg),
      photoUrl,
      status: 'healthy',
      baseline,
      today,
      scoring,
      history14Days,
      registeredAt: new Date().toISOString().split('T')[0],
    };

    onRegisterCow(newCow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#121a16] border border-neutral-200 dark:border-[#273a30] text-neutral-900 dark:text-neutral-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-[#23332b] flex items-center justify-between sticky top-0 bg-white dark:bg-[#121a16] z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Register New Dairy Cow</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Establish her 14-day individual baseline profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1f2d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Yellow Ear Tag Number *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={tagNumber}
                  onChange={(e) => setTagNumber(e.target.value)}
                  placeholder="e.g. 1042"
                  required
                  className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg pl-10 pr-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono-numbers font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Cow Name / ID *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Penelope"
                required
                className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Breed
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Holstein-Friesian">Holstein-Friesian</option>
                <option value="Jersey">Jersey</option>
                <option value="Brown Swiss">Brown Swiss</option>
                <option value="Guernsey">Guernsey</option>
                <option value="Ayrshire">Ayrshire</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Barn & Pen Section
              </label>
              <input
                type="text"
                value={pen}
                onChange={(e) => setPen(e.target.value)}
                placeholder="e.g. North Barn - Pen A2"
                required
                className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Lactation Cycle (Parity)
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={lactationNumber}
                onChange={(e) => setLactationNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Days in Milk (DIM)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={daysInMilk}
                onChange={(e) => setDaysInMilk(parseInt(e.target.value) || 1)}
                className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono-numbers"
              />
            </div>
          </div>

          {/* Baseline Values Header */}
          <div className="pt-3 border-t border-neutral-200 dark:border-[#23332b]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Learned Normal Baselines (Her Own 14-Day Normal)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-neutral-700 dark:text-neutral-300 mb-1">
                  Expected Milk (L/day)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={baselineMilk}
                  onChange={(e) => setBaselineMilk(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-700 dark:text-neutral-300 mb-1">
                  Feed Intake Time (min/day)
                </label>
                <input
                  type="number"
                  value={baselineFeed}
                  onChange={(e) => setBaselineFeed(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-700 dark:text-neutral-300 mb-1">
                  Rumination Time (min/day)
                </label>
                <input
                  type="number"
                  value={baselineRumination}
                  onChange={(e) => setBaselineRumination(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono-numbers"
                />
              </div>
            </div>
          </div>

          {/* Photo selection */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Cow Photo Avatar
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPhotoOption('portrait')}
                className={`p-2 rounded-lg border text-xs text-center cursor-pointer transition-colors ${
                  photoOption === 'portrait'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-[#16271e] text-emerald-800 dark:text-emerald-300 font-semibold'
                    : 'border-neutral-200 dark:border-[#273a30] bg-neutral-50 dark:bg-[#0a0f0d] text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Ear Tag Portrait
              </button>
              <button
                type="button"
                onClick={() => setPhotoOption('stall')}
                className={`p-2 rounded-lg border text-xs text-center cursor-pointer transition-colors ${
                  photoOption === 'stall'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-[#16271e] text-emerald-800 dark:text-emerald-300 font-semibold'
                    : 'border-neutral-200 dark:border-[#273a30] bg-neutral-50 dark:bg-[#0a0f0d] text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Resting Stall
              </button>
              <button
                type="button"
                onClick={() => setPhotoOption('none')}
                className={`p-2 rounded-lg border text-xs text-center cursor-pointer transition-colors ${
                  photoOption === 'none'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-[#16271e] text-emerald-800 dark:text-emerald-300 font-semibold'
                    : 'border-neutral-200 dark:border-[#273a30] bg-neutral-50 dark:bg-[#0a0f0d] text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Generic Tag Icon
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-[#23332b] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Register & Initialize Baseline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
