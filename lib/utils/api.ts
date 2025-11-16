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
    [key: string]: unknown;
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
type ErrorPayload = { message?: string | string[] };

async function handleApiError(response: Response): Promise<never> {
  const fallbackMessage = `HTTP error! status: ${response.status}`;
  let errorData: ErrorPayload = {};
  try {
    const parsed = (await response.json()) as unknown;
    if (typeof parsed === 'object' && parsed !== null && 'message' in parsed) {
      errorData = parsed as ErrorPayload;
    } else {
      errorData = { message: fallbackMessage };
    }
  } catch {
    errorData = { message: fallbackMessage };
  }
  
  const messageValue = errorData.message;
  const errorMessage = Array.isArray(messageValue)
    ? messageValue.join(', ')
    : messageValue || fallbackMessage;
  
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

export interface ModelMetadata {
  name?: string;
  title?: string;
  created?: string;
  [key: string]: unknown;
}

export interface ModelInfo {
  modelId: string;
  type: string;
  name?: string;
  modelName?: string;
  title?: string;
  created?: string; // API may return "created"
  createdAt?: string; // Normalised ISO string for UI
  optimizer?: string;
  lossFunction?: string;
  iterations?: number;
  final_loss?: number;
  converged?: boolean;
  metadata?: ModelMetadata;
  options?: LinearRegressionOptions & { name?: string };
  result?: LinearRegressionTrainResponse['result'];
}

export interface ModelListResponse {
  models: ModelInfo[];
}

export interface ModelHistoryResponse {
  modelId: string;
  loss_history: number[];
  iterations: number;
  converged: boolean;
  final_loss: number;
  lossFunction?: 'mse' | 'binary_crossentropy' | string;
  optimizer?: 'sgd' | 'momentum' | 'adam' | string;
}

export interface PCATrainResponse {
  X_transformed: MatrixResult;
  components: MatrixResult;
  mean: MatrixResult;
  explained_variance: number[];
  explained_variance_ratio: number[];
  n_components: number;
}

export interface PCATransformResponse {
  X_transformed: MatrixResult;
}

export interface SVDDecomposeResponse {
  U: MatrixResult;
  Sigma: MatrixResult;
  VT: MatrixResult;
  singular_values: number[];
  condition_number: number;
  numerical_rank: number;
}

export interface SVDReconstructResponse {
  reconstruction: MatrixResult;
  rank: number;
}

export interface QRDecomposeResponse {
  Q: MatrixResult;
  R: MatrixResult;
  determinant: number;
  rank: number;
}

export interface QRSolveResponse {
  solution: MatrixResult;
  verification: MatrixResult;
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
function normalizeModel(model: ModelInfo): ModelInfo {
  const rawCreated =
    model.created ||
    model.createdAt ||
    (typeof model.metadata?.created === 'string' ? model.metadata.created : undefined);

  const parsedDate = rawCreated ? new Date(rawCreated) : undefined;
  const normalizedCreatedAt =
    parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : undefined;

  return {
    ...model,
    created: rawCreated,
    createdAt: normalizedCreatedAt,
  };
}

export async function listModels(): Promise<ModelInfo[]> {
  const response = await apiRequest<ModelListResponse | ModelInfo[]>('/ml/models', {
    method: 'GET',
  });

  const models = Array.isArray(response) ? response : response?.models || [];
  return models.map(normalizeModel);
}

/**
 * Get information about a specific model
 */
export async function getModelInfo(modelId: string): Promise<ModelInfo> {
  const model = await apiRequest<ModelInfo>(`/ml/models/${modelId}`, {
    method: 'GET',
  });

  return normalizeModel(model);
}

/**
 * Get loss history for a trained model
 */
export async function getModelHistory(modelId: string): Promise<ModelHistoryResponse> {
  return apiRequest<ModelHistoryResponse>(`/ml/models/${modelId}/history`, {
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

// ============================================================================
// Advanced Algorithms - PCA / SVD / QR
// ============================================================================

export async function trainPCA(
  X: number[][],
  nComponents?: number
): Promise<PCATrainResponse> {
  return apiRequest<PCATrainResponse>('/advanced/pca/train', {
    method: 'POST',
    body: JSON.stringify({
      X: toMatrix(X),
      ...(nComponents ? { nComponents } : {}),
    }),
  });
}

export async function transformPCA(
  X: number[][],
  trainedPCA: PCATrainResponse
): Promise<PCATransformResponse> {
  return apiRequest<PCATransformResponse>('/advanced/pca/transform', {
    method: 'POST',
    body: JSON.stringify({
      X: toMatrix(X),
      trainedPCA,
    }),
  });
}

export async function decomposeSVD(
  matrix: number[][],
  options?: { maxIterations?: number; tolerance?: number }
): Promise<SVDDecomposeResponse> {
  return apiRequest<SVDDecomposeResponse>('/advanced/svd/decompose', {
    method: 'POST',
    body: JSON.stringify({
      matrix: toMatrix(matrix),
      ...(options?.maxIterations ? { maxIterations: options.maxIterations } : {}),
      ...(options?.tolerance ? { tolerance: options.tolerance } : {}),
    }),
  });
}

export async function reconstructSVD(
  matrix: number[][],
  k: number
): Promise<SVDReconstructResponse> {
  return apiRequest<SVDReconstructResponse>('/advanced/svd/reconstruct', {
    method: 'POST',
    body: JSON.stringify({
      matrix: toMatrix(matrix),
      k,
    }),
  });
}

export async function decomposeQR(matrix: number[][]): Promise<QRDecomposeResponse> {
  return apiRequest<QRDecomposeResponse>('/advanced/qr/decompose', {
    method: 'POST',
    body: JSON.stringify({
      matrix: toMatrix(matrix),
    }),
  });
}

export async function solveQR(
  A: number[][],
  b: number[][]
): Promise<QRSolveResponse> {
  return apiRequest<QRSolveResponse>('/advanced/qr/solve', {
    method: 'POST',
    body: JSON.stringify({
      A: toMatrix(A),
      b: toMatrix(b),
    }),
  });
}