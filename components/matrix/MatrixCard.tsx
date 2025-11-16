'use client';

import { SavedMatrix } from '@/lib/utils/matrix';
import { useState } from 'react';

interface MatrixCardProps {
  matrix: SavedMatrix;
  onEdit: (matrix: SavedMatrix) => void;
  onDelete: (id: string) => void;
  onDuplicate: (matrix: SavedMatrix) => void;
}

export default function MatrixCard({ matrix, onEdit, onDelete, onDuplicate }: MatrixCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete(matrix.id);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  return (
    <div className="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-white dark:bg-zinc-900 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-1">
          {matrix.name}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {matrix.dimensions.rows} × {matrix.dimensions.cols}
        </p>
      </div>

      {/* Matrix Preview */}
      <div className="mb-4 overflow-x-auto">
        <div className="inline-block border border-zinc-300 dark:border-zinc-700 rounded p-2 bg-zinc-50 dark:bg-zinc-800">
          <div className="flex flex-col gap-1">
            {matrix.matrix.slice(0, 3).map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.slice(0, 4).map((value, colIndex) => (
                  <div
                    key={colIndex}
                    className="w-10 h-8 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 font-mono text-xs"
                  >
                    {value}
                  </div>
                ))}
                {row.length > 4 && (
                  <div className="w-10 h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                    ...
                  </div>
                )}
              </div>
            ))}
            {matrix.matrix.length > 3 && (
              <div className="flex gap-1">
                {Array.from({ length: Math.min(4, matrix.matrix[0]?.length || 0) }).map((_, i) => (
                  <div key={i} className="w-10 h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                    ...
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onDuplicate(matrix)}
          className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
        >
          Duplicate
        </button>
        <button
          onClick={() => onEdit(matrix)}
          className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors text-sm font-medium"
        >
          Edit
        </button>
        {showConfirmDelete ? (
          <div className="flex-1 flex gap-2">
            <button
              onClick={handleCancelDelete}
              className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              Confirm
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="flex-1 px-3 py-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

