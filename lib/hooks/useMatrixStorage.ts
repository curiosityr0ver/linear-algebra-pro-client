'use client';

import { useState, useEffect } from 'react';
import { SavedMatrix, loadSavedMatrices, saveMatricesToStorage, generateMatrixId } from '@/lib/utils/matrix';

export function useMatrixStorage() {
  const [savedMatrices, setSavedMatrices] = useState<SavedMatrix[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load matrices from localStorage on mount
  useEffect(() => {
    const loaded = loadSavedMatrices();
    setSavedMatrices(loaded);
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever savedMatrices changes
  useEffect(() => {
    if (isLoaded) {
      saveMatricesToStorage(savedMatrices);
    }
  }, [savedMatrices, isLoaded]);

  const saveMatrix = (name: string, matrix: number[][], dimensions: SavedMatrix['dimensions']): SavedMatrix => {
    const newMatrix: SavedMatrix = {
      id: generateMatrixId(),
      name: name.trim() || `Matrix ${savedMatrices.length + 1}`,
      matrix,
      dimensions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedMatrices((prev) => [...prev, newMatrix]);
    return newMatrix;
  };

  // Generate next available letter name (A, B, C, ..., Z, AA, AB, ...)
  const generateNextMatrixName = (): string => {
    const existingNames = savedMatrices.map(m => m.name.toUpperCase());
    
    // Try single letters A-Z
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i); // A = 65
      if (!existingNames.includes(letter)) {
        return letter;
      }
    }
    
    // Try double letters AA-ZZ
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < 26; j++) {
        const letter = String.fromCharCode(65 + i) + String.fromCharCode(65 + j);
        if (!existingNames.includes(letter)) {
          return letter;
        }
      }
    }
    
    // Fallback if all letters are used
    return `Matrix ${savedMatrices.length + 1}`;
  };

  const updateMatrix = (id: string, updates: Partial<Pick<SavedMatrix, 'name' | 'matrix' | 'dimensions'>>): void => {
    setSavedMatrices((prev) =>
      prev.map((matrix) =>
        matrix.id === id
          ? {
              ...matrix,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : matrix
      )
    );
  };

  const deleteMatrix = (id: string): void => {
    setSavedMatrices((prev) => prev.filter((matrix) => matrix.id !== id));
  };

  const getMatrixById = (id: string): SavedMatrix | undefined => {
    return savedMatrices.find((matrix) => matrix.id === id);
  };

  return {
    savedMatrices,
    isLoaded,
    saveMatrix,
    updateMatrix,
    deleteMatrix,
    getMatrixById,
    generateNextMatrixName,
  };
}

