/**
 * API utility functions for matrix operations
 */

const API_BASE_URL = 'http://localhost:3000';

export interface MatrixOperationRequest {
  matrixA: number[][];
  matrixB: number[][];
}

export interface MatrixOperationResponse {
  success: boolean;
  result: number[][];
  operation: string;
  dimensions: {
    rows: number;
    columns: number;
  };
  error?: string;
}

/**
 * Add two matrices
 */
export async function addMatrices(
  matrixA: number[][],
  matrixB: number[][]
): Promise<MatrixOperationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matrices/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        matrixA,
        matrixB,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      result: [],
      operation: 'addition',
      dimensions: { rows: 0, columns: 0 },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Multiply two matrices
 */
export async function multiplyMatrices(
  matrixA: number[][],
  matrixB: number[][]
): Promise<MatrixOperationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/matrices/multiply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        matrixA,
        matrixB,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      result: [],
      operation: 'multiplication',
      dimensions: { rows: 0, columns: 0 },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

