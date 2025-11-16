'use client';

import { useState, useMemo } from 'react';
import { parseMatrixInput, calculatePossibleDimensions, reshapeToMatrix, MatrixDimensions, SavedMatrix } from '@/lib/utils/matrix';
import { useMatrixStorage } from '@/lib/hooks/useMatrixStorage';
import Header from '@/components/ui/Header';
import Navigation from '@/components/ui/Navigation';
import MatrixInput from '@/components/matrix/MatrixInput';
import DimensionSelector from '@/components/matrix/DimensionSelector';
import MatrixDisplay from '@/components/matrix/MatrixDisplay';
import Sidebar from '@/components/ui/Sidebar';
import EditMatrixModal from '@/components/matrix/EditMatrixModal';
import EmptyState from '@/components/ui/EmptyState';
import OperationsPane from '@/components/operations/OperationsPane';

export default function HomePage() {
  const [input, setInput] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState<MatrixDimensions | null>(null);
  const [editingMatrix, setEditingMatrix] = useState<SavedMatrix | null>(null);
  const [autoSavedMatrixId, setAutoSavedMatrixId] = useState<string | null>(null);
  const [pendingNewMatrix, setPendingNewMatrix] = useState(false);

  // Matrix storage hook
  const { savedMatrices, saveMatrix, updateMatrix, deleteMatrix, generateNextMatrixName } = useMatrixStorage();

  // Create reverse-chronological view of saved matrices for display
  const sortedMatrices = useMemo(() => {
    const getTimestamp = (matrix: SavedMatrix) =>
      new Date(matrix.updatedAt || matrix.createdAt).getTime();

    return [...savedMatrices].sort((a, b) => getTimestamp(b) - getTimestamp(a));
  }, [savedMatrices]);

  // Parse input and validate
  const parsedValues = useMemo(() => {
    return parseMatrixInput(input);
  }, [input]);

  // Calculate possible dimensions
  const possibleDimensions = useMemo(() => {
    if (!parsedValues || parsedValues.length === 0) return [];
    return calculatePossibleDimensions(parsedValues.length);
  }, [parsedValues]);

  // Create matrix when dimensions are selected
  const matrix = useMemo(() => {
    if (!parsedValues || !selectedDimensions) return null;
    return reshapeToMatrix(parsedValues, selectedDimensions.rows, selectedDimensions.cols);
  }, [parsedValues, selectedDimensions]);

  const autoSavedMatrix = useMemo(() => {
    if (!autoSavedMatrixId) return null;
    return savedMatrices.find((m) => m.id === autoSavedMatrixId) ?? null;
  }, [savedMatrices, autoSavedMatrixId]);

  const isValidInput = parsedValues !== null && parsedValues.length > 0;
  const hasError = input.trim() !== '' && !isValidInput;

  const handleInputChange = (value: string) => {
    setInput(value);

    if (value.trim() === '') {
      setAutoSavedMatrixId(null);
      setPendingNewMatrix(false);
    } else {
      setPendingNewMatrix(true);
    }
  };

  const handleResetSelection = () => {
    setSelectedDimensions(null);
  };

  const handleDimensionSelect = (dimensions: MatrixDimensions) => {
    setSelectedDimensions(dimensions);

    if (!parsedValues || parsedValues.length === 0) {
      return;
    }

    const reshapedMatrix = reshapeToMatrix(parsedValues, dimensions.rows, dimensions.cols);

    if (!reshapedMatrix) {
      return;
    }

    const shouldCreateNew =
      pendingNewMatrix || !autoSavedMatrixId || !autoSavedMatrix;

    if (shouldCreateNew) {
      const name = generateNextMatrixName();
      const saved = saveMatrix(name, reshapedMatrix, dimensions);
      setAutoSavedMatrixId(saved.id);
      setPendingNewMatrix(false);
    } else {
      updateMatrix(autoSavedMatrixId, {
        matrix: reshapedMatrix,
        dimensions,
      });
    }
  };

  const handleEditMatrix = (matrixToEdit: SavedMatrix) => {
    setEditingMatrix(matrixToEdit);
  };

  const handleUpdateMatrix = (
    id: string,
    name: string,
    updatedMatrix: number[][],
    dimensions: MatrixDimensions
  ) => {
    updateMatrix(id, {
      name,
      matrix: updatedMatrix,
      dimensions,
    });
    setEditingMatrix(null);
  };

  const handleDeleteMatrix = (id: string) => {
    deleteMatrix(id);
  };

  const handleSaveOperationResult = (result: number[][], dimensions: MatrixDimensions) => {
    const name = generateNextMatrixName();
    saveMatrix(name, result, dimensions);
  };

  const handleDuplicateCurrentMatrix = () => {
    if (!autoSavedMatrix) return;

    const clonedMatrix = autoSavedMatrix.matrix.map((row) => [...row]);
    const duplicated = saveMatrix(
      generateNextMatrixName(),
      clonedMatrix,
      autoSavedMatrix.dimensions
    );
    setAutoSavedMatrixId(duplicated.id);
    setPendingNewMatrix(false);
  };

  const handleDuplicateMatrix = (matrixToDuplicate: SavedMatrix) => {
    const clonedMatrix = matrixToDuplicate.matrix.map((row) => [...row]);
    const duplicated = saveMatrix(
      generateNextMatrixName(),
      clonedMatrix,
      matrixToDuplicate.dimensions
    );

    if (autoSavedMatrixId === matrixToDuplicate.id) {
      setAutoSavedMatrixId(duplicated.id);
      setPendingNewMatrix(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-1 overflow-hidden">
        {/* Main content area - adjusts for sidebar */}
        <main className="flex-1 flex flex-col items-center bg-white dark:bg-black mr-80 overflow-y-auto">
          {/* Header and Operations Pane side by side */}
          <div className="w-full max-w-6xl px-8 sm:px-16 py-8">
            <Navigation />
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center mb-6">
              <div className="flex-1">
                <Header 
                  title="Linear Algebra Pro"
                  subtitle="Input matrix values as comma-separated numbers"
                />
              </div>
              <div className="flex-1 lg:max-w-md">
                <OperationsPane
                  savedMatrices={sortedMatrices}
                  onSaveResult={handleSaveOperationResult}
                />
              </div>
            </div>
          </div>

          <div className="w-full max-w-6xl px-8 sm:px-16 pb-16">
            <MatrixInput
            value={input}
            onChange={handleInputChange}
            onReset={handleResetSelection}
            error={hasError}
            isValid={isValidInput}
            valueCount={parsedValues?.length || 0}
          />

          {isValidInput && possibleDimensions.length > 0 && (
            <DimensionSelector
              dimensions={possibleDimensions}
              selectedDimensions={selectedDimensions}
              onSelect={handleDimensionSelect}
            />
          )}

          {matrix && selectedDimensions && (
            <div className="w-full mb-8">
              <MatrixDisplay
                matrix={matrix}
                dimensions={selectedDimensions}
              />
              {autoSavedMatrix && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Automatically saved as{' '}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {autoSavedMatrix.name}
                    </span>
                  </p>
                  <button
                    onClick={handleDuplicateCurrentMatrix}
                    className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-sm font-medium text-zinc-700 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Duplicate Matrix
                  </button>
                </div>
              )}
            </div>
          )}

          {!isValidInput && input.trim() === '' && (
            <EmptyState message="Enter comma-separated values to get started" />
          )}
          </div>
        </main>

        {/* Right sidebar for saved matrices - always visible */}
        <Sidebar
          matrices={sortedMatrices}
          onEdit={handleEditMatrix}
          onDelete={handleDeleteMatrix}
          onDuplicate={handleDuplicateMatrix}
        />
      </div>

      {/* Edit Matrix Modal */}
      {editingMatrix && (
        <EditMatrixModal
          matrix={editingMatrix}
          onSave={handleUpdateMatrix}
          onCancel={() => setEditingMatrix(null)}
        />
      )}
    </div>
  );
}
