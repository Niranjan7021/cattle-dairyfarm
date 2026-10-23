import React, { useState } from 'react';
import { Cow } from '../types';
import { AlertTriangle, Info, TrendingDown, Eye } from 'lucide-react';

interface BaselineChartProps {
  cow: Cow;
  onRunVideoAnalysis?: (tag: string) => void;
}

export const BaselineChart: React.FC<BaselineChartProps> = ({ cow, onRunVideoAnalysis }) => {
  const [selectedMetric, setSelectedMetric] = useState<'lead_vs_lag' | 'feed_vs_rumination' | 'all'>('lead_vs_lag');
  const history = cow.history14Days;

  // SVG Chart math
  const width = 640;
  const height = 240;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Normalized percentages (relative to cow's baseline mean = 100%)
  const ruminationPoints = history.map((d, i) => {
    const baseline = cow.baseline.ruminationTimeMean || 480;
    const pct = (d.ruminationTime / baseline) * 100;
    const x = padding.left + (i / (history.length - 1)) * chartWidth;
    // Pct range 50% to 120%
    const y = padding.top + chartHeight - ((pct - 50) / 70) * chartHeight;
    return { x, y: Math.min(height - padding.bottom, Math.max(padding.top, y)), val: d.ruminationTime, pct };
  });

  const milkPoints = history.map((d, i) => {
    const baseline = cow.baseline.milkYieldMean || 30;
    const pct = (d.milkYield / baseline) * 100;
    const x = padding.left + (i / (history.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((pct - 50) / 70) * chartHeight;
    return { x, y: Math.min(height - padding.bottom, Math.max(padding.top, y)), val: d.milkYield, pct };
  });

  const feedPoints = history.map((d, i) => {
    const baseline = cow.baseline.feedingTimeMean || 250;
    const pct = (d.feedTime / baseline) * 100;
    const x = padding.left + (i / (history.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((pct - 50) / 70) * chartHeight;
    return { x, y: Math.min(height - padding.bottom, Math.max(padding.top, y)), val: d.feedTime, pct };
  });

  const ruminationPath = ruminationPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const milkPath = milkPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const feedPath = feedPoints.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  // Early warning vertical window (days 10 to 13)
  const warnStartX = padding.left + (9 / (history.length - 1)) * chartWidth;
  const warnEndX = padding.left + chartWidth;

  return (
    <div className="bg-[#121a16] border border-[#23332b] rounded-xl p-5 text-neutral-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#23332b]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Cow #{cow.tagNumber} ({cow.name})
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-xs text-neutral-400">14-Day Rolling Baseline vs Today</span>
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Early Warning: Rumination (Lead) vs Milk (Lag)
          </h3>
        </div>

        {/* Metric tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0c120f] border border-[#23332b] rounded-lg">
          <button
            onClick={() => setSelectedMetric('lead_vs_lag')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedMetric === 'lead_vs_lag'
                ? 'bg-[#1e2e25] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Rumination vs Milk
          </button>
          <button
            onClick={() => setSelectedMetric('feed_vs_rumination')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedMetric === 'feed_vs_rumination'
                ? 'bg-[#1e2e25] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Feed & Rumination
          </button>
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              selectedMetric === 'all'
                ? 'bg-[#1e2e25] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            All 3 Metrics
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Shaded Early Warning Window */}
          <rect
            x={warnStartX}
            y={padding.top}
            width={warnEndX - warnStartX}
            height={chartHeight}
            fill="#d97706"
            fillOpacity="0.08"
            stroke="#d97706"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Early Warning Banner in Chart */}
          <text
            x={warnStartX + 10}
            y={padding.top + 18}
            fill="#fbbf24"
            fontSize="10"
            fontWeight="700"
            letterSpacing="1"
          >
            EARLY WARNING WINDOW
          </text>
          <text
            x={warnStartX + 10}
            y={padding.top + 32}
            fill="#9ca3af"
            fontSize="9"
          >
            Rumination falls while milk remains flat
          </text>

          {/* Grid lines & Y-axis labels (% of normal baseline) */}
          {[110, 100, 90, 80, 70, 60].map((pct) => {
            const y = padding.top + chartHeight - ((pct - 50) / 70) * chartHeight;
            return (
              <g key={pct}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={pct === 100 ? '#374151' : '#1f2937'}
                  strokeDasharray={pct === 100 ? undefined : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill={pct === 100 ? '#9ca3af' : '#6b7280'}
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                >
                  {pct}%
                </text>
              </g>
            );
          })}

          {/* 100% baseline indicator label */}
          <text
            x={width - padding.right}
            y={padding.top + chartHeight - ((100 - 50) / 70) * chartHeight - 4}
            textAnchor="end"
            fill="#6ee7b7"
            fontSize="9"
            fontWeight="600"
          >
            100% (Her 14-day normal)
          </text>

          {/* X Axis Date ticks */}
          {history.map((d, i) => {
            if (i % 2 !== 0 && i !== history.length - 1) return null;
            const x = padding.left + (i / (history.length - 1)) * chartWidth;
            const label = i === history.length - 1 ? 'Today' : `D-${14 - i}`;
            return (
              <text
                key={i}
                x={x}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="9"
                fontFamily="JetBrains Mono"
              >
                {label}
              </text>
            );
          })}

          {/* Feed curve */}
          {(selectedMetric === 'feed_vs_rumination' || selectedMetric === 'all') && (
            <path
              d={feedPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Rumination curve (Lead Indicator) */}
          {(selectedMetric === 'lead_vs_lag' || selectedMetric === 'feed_vs_rumination' || selectedMetric === 'all') && (
            <path
              d={ruminationPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Milk yield curve (Lagging Indicator) */}
          {(selectedMetric === 'lead_vs_lag' || selectedMetric === 'all') && (
            <path
              d={milkPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              strokeLinecap="round"
            />
          )}

          {/* Points for Rumination */}
          {ruminationPoints.map((pt, i) => (
            <circle
              key={`rum-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={i === ruminationPoints.length - 1 ? 5 : 3}
              fill="#f59e0b"
              stroke="#121a16"
              strokeWidth="1.5"
            />
          ))}

          {/* Points for Milk */}
          {(selectedMetric === 'lead_vs_lag' || selectedMetric === 'all') &&
            milkPoints.map((pt, i) => (
              <circle
                key={`milk-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={i === milkPoints.length - 1 ? 4 : 2.5}
                fill="#10b981"
                stroke="#121a16"
                strokeWidth="1"
              />
            ))}
        </svg>
      </div>

      {/* Legend & Summary strip */}
      <div className="mt-3 pt-3 border-t border-[#23332b] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-neutral-300 font-medium">Rumination Time (Lead)</span>
            <span className="text-neutral-500 font-mono-numbers">
              {cow.today.ruminationTime}m ({cow.scoring.ruminationVariancePercent}%)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block border-t border-dashed border-emerald-400"></span>
            <span className="text-neutral-300 font-medium">Milk Yield (Lag)</span>
            <span className="text-neutral-500 font-mono-numbers">
              {cow.today.milkYield}L ({cow.scoring.milkVariancePercent > 0 ? '+' : ''}{cow.scoring.milkVariancePercent}%)
            </span>
          </div>

          {(selectedMetric === 'feed_vs_rumination' || selectedMetric === 'all') && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-400 inline-block"></span>
              <span className="text-neutral-300 font-medium">Feed Intake Time</span>
              <span className="text-neutral-500 font-mono-numbers">
                {cow.today.feedingTime}m ({cow.scoring.feedVariancePercent}%)
              </span>
            </div>
          )}
        </div>

        {onRunVideoAnalysis && (
          <button
            onClick={() => onRunVideoAnalysis(cow.tagNumber)}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1 rounded bg-[#1b2b23] border border-[#2d483b] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> Launch AI Video Tracker
          </button>
        )}
      </div>

      {/* Slide takeaway callout */}
      <div className="mt-3 p-3 bg-[#18231e] rounded-lg border border-[#2b3d33] flex items-start gap-2.5 text-xs text-neutral-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-neutral-100">ONSPOT Veterinary Principle: </span>
          Notice that milk yield has NOT dropped significantly yet (<span className="text-emerald-400 font-mono-numbers">{cow.today.milkYield}L vs {cow.baseline.milkYieldMean}L</span>), but rumination time dropped by <span className="text-amber-400 font-mono-numbers font-semibold">{Math.abs(cow.scoring.ruminationVariancePercent)}%</span>. This provides a 48–72 hour early warning window to inspect the cow before acute clinical sickness drops the milk yield permanently.
        </div>
      </div>
    </div>
  );
};
