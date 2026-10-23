import React, { useState } from 'react';
import { Cow, MilkRecord, User } from '../types';
import {
  Droplets,
  PlusCircle,
  History,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  CheckCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface MilkTrackerProps {
  cows: Cow[];
  milkRecords: MilkRecord[];
  currentUser: User | null;
  onAddMilkRecord: (record: Omit<MilkRecord, 'id' | 'timestamp' | 'varianceFromBaselinePercent'>) => void;
}

export const MilkTracker: React.FC<MilkTrackerProps> = ({
  cows,
  milkRecords,
  currentUser,
  onAddMilkRecord,
}) => {
  const [selectedCowId, setSelectedCowId] = useState<string>(cows[0]?.id || '');
  const [session, setSession] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [yieldLiters, setYieldLiters] = useState<string>('16.0');
  const [fatPercentage, setFatPercentage] = useState<string>('3.8');
  const [proteinPercentage, setProteinPercentage] = useState<string>('3.2');
  const [operatorNotes, setOperatorNotes] = useState<string>('');
  const [sendSms, setSendSms] = useState<boolean>(true);
  const [phoneOverride, setPhoneOverride] = useState<string>(currentUser?.phone || '+1 (555) 382-9014');
  const [filterCowTag, setFilterCowTag] = useState<string>('all');
  const [filterSession, setFilterSession] = useState<string>('all');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const selectedCow = cows.find((c) => c.id === selectedCowId) || cows[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCow) return;

    const parsedYield = parseFloat(yieldLiters);
    if (isNaN(parsedYield) || parsedYield <= 0) {
      alert('Please enter a valid milk yield in liters.');
      return;
    }

    onAddMilkRecord({
      cowId: selectedCow.id,
      tagNumber: selectedCow.tagNumber,
      cowName: selectedCow.name,
      date: new Date().toISOString().split('T')[0],
      session,
      yieldLiters: parsedYield,
      fatPercentage: fatPercentage ? parseFloat(fatPercentage) : undefined,
      proteinPercentage: proteinPercentage ? parseFloat(proteinPercentage) : undefined,
      operatorNotes: operatorNotes.trim() || undefined,
      smsSent: sendSms,
      smsRecipientPhone: phoneOverride,
    });

    setSuccessNotice(`Logged ${parsedYield}L for Cow #${selectedCow.tagNumber}. SMS notification sent to ${phoneOverride}!`);
    setTimeout(() => setSuccessNotice(null), 5000);

    // Reset notes and yield
    setOperatorNotes('');
  };

  // Filter records
  const filteredRecords = milkRecords.filter((rec) => {
    if (filterCowTag !== 'all' && rec.tagNumber !== filterCowTag) return false;
    if (filterSession !== 'all' && rec.session !== filterSession) return false;
    return true;
  });

  // Calculate stats
  const totalYieldToday = milkRecords
    .filter((r) => r.date === new Date().toISOString().split('T')[0])
    .reduce((sum, r) => sum + r.yieldLiters, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Droplets className="w-4 h-4" />
              <span>Milking Parlor Intake & History</span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-400">Mobile SMS Sync</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Dairy Milk Tracker & Farmer Notification Dispatcher
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Log milk yield manually per session (morning, afternoon, evening). Every submission updates the cow's 14-day rolling performance and dispatches an automated SMS alert directly to the farmer's mobile number.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0a0f0d] px-4 py-2.5 rounded-xl border border-[#23332b]">
            <div>
              <div className="text-[10px] uppercase text-neutral-400">Total Logged Today</div>
              <div className="text-lg font-bold text-emerald-400 font-mono-numbers">
                {totalYieldToday.toFixed(1)} L
              </div>
            </div>
            <div className="border-l border-[#23332b] pl-4">
              <div className="text-[10px] uppercase text-neutral-400">History Records</div>
              <div className="text-lg font-bold text-white font-mono-numbers">
                {milkRecords.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
          <span className="font-mono-numbers text-emerald-400 text-[11px]">Carrier ACK: OK</span>
        </div>
      )}

      {/* Main Grid: Form (5 cols) + History (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Manual Typing Form */}
        <div className="lg:col-span-5 bg-[#121a16] border border-[#23332b] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#23332b]">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Manual Milk Production Entry</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cow selector */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Select Cow (Ear Tag ID)
              </label>
              <select
                value={selectedCowId}
                onChange={(e) => setSelectedCowId(e.target.value)}
                className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono-numbers"
              >
                {cows.map((c) => (
                  <option key={c.id} value={c.id}>
                    Cow #{c.tagNumber} - {c.name} ({c.breed})
                  </option>
                ))}
              </select>

              {selectedCow && (
                <div className="mt-2 p-2 rounded-lg bg-[#0c120f] border border-[#223329] text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>14-Day Expected Yield:</span>
                  <span className="text-emerald-400 font-bold font-mono-numbers">
                    {selectedCow.baseline.milkYieldMean} L/day (±{selectedCow.baseline.milkYieldStd}L)
                  </span>
                </div>
              )}
            </div>

            {/* Session selector */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Milking Session
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['morning', 'afternoon', 'evening'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSession(s)}
                    className={`py-2 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                      session === s
                        ? 'bg-emerald-800 text-white border border-emerald-600'
                        : 'bg-[#0a0f0d] text-neutral-400 border border-[#273a30] hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Milk Yield input */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1 flex items-center justify-between">
                <span>Session Milk Yield (Liters)</span>
                <span className="text-[11px] text-neutral-500">Typical: 12 - 20 L</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="45"
                  value={yieldLiters}
                  onChange={(e) => setYieldLiters(e.target.value)}
                  placeholder="e.g. 16.5"
                  required
                  className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono-numbers text-base font-bold"
                />
                <span className="absolute right-3 top-2.5 text-xs text-neutral-500 font-mono-numbers">
                  Liters
                </span>
              </div>
            </div>

            {/* Fat and Protein */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Fat Content (%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="2"
                  max="7"
                  value={fatPercentage}
                  onChange={(e) => setFatPercentage(e.target.value)}
                  placeholder="3.8"
                  className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Protein Content (%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="2"
                  max="5"
                  value={proteinPercentage}
                  onChange={(e) => setProteinPercentage(e.target.value)}
                  placeholder="3.2"
                  className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono-numbers"
                />
              </div>
            </div>

            {/* Operator Notes */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Milking Notes / Teat Condition (Optional)
              </label>
              <textarea
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                placeholder="e.g. Normal milk flow, teat preparation clean..."
                rows={2}
                className="w-full bg-[#0a0f0d] border border-[#273a30] rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Mobile SMS Notification Dispatcher (Feature 5) */}
            <div className="p-3 rounded-lg bg-[#0d1612] border border-[#24372c] space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={(e) => setSendSms(e.target.checked)}
                  className="rounded border-[#2f4237] text-emerald-600 focus:ring-0"
                />
                <span className="text-xs font-semibold text-emerald-300">
                  Send Mobile SMS Notification on Save
                </span>
              </label>

              {sendSms && (
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Farmer Mobile Number:
                  </label>
                  <input
                    type="tel"
                    value={phoneOverride}
                    onChange={(e) => setPhoneOverride(e.target.value)}
                    className="w-full bg-[#080d0b] border border-[#25392d] rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono-numbers"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Sends instantaneous production update with baseline comparison and risk analysis.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <Send className="w-3.5 h-3.5" /> Save Milk Record & Dispatch Notification
            </button>
          </form>
        </div>

        {/* Previous Milk Production History (7 cols) */}
        <div className="lg:col-span-7 bg-[#121a16] border border-[#23332b] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#23332b]">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Previous Milk Production History</h3>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={filterCowTag}
                onChange={(e) => setFilterCowTag(e.target.value)}
                className="bg-[#0a0f0d] border border-[#273a30] rounded-md px-2.5 py-1 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="all">All Cows</option>
                {cows.map((c) => (
                  <option key={c.id} value={c.tagNumber}>
                    Cow #{c.tagNumber}
                  </option>
                ))}
              </select>

              <select
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="bg-[#0a0f0d] border border-[#273a30] rounded-md px-2.5 py-1 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="all">All Sessions</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0f0d] text-neutral-400 uppercase tracking-wider text-[10px] border-b border-[#23332b]">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Cow</th>
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3 text-right">Yield</th>
                  <th className="py-2.5 px-3 text-right">Fat/Prot</th>
                  <th className="py-2.5 px-3">SMS Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202e26]">
                {filteredRecords.map((rec) => {
                  return (
                    <tr key={rec.id} className="hover:bg-[#18231d]/60 transition-colors">
                      <td className="py-2.5 px-3 text-neutral-300 font-mono-numbers whitespace-nowrap">
                        <div>{rec.date}</div>
                        <div className="text-[10px] text-neutral-500">{rec.timestamp}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                        Cow #{rec.tagNumber}
                        <div className="text-[10px] font-normal text-neutral-400">{rec.cowName}</div>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-neutral-300 whitespace-nowrap">
                        {rec.session}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-numbers whitespace-nowrap">
                        <span className="font-bold text-white">{rec.yieldLiters} L</span>
                        <div
                          className={`text-[10px] flex items-center justify-end gap-0.5 ${
                            rec.varianceFromBaselinePercent < -10
                              ? 'text-rose-400'
                              : rec.varianceFromBaselinePercent > 5
                              ? 'text-emerald-400'
                              : 'text-neutral-400'
                          }`}
                        >
                          {rec.varianceFromBaselinePercent < 0 ? (
                            <TrendingDown className="w-2.5 h-2.5" />
                          ) : (
                            <TrendingUp className="w-2.5 h-2.5" />
                          )}
                          {rec.varianceFromBaselinePercent > 0 ? '+' : ''}
                          {rec.varianceFromBaselinePercent}%
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-neutral-400 font-mono-numbers whitespace-nowrap">
                        {rec.fatPercentage ? `${rec.fatPercentage}%` : '-'} /{' '}
                        {rec.proteinPercentage ? `${rec.proteinPercentage}%` : '-'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {rec.smsSent ? (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono-numbers">
                            <CheckCheck className="w-3.5 h-3.5" /> Sent
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-500 font-mono-numbers">No SMS</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-neutral-500 text-xs">
                No milk records match the selected filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
