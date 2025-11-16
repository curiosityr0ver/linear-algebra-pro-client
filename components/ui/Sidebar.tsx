'use client';

import { SavedMatrix } from '@/lib/utils/matrix';
import MatrixCard from '@/components/matrix/MatrixCard';

interface SidebarProps {
  matrices: SavedMatrix[];
  onEdit: (matrix: SavedMatrix) => void;
  onDelete: (id: string) => void;
  onDuplicate: (matrix: SavedMatrix) => void;
}

export default function Sidebar({ matrices, onEdit, onDelete, onDuplicate }: SidebarProps) {
  return (
    <aside className="w-80 h-screen fixed right-0 top-0 bg-white dark:bg-zinc-900 border-l border-zinc-300 dark:border-zinc-700 overflow-y-auto z-10">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6 text-black dark:text-zinc-50 sticky top-0 bg-white dark:bg-zinc-900 pb-4 border-b border-zinc-300 dark:border-zinc-700 z-10">
          Saved Matrices ({matrices.length})
        </h2>
        
        {matrices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              No saved matrices yet. Create and save a matrix to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matrices.map((matrix) => (
              <MatrixCard
                key={matrix.id}
                matrix={matrix}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

