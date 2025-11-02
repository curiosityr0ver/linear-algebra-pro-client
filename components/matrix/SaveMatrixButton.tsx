'use client';

import { MatrixDimensions } from '@/lib/utils/matrix';

interface SaveMatrixButtonProps {
  matrix: number[][];
  dimensions: MatrixDimensions;
  onSave: () => void;
}

export default function SaveMatrixButton({ matrix, dimensions, onSave }: SaveMatrixButtonProps) {
  return (
    <button
      onClick={onSave}
      className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
    >
      Save Matrix
    </button>
  );
}

