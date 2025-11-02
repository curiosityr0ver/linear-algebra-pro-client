'use client';

import { useState } from 'react';
import { SavedMatrix, MatrixDimensions } from '@/lib/utils/matrix';
import { addMatrices, multiplyMatrices, MatrixOperationResponse } from '@/lib/utils/api';
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

  const selectedMatrixA = savedMatrices.find(m => m.id === matrixAId);
  const selectedMatrixB = savedMatrices.find(m => m.id === matrixBId);

  const operations = [
    { id: 'add', label: 'Add (A + B)', needsTwo: true },
    { id: 'multiply', label: 'Multiply (A × B)', needsTwo: true },
    { id: 'subtract', label: 'Subtract (A - B)', needsTwo: true, disabled: true },
    { id: 'transpose', label: 'Transpose', needsTwo: false, disabled: true },
    { id: 'determinant', label: 'Determinant', needsTwo: false, disabled: true },
    { id: 'inverse', label: 'Inverse', needsTwo: false, disabled: true },
  ];

  const handleOperationSelect = (operation: OperationType) => {
    setSelectedOperation(operation);
    setResult(null);
    setResultDimensions(null);
    setError(null);
    
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
      let response: MatrixOperationResponse | null = null;

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
      }

      if (response) {
        if (response.success) {
          setResult(response.result);
          setResultDimensions({
            rows: response.dimensions.rows,
            cols: response.dimensions.columns,
          });
          setError(null);
        } else {
          setError(response.error || 'Operation failed');
          setResult(null);
        }
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
      ? selectedMatrixB : true);

  return (
    <div className="w-full border-t-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 mr-80">
      <div className="p-6 max-w-6xl mx-auto px-8 sm:px-16">
        <h2 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
          Matrix Operations
        </h2>

        {/* Operation Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleOperationSelect(null)}
            className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
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
              className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
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
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
                  Select Matrix A
                </label>
                <select
                  value={matrixAId}
                  onChange={(e) => setMatrixAId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                >
                  <option value="">Choose matrix...</option>
                  {savedMatrices.map((matrix) => (
                    <option key={matrix.id} value={matrix.id}>
                      {matrix.name} ({matrix.dimensions.rows}×{matrix.dimensions.cols})
                    </option>
                  ))}
                </select>
              </div>

              {(selectedOperation === 'add' || selectedOperation === 'multiply' || selectedOperation === 'subtract') && (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
                    Select Matrix B
                  </label>
                  <select
                    value={matrixBId}
                    onChange={(e) => setMatrixBId(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                  >
                    <option value="">Choose matrix...</option>
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
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Execute'}
                </button>
                {result && resultDimensions && (
                  <button
                    onClick={handleSaveResult}
                    className="px-6 py-2 rounded-lg border-2 border-green-600 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30 text-green-700 dark:text-green-400 font-medium transition-colors"
                  >
                    Save Result
                  </button>
                )}
              </div>
            </div>

            {/* Selected Matrices Preview */}
            {(selectedMatrixA || selectedMatrixB) && (
              <div className="flex flex-wrap gap-4 mt-4">
                {selectedMatrixA && (
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-medium mb-2 text-black dark:text-zinc-50">Matrix A</p>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {selectedMatrixA.name} ({selectedMatrixA.dimensions.rows}×{selectedMatrixA.dimensions.cols})
                    </div>
                  </div>
                )}
                {selectedMatrixB && (
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-medium mb-2 text-black dark:text-zinc-50">Matrix B</p>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      {selectedMatrixB.name} ({selectedMatrixB.dimensions.rows}×{selectedMatrixB.dimensions.cols})
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && resultDimensions && (
          <div className="mt-6 p-4 border-2 border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-950/20">
            <h3 className="text-lg font-semibold mb-4 text-black dark:text-zinc-50">
              Result ({resultDimensions.rows} × {resultDimensions.cols})
            </h3>
            <MatrixDisplay matrix={result} dimensions={resultDimensions} />
          </div>
        )}

        {/* Empty State */}
        {!selectedOperation && (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            <p>Select an operation to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}

