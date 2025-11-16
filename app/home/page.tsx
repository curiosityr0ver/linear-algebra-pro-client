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
import AdvancedOperationsPane from '@/components/operations/AdvancedOperationsPane';

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
        <main className="flex-1 flex flex-col items-center bg-white dark:bg-black mr-80 overflow-y-auto">
          <div className="w-full max-w-7xl px-6 sm:px-12 py-8 space-y-6">
            <Navigation />
            <Header
              size="md"
              title="Linear Algebra Pro"
              subtitle="Build matrices, run core operations, and explore advanced algorithms."
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-6">
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
                    <div className="space-y-3">
                      <MatrixDisplay matrix={matrix} dimensions={selectedDimensions} />
                      {autoSavedMatrix && (
                        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2">
                          <p className="text-sm text-zinc-600 dark:text-zinc-300">
                            Draft saved as{' '}
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {autoSavedMatrix.name}
                            </span>
                          </p>
                          <button
                            onClick={handleDuplicateCurrentMatrix}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            Duplicate
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {!matrix && (!isValidInput || input.trim() === '') && (
                    <EmptyState message="Enter comma-separated values to get started" />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <OperationsPane savedMatrices={sortedMatrices} onSaveResult={handleSaveOperationResult} />
                <AdvancedOperationsPane savedMatrices={sortedMatrices} onSaveResult={handleSaveOperationResult} />
              </div>
            </div>
          </div>
        </main>

        <Sidebar
          matrices={sortedMatrices}
          onEdit={handleEditMatrix}
          onDelete={handleDeleteMatrix}
          onDuplicate={handleDuplicateMatrix}
        />
      </div>

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
