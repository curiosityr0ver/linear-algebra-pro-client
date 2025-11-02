'use client';

import { useState, useMemo } from 'react';
import { parseMatrixInput, calculatePossibleDimensions, reshapeToMatrix, MatrixDimensions, SavedMatrix } from '@/lib/utils/matrix';
import { useMatrixStorage } from '@/lib/hooks/useMatrixStorage';
import Header from '@/components/ui/Header';
import MatrixInput from '@/components/matrix/MatrixInput';
import DimensionSelector from '@/components/matrix/DimensionSelector';
import MatrixDisplay from '@/components/matrix/MatrixDisplay';
import SaveMatrixButton from '@/components/matrix/SaveMatrixButton';
import Sidebar from '@/components/ui/Sidebar';
import EditMatrixModal from '@/components/matrix/EditMatrixModal';
import EmptyState from '@/components/ui/EmptyState';
import OperationsPane from '@/components/operations/OperationsPane';

export default function HomePage() {
  const [input, setInput] = useState('');
  const [selectedDimensions, setSelectedDimensions] = useState<MatrixDimensions | null>(null);
  const [editingMatrix, setEditingMatrix] = useState<SavedMatrix | null>(null);

  // Matrix storage hook
  const { savedMatrices, saveMatrix, updateMatrix, deleteMatrix, generateNextMatrixName } = useMatrixStorage();

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

  const isValidInput = parsedValues !== null && parsedValues.length > 0;
  const hasError = input.trim() !== '' && !isValidInput;

  const handleResetSelection = () => {
    setSelectedDimensions(null);
  };

  const handleSaveMatrix = () => {
    if (matrix && selectedDimensions) {
      const name = generateNextMatrixName();
      saveMatrix(name, matrix, selectedDimensions);
      // Optionally reset after saving
      // setInput('');
      // setSelectedDimensions(null);
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

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-1 overflow-hidden">
        {/* Main content area - adjusts for sidebar */}
        <main className="flex-1 flex flex-col items-center bg-white dark:bg-black mr-80 overflow-y-auto">
          {/* Header and Operations Pane side by side */}
          <div className="w-full max-w-6xl px-8 sm:px-16 py-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center mb-6">
              <div className="flex-1">
                <Header 
                  title="Linear Algebra Pro"
                  subtitle="Input matrix values as comma-separated numbers"
                />
              </div>
              <div className="flex-1 lg:max-w-md">
                <OperationsPane
                  savedMatrices={savedMatrices}
                  onSaveResult={handleSaveOperationResult}
                />
              </div>
            </div>
          </div>

          <div className="w-full max-w-6xl px-8 sm:px-16 pb-16">
            <MatrixInput
            value={input}
            onChange={setInput}
            onReset={handleResetSelection}
            error={hasError}
            isValid={isValidInput}
            valueCount={parsedValues?.length || 0}
          />

          {isValidInput && possibleDimensions.length > 0 && (
            <DimensionSelector
              dimensions={possibleDimensions}
              selectedDimensions={selectedDimensions}
              onSelect={setSelectedDimensions}
            />
          )}

          {matrix && selectedDimensions && (
            <div className="w-full mb-8">
              <MatrixDisplay
                matrix={matrix}
                dimensions={selectedDimensions}
              />
              <div className="mt-4 flex justify-start">
                <SaveMatrixButton
                  matrix={matrix}
                  dimensions={selectedDimensions}
                  onSave={handleSaveMatrix}
                />
              </div>
            </div>
          )}

          {!isValidInput && input.trim() === '' && (
            <EmptyState message="Enter comma-separated values to get started" />
          )}
          </div>
        </main>

        {/* Right sidebar for saved matrices - always visible */}
        <Sidebar
          matrices={savedMatrices}
          onEdit={handleEditMatrix}
          onDelete={handleDeleteMatrix}
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
