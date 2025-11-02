/**
 * Parse comma-separated values into an array of numbers
 * @param input - Comma-separated string of numbers
 * @returns Array of numbers or null if invalid
 */
export function parseMatrixInput(input: string): number[] | null {
  if (!input.trim()) return null;
  
  const values = input
    .split(',')
    .map(val => val.trim())
    .filter(val => val !== '');
  
  const numbers = values.map(val => parseFloat(val));
  
  // Check if all values are valid numbers
  if (numbers.some(isNaN)) {
    return null;
  }
  
  return numbers;
}

/**
 * Calculate all possible matrix dimensions (factor pairs) for a given count
 * @param count - Total number of values
 * @returns Array of possible dimensions { rows, cols }
 */
export function calculatePossibleDimensions(count: number): Array<{ rows: number; cols: number }> {
  const dimensions: Array<{ rows: number; cols: number }> = [];
  
  for (let i = 1; i <= count; i++) {
    if (count % i === 0) {
      dimensions.push({ rows: i, cols: count / i });
    }
  }
  
  return dimensions;
}

/**
 * Reshape a 1D array into a 2D matrix
 * @param values - Array of numbers
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns 2D matrix array
 */
export function reshapeToMatrix(values: number[], rows: number, cols: number): number[][] {
  const matrix: number[][] = [];
  
  for (let i = 0; i < rows; i++) {
    matrix.push([]);
    for (let j = 0; j < cols; j++) {
      const index = i * cols + j;
      matrix[i].push(values[index]);
    }
  }
  
  return matrix;
}

/**
 * Type definition for matrix dimensions
 */
export type MatrixDimensions = {
  rows: number;
  cols: number;
};

/**
 * Type definition for saved matrix
 */
export type SavedMatrix = {
  id: string;
  name: string;
  matrix: number[][];
  dimensions: MatrixDimensions;
  createdAt: string;
  updatedAt: string;
};

/**
 * Generate a unique ID for saved matrices
 */
export function generateMatrixId(): string {
  return `matrix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * LocalStorage key for saved matrices
 */
const STORAGE_KEY = 'linear-algebra-pro-saved-matrices';

/**
 * Load saved matrices from localStorage
 */
export function loadSavedMatrices(): SavedMatrix[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading saved matrices from localStorage:', error);
    return [];
  }
}

/**
 * Save matrices to localStorage
 */
export function saveMatricesToStorage(matrices: SavedMatrix[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrices));
  } catch (error) {
    console.error('Error saving matrices to localStorage:', error);
    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Please delete some saved matrices.');
    }
  }
}

/**
 * Convert 2D matrix to comma-separated string
 */
export function matrixToString(matrix: number[][]): string {
  return matrix.flat().join(', ');
}

