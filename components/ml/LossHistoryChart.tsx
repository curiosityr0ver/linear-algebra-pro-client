'use client';

import { useMemo, useId } from 'react';

interface LossHistoryChartProps {
  data: number[];
  height?: number;
  stroke?: string;
}

export default function LossHistoryChart({
  data,
  height = 160,
  stroke = '#2563eb',
}: LossHistoryChartProps) {
  const gradientId = useId();
  const chart = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = Math.max(max - min, Number.EPSILON);
    const steps = Math.max(data.length - 1, 1);

    const points = data
      .map((value, index) => {
        const x = (index / steps) * 100;
        const normalizedY = range === 0 ? 0.5 : (value - min) / range;
        const y = 100 - normalizedY * 100;
        return `${x},${y}`;
      })
      .join(' ');

    return {
      points,
      min,
      max,
      start: data[0],
      end: data[data.length - 1],
      best: Math.min(...data),
    };
  }, [data]);

  if (!chart) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        Loss history will appear here once available.
      </div>
    );
  }

  const { points, min, max, start, end, best } = chart;

  return (
    <div className="space-y-4">
      <div className="relative bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height }}
          role="img"
          aria-label="Loss history"
        >
          <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.2" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={points}
            fill="none"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={`${points} 100,100 0,100`}
        fill={`url(#${gradientId})`}
            stroke="none"
          />
        </svg>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <LossStat label="Start" value={start} />
        <LossStat label="Latest" value={end} />
        <LossStat label="Best" value={best} />
        <LossStat label="Range" value={max - min} />
      </div>
    </div>
  );
}

interface LossStatProps {
  label: string;
  value: number;
}

function LossStat({ label, value }: LossStatProps) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {Number.isFinite(value) ? value.toFixed(4) : '—'}
      </p>
    </div>
  );
}

