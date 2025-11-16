'use client';

import { SavedMatrix } from '@/lib/utils/matrix';
import MatrixCard from '@/components/matrix/MatrixCard';

interface SidebarProps {
  matrices: SavedMatrix[];
  onEdit: (matrix: SavedMatrix) => void;
  onDelete: (id: string) => void;
  onDuplicate: (matrix: SavedMatrix) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ matrices, onEdit, onDelete, onDuplicate, isOpen, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed right-0 top-0 z-20 h-screen w-80 border-l border-zinc-300 bg-white shadow-lg transition-transform duration-300 ease-out dark:border-zinc-700 dark:bg-zinc-900 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      aria-hidden={!isOpen}
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-white/95 px-6 pb-4 pt-6 backdrop-blur dark:bg-zinc-900/95 dark:text-zinc-50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Saved Matrices</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{matrices.length} total</p>
            </div>
            <button
              type="button"
              onClick={onToggle}
              aria-label="Hide saved matrices panel"
              className="inline-flex items-center rounded-full border border-zinc-300 px-3 py-1 text-sm font-medium text-zinc-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-blue-500 dark:hover:text-blue-300"
            >
              Hide
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {matrices.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
      </div>
    </aside>
  );
}

