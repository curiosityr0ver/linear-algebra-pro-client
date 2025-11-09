/**
 * API utility functions for matrix operations
 * Updated to match Linear Algebra Pro API documentation
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Matrix {
  data: number[][];
  rows?: number;
  cols?: number;
  shape?: [number, number];
}

export interface MatrixResult {
  data: number[][];
  rows: number;
  cols: number;
  shape: [number, number];
}

export interface MatrixOperationResponse {
  result: MatrixResult;
  metadata?: {
    operation: string;
    [key: string]: any;
  };
}

export interface MatrixInfoResponse {
  matrix: MatrixResult;
  properties: {
    rows: number;
    cols: number;
    shape: [number, number];
    isSquare: boolean;
    size: number;
  };
}

export interface TraceResponse {
  trace: number;
  matrix: MatrixResult;
}

export interface DeterminantResponse {
  determinant: number;
  matrix: MatrixResult;
}

export interface EigenvaluesResponse {
  eigenvalues: number[];
  matrix: MatrixResult;
}

export interface ScalarOperationRequest {
  matrixA: Matrix;
  scalar: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert a 2D array to Matrix format
 */
function toMatrix(data: number[][]): Matrix {
  return {
    data,
    rows: data.length,
    cols: data[0]?.length || 0,
    shape: [data.length, data[0]?.length || 0],
  };
}

/**
 * Handle API errors
 */
async function handleApiError(response: Response): Promise<never> {
  let errorData: ApiError | any;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: `HTTP error! status: ${response.status}` };
  }
  
  const errorMessage = Array.isArray(errorData.message) 
    ? errorData.message.join(', ') 
    : errorData.message || `HTTP error! status: ${response.status}`;
  
  throw new Error(errorMessage);
}

/**
 * Make API request with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
}

// ============================================================================
// Matrix Creation
// ============================================================================

/**
 * Create an identity matrix
 */
export async function createIdentityMatrix(size: number): Promise<MatrixOperationResponse> {
  return apiRequest<MatrixOperationResponse>(`/matrix/create/identity/${size}`, {
    method: 'POST',
  });
}

/**
 * Create a zeros matrix
 */
export async function createZerosMatrix(rows: number, cols: number): Promise<MatrixOperationResponse> {
  return apiRequest<MatrixOperationResponse>(`/matrix/create/zeros?rows=${rows}&cols=${cols}`, {
    method: 'POST',
  });
}

/**
 * Create a ones matrix
 */
export async function createOnesMatrix(rows: number, cols: number): Promise<MatrixOperationResponse> {
  return apiRequest<MatrixOperationResponse>(`/matrix/create/ones?rows=${rows}&cols=${cols}`, {
    method: 'POST',
  });
}

// ============================================================================
// Arithmetic Operations
// ============================================================================

/**
 * Add two matrices
 */
export async function addMatrices(
  matrixA: number[][],
  matrixB: number[][]
): Promise<MatrixOperationResponse> {
  return apiRequest<MatrixOperationResponse>('/matrix/add', {
    method: 'POST',
    body: JSON.stringify({
      matrixA: toMatrix(matrixA),
      matrixB: toMatrix(matrixB),
    }),
  });
}

/**
 * Subtract two matrices
 */
export async function subtractMatrices(
  matrixA: number[][],
  matrixB: number[][]
): Promise<MatrixOperationResponse> {
  return apiRequest<MatrixOperationResponse>('/matrix/subtract', {
    method: 'POST',
    body: JSON.stringify({
      matrixA: toMatrix(matrixA),
      matrixB: toMatrix(matrixB),
    }),
  });
}

/**
 * Multiply two matrices
 */
export async function multiplyMatrices(
  matrixA: number[][],
  matrixB: number[][]
): Promise<MatrixOperationResponse> {
  return apiRequest<MatrixOperationResponse>('/matrix/multiply', {
    method: 'POST',
    body: JSON.stringify({
      matrixA: toMatrix(matrixA),
      matrixB: toMatrix(matrixB),
    }),
  });
}

/**
 * Multiply matrix by scalar
 */
export async function multiplyByScalar(
  matrix: number[][],
  scalar: number
): Promise<MatrixOperationResponse> {
  return apiRequest<MatrixOperationResponse>('/matrix/multiply-scalar', {
    method: 'POST',
    body: JSON.stringify({
      matrixA: toMatrix(matrix),
      scalar,
    }),
  });
}

/**
 * Divide matrix by scalar
 */
export async function divideByScalar(
  matrix: number[][],
  scalar: number
): Promise<MatrixOperationResponse> {
  return apiRequest<MatrixOperationResponse>('/matrix/divide-scalar', {
    method: 'POST',
    body: JSON.stringify({
      matrixA: toMatrix(matrix),
      scalar,
    }),
  });
}

// ============================================================================
// Matrix Properties
// ============================================================================

/**
 * Transpose a matrix
 */
export async function transposeMatrix(matrix: number[][]): Promise<MatrixOperationResponse> {
  return apiRequest<MatrixOperationResponse>('/matrix/transpose', {
    method: 'POST',
    body: JSON.stringify({
      matrix: toMatrix(matrix),
    }),
  });
}

/**
 * Calculate trace of a matrix
 */
export async function calculateTrace(matrix: number[][]): Promise<TraceResponse> {
  return apiRequest<TraceResponse>('/matrix/trace', {
    method: 'POST',
    body: JSON.stringify({
      matrix: toMatrix(matrix),
    }),
  });
}

/**
 * Calculate determinant of a matrix
 */
export async function calculateDeterminant(matrix: number[][]): Promise<DeterminantResponse> {
  return apiRequest<DeterminantResponse>('/matrix/determinant', {
    method: 'POST',
    body: JSON.stringify({
      matrix: toMatrix(matrix),
    }),
  });
}

/**
 * Calculate eigenvalues of a matrix
 */
export async function calculateEigenvalues(matrix: number[][]): Promise<EigenvaluesResponse> {
  return apiRequest<EigenvaluesResponse>('/matrix/eigenvalues', {
    method: 'POST',
    body: JSON.stringify({
      matrix: toMatrix(matrix),
    }),
  });
}

// ============================================================================
// Matrix Information
// ============================================================================

/**
 * Get matrix properties
 */
export async function getMatrixInfo(matrix: number[][]): Promise<MatrixInfoResponse> {
  return apiRequest<MatrixInfoResponse>('/matrix/info', {
    method: 'POST',
    body: JSON.stringify({
      matrix: toMatrix(matrix),
    }),
  });
}

/**
 * Check if two matrices are equal
 */
export async function checkMatrixEquality(
  matrixA: number[][],
  matrixB: number[][],
  tolerance: number = 1e-10
): Promise<{ equal: boolean }> {
  return apiRequest<{ equal: boolean }>(`/matrix/equals?tolerance=${tolerance}`, {
    method: 'POST',
    body: JSON.stringify({
      matrixA: toMatrix(matrixA),
      matrixB: toMatrix(matrixB),
    }),
  });
}

// ============================================================================
// Legacy Support (for backward compatibility)
// ============================================================================

/**
 * Legacy response format for backward compatibility
 * Converts new API response to old format
 */
export interface LegacyMatrixOperationResponse {
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
 * Convert new API response to legacy format
 */
function toLegacyResponse(
  response: MatrixOperationResponse,
  operation: string
): LegacyMatrixOperationResponse {
  return {
    success: true,
    result: response.result.data,
    operation,
    dimensions: {
      rows: response.result.rows,
      columns: response.result.cols,
    },
  };
}

/**
 * Legacy add matrices function (with error handling)
 */
export async function addMatricesLegacy(
  matrixA: number[][],
  matrixB: number[][]
): Promise<LegacyMatrixOperationResponse> {
  try {
    const response = await addMatrices(matrixA, matrixB);
    return toLegacyResponse(response, 'addition');
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
 * Legacy multiply matrices function (with error handling)
 */
export async function multiplyMatricesLegacy(
  matrixA: number[][],
  matrixB: number[][]
): Promise<LegacyMatrixOperationResponse> {
  try {
    const response = await multiplyMatrices(matrixA, matrixB);
    return toLegacyResponse(response, 'multiplication');
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

// ============================================================================
// Machine Learning - Linear Regression
// ============================================================================

export interface LinearRegressionOptions {
  learningRate?: number;
  maxIterations?: number;
  tolerance?: number;
  method?: 'sgd' | 'momentum' | 'adam';
  adamBeta1?: number;
  adamBeta2?: number;
  adamEpsilon?: number;
}

export interface LinearRegressionTrainRequest {
  X: Matrix;
  y: Matrix;
  options?: LinearRegressionOptions;
  lossFunction?: 'mse' | 'binary_crossentropy';
}

export interface LinearRegressionTrainResponse {
  modelId: string;
  result: {
    weights: MatrixResult;
    bias: MatrixResult;
    loss_history: number[];
    converged: boolean;
    iterations: number;
    final_loss: number;
  };
}

export interface LinearRegressionPredictRequest {
  X: Matrix;
}

export interface LinearRegressionPredictResponse {
  predictions: MatrixResult;
}

export interface ModelInfo {
  modelId: string;
  type: string;
  createdAt: string;
  [key: string]: any;
}

export interface ModelListResponse {
  models: ModelInfo[];
}

/**
 * Train a linear regression model
 */
export async function trainLinearRegression(
  X: number[][],
  y: number[][],
  options?: LinearRegressionOptions,
  lossFunction: 'mse' | 'binary_crossentropy' = 'mse'
): Promise<LinearRegressionTrainResponse> {
  return apiRequest<LinearRegressionTrainResponse>('/ml/linear-regression/train', {
    method: 'POST',
    body: JSON.stringify({
      X: toMatrix(X),
      y: toMatrix(y),
      options: options || {},
      lossFunction,
    }),
  });
}

/**
 * Make predictions using a trained linear regression model
 */
export async function predictLinearRegression(
  modelId: string,
  X: number[][]
): Promise<LinearRegressionPredictResponse> {
  return apiRequest<LinearRegressionPredictResponse>(
    `/ml/linear-regression/${modelId}/predict`,
    {
      method: 'POST',
      body: JSON.stringify({
        X: toMatrix(X),
      }),
    }
  );
}

/**
 * List all trained models
 */
export async function listModels(): Promise<ModelListResponse> {
  return apiRequest<ModelListResponse>('/ml/models', {
    method: 'GET',
  });
}

/**
 * Get information about a specific model
 */
export async function getModelInfo(modelId: string): Promise<ModelInfo> {
  return apiRequest<ModelInfo>(`/ml/models/${modelId}`, {
    method: 'GET',
  });
}

/**
 * Delete a trained model
 */
export async function deleteModel(modelId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/ml/models/${modelId}`, {
    method: 'DELETE',
  });
}