'use client';

import { MatrixDimensions } from '@/lib/utils/matrix';

interface MatrixDisplayProps {
  matrix: number[][];
  dimensions: MatrixDimensions;
}

export default function MatrixDisplay({ matrix, dimensions }: MatrixDisplayProps) {
  return (
    <div className="w-full mb-8">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
        Matrix ({dimensions.rows} × {dimensions.cols})
      </h2>
      <div className="inline-block border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex flex-col gap-1">
          {matrix.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((value, colIndex) => (
                <div
                  key={colIndex}
                  className="w-16 h-12 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 font-mono text-sm font-medium"
                >
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

