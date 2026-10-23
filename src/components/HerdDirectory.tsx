import React, { useState } from 'react';
import { Cow } from '../types';
import {
  Search,
  Plus,
  Eye,
  Video,
  Send,
  Grid,
  List,
} from 'lucide-react';

interface HerdDirectoryProps {
  cows: Cow[];
  onSelectCow: (cow: Cow) => void;
  onOpenRegisterModal: () => void;
  onOpenVideoAnalyzer: (tag: string) => void;
  onSendSms: (cow: Cow) => void;
}

export const HerdDirectory: React.FC<HerdDirectoryProps> = ({
  cows,
  onSelectCow,
  onOpenRegisterModal,
  onOpenVideoAnalyzer,
  onSendSms,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'healthy' | 'in_heat'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'risk' | 'tag' | 'milk' | 'rumination'>('risk');

  // Filter & Sort
  const filteredCows = cows
    .filter((c) => {
      const matchSearch =
        c.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.pen.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter === 'flagged') return c.scoring.priority !== 'normal' && !c.scoring.isEstrusSuspected;
      if (statusFilter === 'healthy') return c.scoring.priority === 'normal';
      if (statusFilter === 'in_heat') return c.scoring.isEstrusSuspected || c.status === 'in_heat';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') return b.scoring.combinedRiskIndex - a.scoring.combinedRiskIndex;
      if (sortBy === 'tag') return a.tagNumber.localeCompare(b.tagNumber);
      if (sortBy === 'milk') return b.today.milkYield - a.today.milkYield;
      if (sortBy === 'rumination') return a.scoring.ruminationVariancePercent - b.scoring.ruminationVariancePercent;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-[#121a16] border border-neutral-200 dark:border-[#23332b] rounded-xl p-5 transition-colors shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Herd Inventory · {cows.length} Cows Registered
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
              Cow Management & Registry
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Register New Cow
            </button>
          </div>
        </div>

        {/* Search, Filter & View Mode */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-[#23332b] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by tag #, cow name, breed, pen..."
                className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-300 focus:outline-none"
            >
              <option value="all">All Statuses ({cows.length})</option>
              <option value="flagged">Check Today / Flagged (3)</option>
              <option value="healthy">Nominal / Healthy (5)</option>
              <option value="in_heat">Estrus Filter / In Heat (1)</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-300 focus:outline-none"
            >
              <option value="risk">Sort by Risk Index (High → Low)</option>
              <option value="tag">Sort by Tag ID</option>
              <option value="milk">Sort by Milk Yield</option>
              <option value="rumination">Sort by Rumination Drop</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-[#0a0f0d] border border-neutral-200 dark:border-[#23332b] rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-[#1f3025] text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-[#1f3025] text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Card grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#121a16] border border-neutral-200 dark:border-[#23332b] rounded-xl overflow-hidden transition-colors shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-[#0a0f0d] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-[10px] border-b border-neutral-200 dark:border-[#23332b]">
                <tr>
                  <th className="py-3 px-4">Tag & Cow Name</th>
                  <th className="py-3 px-4">Breed / Pen</th>
                  <th className="py-3 px-4">Parity / DIM</th>
                  <th className="py-3 px-4 text-right">Rumination (Today vs Normal)</th>
                  <th className="py-3 px-4 text-right">Milk Yield</th>
                  <th className="py-3 px-4 text-center">Risk Index</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-[#202e26]">
                {filteredCows.map((cow) => {
                  return (
                    <tr key={cow.id} className="hover:bg-neutral-50 dark:hover:bg-[#18231d]/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {cow.photoUrl ? (
                            <img
                              src={cow.photoUrl}
                              alt={cow.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-lg object-cover border border-neutral-200 dark:border-[#2b3d33]"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-[#1a2620] border border-neutral-200 dark:border-[#2b3d33] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold font-mono-numbers">
                              {cow.tagNumber.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                              Cow #{cow.tagNumber}
                              <span className="font-normal text-neutral-500 dark:text-neutral-400">({cow.name})</span>
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono-numbers">
                              Reg: {cow.registeredAt}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-neutral-700 dark:text-neutral-300">
                        <div>{cow.breed}</div>
                        <div className="text-[10px] text-neutral-500 font-mono-numbers">{cow.pen}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-neutral-700 dark:text-neutral-300 font-mono-numbers">
                        <div>Lac #{cow.lactationNumber}</div>
                        <div className="text-[10px] text-neutral-500">{cow.daysInMilk} DIM</div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono-numbers">
                        <span
                          className={`font-bold ${
                            cow.scoring.ruminationVariancePercent < -20
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-neutral-800 dark:text-neutral-200'
                          }`}
                        >
                          {cow.today.ruminationTime}m
                        </span>
                        <div
                          className={`text-[10px] ${
                            cow.scoring.ruminationVariancePercent < -15
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : 'text-neutral-500'
                          }`}
                        >
                          {cow.scoring.ruminationVariancePercent}% vs {cow.baseline.ruminationTimeMean}m
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono-numbers">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{cow.today.milkYield} L</span>
                        <div className="text-[10px] text-neutral-500">
                          base {cow.baseline.milkYieldMean} L
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {cow.status === 'in_heat' ? (
                          <span className="text-[11px] font-bold text-violet-800 dark:text-violet-300 px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950/70 border border-violet-300 dark:border-violet-800">
                            In Heat
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-bold font-mono-numbers px-2 py-0.5 rounded ${
                              cow.scoring.combinedRiskIndex >= 70
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                : cow.scoring.combinedRiskIndex >= 45
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                            }`}
                          >
                            {cow.scoring.combinedRiskIndex}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectCow(cow)}
                            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#202e26] transition-colors cursor-pointer"
                            title="View Cow Baseline & History"
                          >
                            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </button>

                          <button
                            onClick={() => onOpenVideoAnalyzer(cow.tagNumber)}
                            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#202e26] transition-colors cursor-pointer"
                            title="Run Video AI Tracking"
                          >
                            <Video className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </button>

                          <button
                            onClick={() => onSendSms(cow)}
                            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#202e26] transition-colors cursor-pointer"
                            title="Dispatch SMS Alert"
                          >
                            <Send className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCows.map((cow) => (
            <div
              key={cow.id}
              className="bg-white dark:bg-[#121a16] border border-neutral-200 dark:border-[#23332b] rounded-xl p-4 hover:border-emerald-500 transition-colors flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {cow.photoUrl ? (
                      <img
                        src={cow.photoUrl}
                        alt={cow.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-neutral-200 dark:border-[#2b3d33]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-[#1a2620] border border-neutral-200 dark:border-[#2b3d33] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold font-mono-numbers">
                        {cow.tagNumber}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Cow #{cow.tagNumber}</h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{cow.name}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      cow.scoring.priority === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                        : cow.status === 'in_heat'
                        ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {cow.status === 'in_heat' ? 'In Heat' : cow.scoring.priority}
                  </span>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 py-2 border-y border-neutral-200 dark:border-[#23332b]">
                  <div className="flex justify-between">
                    <span>Breed:</span>
                    <span className="text-neutral-900 dark:text-neutral-200">{cow.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pen:</span>
                    <span className="text-neutral-900 dark:text-neutral-200 font-mono-numbers">{cow.pen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rumination:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono-numbers">
                      {cow.today.ruminationTime}m ({cow.scoring.ruminationVariancePercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Milk Yield:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono-numbers">{cow.today.milkYield} L</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectCow(cow)}
                  className="flex-1 py-1.5 px-2 bg-neutral-100 dark:bg-[#1b2b22] hover:bg-neutral-200 dark:hover:bg-[#25392e] text-xs font-medium text-neutral-800 dark:text-neutral-200 rounded-lg transition-colors cursor-pointer text-center"
                >
                  View Details
                </button>
                <button
                  onClick={() => onOpenVideoAnalyzer(cow.tagNumber)}
                  className="p-1.5 rounded-lg bg-neutral-100 dark:bg-[#1b2b22] hover:bg-neutral-200 dark:hover:bg-[#25392e] text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                  title="Video AI"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
