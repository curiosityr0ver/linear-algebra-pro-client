'use client';

import { MatrixDimensions } from '@/lib/utils/matrix';

interface DimensionSelectorProps {
  dimensions: MatrixDimensions[];
  selectedDimensions: MatrixDimensions | null;
  onSelect: (dimensions: MatrixDimensions) => void;
}

export default function DimensionSelector({
  dimensions,
  selectedDimensions,
  onSelect,
}: DimensionSelectorProps) {
  if (dimensions.length === 0) return null;

  return (
    <div className="w-full mb-8">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
        Select Matrix Dimensions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {dimensions.map((dim, index) => (
          <button
            key={index}
            onClick={() => onSelect(dim)}
            className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
              selectedDimensions?.rows === dim.rows && selectedDimensions?.cols === dim.cols
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
            }`}
          >
            {dim.rows} × {dim.cols}
          </button>
        ))}
      </div>
    </div>
  );
}

