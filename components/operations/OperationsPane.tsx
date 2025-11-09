'use client';

import { useState } from 'react';
import { SavedMatrix, MatrixDimensions } from '@/lib/utils/matrix';
import { 
  addMatrices, 
  multiplyMatrices, 
  subtractMatrices,
  transposeMatrix,
  calculateDeterminant,
  MatrixOperationResponse 
} from '@/lib/utils/api';
import MatrixDisplay from '@/components/matrix/MatrixDisplay';

interface OperationsPaneProps {
  savedMatrices: SavedMatrix[];
  onSaveResult?: (result: number[][], dimensions: MatrixDimensions) => void;
}

type OperationType = 'add' | 'multiply' | 'subtract' | 'transpose' | 'determinant' | 'inverse' | null;

export default function OperationsPane({ savedMatrices, onSaveResult }: OperationsPaneProps) {
  const [selectedOperation, setSelectedOperation] = useState<OperationType>(null);
  const [matrixAId, setMatrixAId] = useState<string>('');
  const [matrixBId, setMatrixBId] = useState<string>('');
  const [result, setResult] = useState<number[][] | null>(null);
  const [resultDimensions, setResultDimensions] = useState<MatrixDimensions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scalarResult, setScalarResult] = useState<number | null>(null);
  const [scalarResultLabel, setScalarResultLabel] = useState<string>('');

  const selectedMatrixA = savedMatrices.find(m => m.id === matrixAId);
  const selectedMatrixB = savedMatrices.find(m => m.id === matrixBId);

  const operations = [
    { id: 'add', label: 'Add (A + B)', needsTwo: true },
    { id: 'multiply', label: 'Multiply (A × B)', needsTwo: true },
    { id: 'subtract', label: 'Subtract (A - B)', needsTwo: true },
    { id: 'transpose', label: 'Transpose', needsTwo: false },
    { id: 'determinant', label: 'Determinant', needsTwo: false },
    { id: 'inverse', label: 'Inverse', needsTwo: false, disabled: true },
  ];

  const handleOperationSelect = (operation: OperationType) => {
    setSelectedOperation(operation);
    setResult(null);
    setResultDimensions(null);
    setError(null);
    setScalarResult(null);
    setScalarResultLabel('');
    
    // Reset selections when switching operations
    if (operation === null) {
      setMatrixAId('');
      setMatrixBId('');
    }
  };

  const handleExecute = async () => {
    if (!selectedOperation || !selectedMatrixA) return;
    
    // For operations that need two matrices
    if ((selectedOperation === 'add' || selectedOperation === 'multiply' || selectedOperation === 'subtract') && !selectedMatrixB) {
      setError('Please select both matrices');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      let response: MatrixOperationResponse | { determinant: number } | null = null;

      if (selectedOperation === 'add') {
        if (!selectedMatrixB) {
          setError('Please select both matrices');
          setIsLoading(false);
          return;
        }
        response = await addMatrices(selectedMatrixA.matrix, selectedMatrixB.matrix);
      } else if (selectedOperation === 'multiply') {
        if (!selectedMatrixB) {
          setError('Please select both matrices');
          setIsLoading(false);
          return;
        }
        response = await multiplyMatrices(selectedMatrixA.matrix, selectedMatrixB.matrix);
      } else if (selectedOperation === 'subtract') {
        if (!selectedMatrixB) {
          setError('Please select both matrices');
          setIsLoading(false);
          return;
        }
        response = await subtractMatrices(selectedMatrixA.matrix, selectedMatrixB.matrix);
      } else if (selectedOperation === 'transpose') {
        response = await transposeMatrix(selectedMatrixA.matrix);
      } else if (selectedOperation === 'determinant') {
        const detResponse = await calculateDeterminant(selectedMatrixA.matrix);
        setResult(null);
        setResultDimensions(null);
        setScalarResult(detResponse.determinant);
        setScalarResultLabel('Determinant');
        setError(null);
        setIsLoading(false);
        return;
      }

      if (response && 'result' in response) {
        setResult(response.result.data);
        setResultDimensions({
          rows: response.result.rows,
          cols: response.result.cols,
        });
        setScalarResult(null);
        setScalarResultLabel('');
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = () => {
    if (result && resultDimensions && onSaveResult) {
      onSaveResult(result, resultDimensions);
      // Reset after saving
      setResult(null);
      setResultDimensions(null);
      setSelectedOperation(null);
      setMatrixAId('');
      setMatrixBId('');
    }
  };

  const canExecute = selectedOperation && selectedMatrixA && 
    ((selectedOperation === 'add' || selectedOperation === 'multiply' || selectedOperation === 'subtract') 
      ? selectedMatrixB 
      : (selectedOperation === 'transpose' || selectedOperation === 'determinant'));

  return (
    <div className="w-full border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3 text-black dark:text-zinc-50">
          Operations
        </h2>

        {/* Operation Buttons */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            onClick={() => handleOperationSelect(null)}
            className={`px-3 py-1.5 rounded-lg border-2 transition-colors text-xs font-medium ${
              selectedOperation === null
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            Clear
          </button>
          {operations.map((op) => (
            <button
              key={op.id}
              onClick={() => !op.disabled && handleOperationSelect(op.id as OperationType)}
              disabled={op.disabled}
              className={`px-3 py-1.5 rounded-lg border-2 transition-colors text-xs font-medium ${
                op.disabled
                  ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                  : selectedOperation === op.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
                  : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        {/* Matrix Selection */}
        {selectedOperation && (
          <div className="mb-3 space-y-2">
            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-xs font-medium mb-1 text-black dark:text-zinc-50">
                  Matrix A
                </label>
                <select
                  value={matrixAId}
                  onChange={(e) => setMatrixAId(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                >
                  <option value="">Choose...</option>
                  {savedMatrices.map((matrix) => (
                    <option key={matrix.id} value={matrix.id}>
                      {matrix.name} ({matrix.dimensions.rows}×{matrix.dimensions.cols})
                    </option>
                  ))}
                </select>
              </div>

              {(selectedOperation === 'add' || selectedOperation === 'multiply' || selectedOperation === 'subtract') && (
                <div>
                  <label className="block text-xs font-medium mb-1 text-black dark:text-zinc-50">
                    Matrix B
                  </label>
                  <select
                    value={matrixBId}
                    onChange={(e) => setMatrixBId(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                  >
                    <option value="">Choose...</option>
                    {savedMatrices.map((matrix) => (
                      <option key={matrix.id} value={matrix.id}>
                        {matrix.name} ({matrix.dimensions.rows}×{matrix.dimensions.cols})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleExecute}
                  disabled={!canExecute || isLoading}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Execute'}
                </button>
                {result && resultDimensions && (
                  <button
                    onClick={handleSaveResult}
                    className="px-3 py-1.5 rounded-lg border-2 border-green-600 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 text-green-700 dark:text-green-400 text-xs font-medium transition-colors"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>

            {/* Selected Matrices Preview */}
            {(selectedMatrixA || selectedMatrixB) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMatrixA && (
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    A: {selectedMatrixA.name} ({selectedMatrixA.dimensions.rows}×{selectedMatrixA.dimensions.cols})
                  </div>
                )}
                {selectedMatrixB && (
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    B: {selectedMatrixB.name} ({selectedMatrixB.dimensions.rows}×{selectedMatrixB.dimensions.cols})
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-700">
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Scalar Result Display (e.g., Determinant) */}
        {scalarResult !== null && (
          <div className="mt-3 p-3 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <h3 className="text-sm font-semibold mb-2 text-black dark:text-zinc-50">
              {scalarResultLabel}
            </h3>
            <div className="text-lg font-mono font-bold text-blue-700 dark:text-blue-400">
              {scalarResult}
            </div>
          </div>
        )}

        {/* Result Display - Show below the pane */}
        {result && resultDimensions && (
          <div className="mt-3 p-3 border-2 border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-950/20">
            <h3 className="text-sm font-semibold mb-2 text-black dark:text-zinc-50">
              Result ({resultDimensions.rows} × {resultDimensions.cols})
            </h3>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {result.map((row, i) => (
                <div key={i} className="flex gap-1 mb-1">
                  {row.map((val, j) => (
                    <span key={j} className="font-mono">{val}</span>
                  ))}
                </div>
              )).slice(0, 3)}
              {result.length > 3 && <div className="text-xs">...</div>}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedOperation && (
          <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
            <p className="text-xs">Select an operation</p>
          </div>
        )}
      </div>
    </div>
  );
}

