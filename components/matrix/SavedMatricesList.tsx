'use client';

import { SavedMatrix } from '@/lib/utils/matrix';
import MatrixCard from './MatrixCard';

interface SavedMatricesListProps {
  matrices: SavedMatrix[];
  onEdit: (matrix: SavedMatrix) => void;
  onDelete: (id: string) => void;
}

export default function SavedMatricesList({ matrices, onEdit, onDelete }: SavedMatricesListProps) {
  if (matrices.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">
          No saved matrices yet. Create and save a matrix to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-black dark:text-zinc-50">
        Saved Matrices ({matrices.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matrices.map((matrix) => (
          <MatrixCard
            key={matrix.id}
            matrix={matrix}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

