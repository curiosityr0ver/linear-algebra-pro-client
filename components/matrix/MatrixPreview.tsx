'use client';

import { MatrixDimensions } from '@/lib/utils/matrix';
import MatrixDisplay from './MatrixDisplay';
import SaveMatrixButton from './SaveMatrixButton';

interface MatrixPreviewProps {
  matrix: number[][];
  dimensions: MatrixDimensions;
  onSave: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function MatrixPreview({ matrix, dimensions, onSave, onMouseEnter, onMouseLeave }: MatrixPreviewProps) {
  return (
    <div 
      className="w-full mb-8 relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Save button at top */}
      <div className="mb-4 flex justify-start">
        <SaveMatrixButton
          matrix={matrix}
          dimensions={dimensions}
          onSave={onSave}
        />
      </div>
      
      {/* Matrix display */}
      <MatrixDisplay
        matrix={matrix}
        dimensions={dimensions}
      />
    </div>
  );
}

