'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { SavedMatrix, parseMatrixInput, calculatePossibleDimensions, reshapeToMatrix } from '@/lib/utils/matrix';
import MatrixInput from './MatrixInput';
import DimensionSelector from './DimensionSelector';
import MatrixDisplay from './MatrixDisplay';

interface EditMatrixModalProps {
  matrix: SavedMatrix;
  onSave: (id: string, name: string, matrix: number[][], dimensions: SavedMatrix['dimensions']) => void;
  onCancel: () => void;
}

export default function EditMatrixModal({ matrix, onSave, onCancel }: EditMatrixModalProps) {
  const [name, setName] = useState(matrix.name);
  const [input, setInput] = useState(matrix.matrix.flat().join(', '));
  const [selectedDimensions, setSelectedDimensions] = useState<SavedMatrix['dimensions']>(matrix.dimensions);

  const originalMatrixLength = useMemo(() => matrix.matrix.flat().length, [matrix]);
  const prevInputLengthRef = useRef<number>(matrix.matrix.flat().length);

  // Parse input and validate
  const parsedValues = useMemo(() => parseMatrixInput(input), [input]);
  const isValidInput = parsedValues !== null && parsedValues.length > 0;
  const hasError = input.trim() !== '' && !isValidInput;

  // Calculate possible dimensions
  const possibleDimensions = useMemo(() => {
    if (!parsedValues || parsedValues.length === 0) return [];
    return calculatePossibleDimensions(parsedValues.length);
  }, [parsedValues]);

  // Create matrix when dimensions are selected
  const editedMatrix = useMemo(() => {
    if (!parsedValues || !selectedDimensions) return null;
    return reshapeToMatrix(parsedValues, selectedDimensions.rows, selectedDimensions.cols);
  }, [parsedValues, selectedDimensions]);

  // Auto-select dimensions only when input length actually changes (not when user manually selects dimensions)
  useEffect(() => {
    const currentLength = parsedValues?.length ?? 0;
    const prevLength = prevInputLengthRef.current;
    
    // Only auto-select if input length changed AND matches original
    if (currentLength !== prevLength && currentLength === originalMatrixLength && parsedValues) {
      const matchingDim = possibleDimensions.find(
        (dim) => dim.rows === matrix.dimensions.rows && dim.cols === matrix.dimensions.cols
      );
      if (matchingDim) {
        setSelectedDimensions(matchingDim);
      }
    }
    
    prevInputLengthRef.current = currentLength;
  }, [parsedValues?.length, possibleDimensions, matrix.dimensions, originalMatrixLength]); // Only depend on input length, not selectedDimensions

  const handleSave = () => {
    if (editedMatrix && selectedDimensions) {
      onSave(matrix.id, name.trim() || matrix.name, editedMatrix, selectedDimensions);
    }
  };

  const canSave = editedMatrix !== null && selectedDimensions !== null && !hasError;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-4xl w-full border border-zinc-300 dark:border-zinc-700 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-semibold mb-6 text-black dark:text-zinc-50">
          Edit Matrix
        </h3>

        {/* Name Input */}
        <div className="mb-6">
          <label htmlFor="edit-name" className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
            Matrix Name
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Matrix Input */}
        <MatrixInput
          value={input}
          onChange={setInput}
          error={hasError}
          isValid={isValidInput}
          valueCount={parsedValues?.length || 0}
        />

        {/* Dimension Selector */}
        {isValidInput && possibleDimensions.length > 0 && (
          <div className="mb-6">
            <DimensionSelector
              dimensions={possibleDimensions}
              selectedDimensions={selectedDimensions}
              onSelect={setSelectedDimensions}
            />
          </div>
        )}

        {/* Matrix Display */}
        {editedMatrix && selectedDimensions && (
          <div className="mb-6">
            <MatrixDisplay
              matrix={editedMatrix}
              dimensions={selectedDimensions}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              canSave
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

