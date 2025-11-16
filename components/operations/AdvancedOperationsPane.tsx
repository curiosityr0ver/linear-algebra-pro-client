'use client';

import { useState } from 'react';
import { SavedMatrix, MatrixDimensions } from '@/lib/utils/matrix';
import {
  trainPCA,
  transformPCA,
  decomposeSVD,
  reconstructSVD,
  decomposeQR,
  solveQR,
  PCATrainResponse,
  SVDDecomposeResponse,
  SVDReconstructResponse,
  QRDecomposeResponse,
  QRSolveResponse,
  MatrixResult,
} from '@/lib/utils/api';

type AdvancedTab = 'pca' | 'svd' | 'qr';

interface AdvancedOperationsPaneProps {
  savedMatrices: SavedMatrix[];
  onSaveResult?: (result: number[][], dimensions: MatrixDimensions) => void;
}

export default function AdvancedOperationsPane({
  savedMatrices,
  onSaveResult,
}: AdvancedOperationsPaneProps) {
  const [activeTab, setActiveTab] = useState<AdvancedTab>('pca');

  // PCA state
  const [pcaMatrixId, setPcaMatrixId] = useState('');
  const [pcaComponents, setPcaComponents] = useState('');
  const [pcaTransformMatrixId, setPcaTransformMatrixId] = useState('');
  const [pcaTraining, setPcaTraining] = useState(false);
  const [pcaTransforming, setPcaTransforming] = useState(false);
  const [pcaResult, setPcaResult] = useState<PCATrainResponse | null>(null);
  const [pcaTransformResult, setPcaTransformResult] = useState<MatrixResult | null>(null);
  const [pcaError, setPcaError] = useState<string | null>(null);

  // SVD state
  const [svdMatrixId, setSvdMatrixId] = useState('');
  const [svdMaxIterations, setSvdMaxIterations] = useState('100');
  const [svdTolerance, setSvdTolerance] = useState('1e-10');
  const [svdLoading, setSvdLoading] = useState(false);
  const [svdResult, setSvdResult] = useState<SVDDecomposeResponse | null>(null);
  const [svdReconstructMatrixId, setSvdReconstructMatrixId] = useState('');
  const [svdRank, setSvdRank] = useState('');
  const [svdReconstructLoading, setSvdReconstructLoading] = useState(false);
  const [svdReconstructResult, setSvdReconstructResult] = useState<SVDReconstructResponse | null>(null);
  const [svdError, setSvdError] = useState<string | null>(null);

  // QR state
  const [qrMatrixId, setQrMatrixId] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrResult, setQrResult] = useState<QRDecomposeResponse | null>(null);
  const [qrSolveAId, setQrSolveAId] = useState('');
  const [qrSolveBId, setQrSolveBId] = useState('');
  const [qrSolveLoading, setQrSolveLoading] = useState(false);
  const [qrSolveResult, setQrSolveResult] = useState<QRSolveResponse | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const getMatrixById = (id: string) => savedMatrices.find((matrix) => matrix.id === id);

  const saveMatrixResult = (matrix?: MatrixResult | null) => {
    if (!matrix || !onSaveResult) return;
    onSaveResult(
      matrix.data,
      {
        rows: matrix.rows,
        cols: matrix.cols,
      }
    );
  };

  const handleTrainPCA = async () => {
    const matrix = getMatrixById(pcaMatrixId);
    if (!matrix) {
      setPcaError('Select a matrix for PCA training.');
      return;
    }

    setPcaError(null);
    setPcaTraining(true);
    setPcaTransformResult(null);

    try {
      const componentsCount = pcaComponents ? parseInt(pcaComponents, 10) : undefined;
      const result = await trainPCA(matrix.matrix, componentsCount);
      setPcaResult(result);
    } catch (err) {
      setPcaError(err instanceof Error ? err.message : 'PCA training failed');
      setPcaResult(null);
    } finally {
      setPcaTraining(false);
    }
  };

  const handleTransformPCA = async () => {
    if (!pcaResult) {
      setPcaError('Train PCA before transforming data.');
      return;
    }
    const matrix = getMatrixById(pcaTransformMatrixId);
    if (!matrix) {
      setPcaError('Select a matrix to transform.');
      return;
    }

    setPcaError(null);
    setPcaTransforming(true);

    try {
      const result = await transformPCA(matrix.matrix, pcaResult);
      setPcaTransformResult(result.X_transformed);
    } catch (err) {
      setPcaError(err instanceof Error ? err.message : 'PCA transform failed');
      setPcaTransformResult(null);
    } finally {
      setPcaTransforming(false);
    }
  };

  const handleDecomposeSVD = async () => {
    const matrix = getMatrixById(svdMatrixId);
    if (!matrix) {
      setSvdError('Select a matrix for SVD.');
      return;
    }

    setSvdError(null);
    setSvdLoading(true);

    try {
      const maxIterations = svdMaxIterations ? parseInt(svdMaxIterations, 10) : undefined;
      const tolerance = svdTolerance ? parseFloat(svdTolerance) : undefined;
      const result = await decomposeSVD(matrix.matrix, { maxIterations, tolerance });
      setSvdResult(result);
    } catch (err) {
      setSvdError(err instanceof Error ? err.message : 'SVD decomposition failed');
      setSvdResult(null);
    } finally {
      setSvdLoading(false);
    }
  };

  const handleReconstructSVD = async () => {
    const matrix = getMatrixById(svdReconstructMatrixId);
    if (!matrix) {
      setSvdError('Select a matrix to reconstruct.');
      return;
    }
    const rank = parseInt(svdRank, 10);
    if (Number.isNaN(rank) || rank < 1) {
      setSvdError('Provide a valid rank (k >= 1).');
      return;
    }

    setSvdError(null);
    setSvdReconstructLoading(true);

    try {
      const result = await reconstructSVD(matrix.matrix, rank);
      setSvdReconstructResult(result);
    } catch (err) {
      setSvdError(err instanceof Error ? err.message : 'SVD reconstruction failed');
      setSvdReconstructResult(null);
    } finally {
      setSvdReconstructLoading(false);
    }
  };

  const handleDecomposeQR = async () => {
    const matrix = getMatrixById(qrMatrixId);
    if (!matrix) {
      setQrError('Select a matrix for QR decomposition.');
      return;
    }

    setQrError(null);
    setQrLoading(true);

    try {
      const result = await decomposeQR(matrix.matrix);
      setQrResult(result);
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'QR decomposition failed');
      setQrResult(null);
    } finally {
      setQrLoading(false);
    }
  };

  const handleSolveQR = async () => {
    const matrixA = getMatrixById(qrSolveAId);
    const matrixB = getMatrixById(qrSolveBId);
    if (!matrixA || !matrixB) {
      setQrError('Select matrices for both A and b.');
      return;
    }

    setQrError(null);
    setQrSolveLoading(true);

    try {
      const result = await solveQR(matrixA.matrix, matrixB.matrix);
      setQrSolveResult(result);
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'QR solve failed');
      setQrSolveResult(null);
    } finally {
      setQrSolveLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Advanced Operations</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">PCA, SVD, and QR toolset</p>
        </div>
        <div className="flex gap-2">
          {(['pca', 'svd', 'qr'] as AdvancedTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'pca' && (
          <>
            <SectionHeading title="Train PCA" subtitle="POST /advanced/pca/train" />
            <div className="space-y-2">
              <MatrixSelect
                label="Training Data"
                value={pcaMatrixId}
                onChange={setPcaMatrixId}
                matrices={savedMatrices}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Components (optional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Auto"
                    value={pcaComponents}
                    onChange={(e) => setPcaComponents(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleTrainPCA}
                disabled={pcaTraining || !pcaMatrixId}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {pcaTraining ? 'Training...' : 'Train PCA'}
              </button>
            </div>

            {pcaResult && (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 p-4 space-y-3">
                <div className="flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                  <span>Components: {pcaResult.n_components}</span>
                  <span>
                    Explained Variance Sum:{' '}
                    {pcaResult.explained_variance.reduce((sum, value) => sum + value, 0).toFixed(3)}
                  </span>
                  <span>
                    Total Explained:{' '}
                    {(pcaResult.explained_variance_ratio.reduce((sum, value) => sum + value, 0) * 100).toFixed(2)}%
                  </span>
                  <span>
                    Features: {pcaResult.mean?.cols ?? pcaResult.components.cols}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <MatrixResultCard
                    title="Transformed Data"
                    matrix={pcaResult.X_transformed}
                    onSave={() => saveMatrixResult(pcaResult.X_transformed)}
                  />
                  <MatrixResultCard
                    title="Components"
                    matrix={pcaResult.components}
                    onSave={() => saveMatrixResult(pcaResult.components)}
                  />
                  <MatrixResultCard
                    title="Mean Vector"
                    matrix={pcaResult.mean}
                    onSave={() => saveMatrixResult(pcaResult.mean)}
                  />
                </div>
              </div>
            )}

            <SectionHeading title="Transform Data" subtitle="POST /advanced/pca/transform" />
            <div className="space-y-2">
              <MatrixSelect
                label="Dataset to Transform"
                value={pcaTransformMatrixId}
                onChange={setPcaTransformMatrixId}
                matrices={savedMatrices}
                disabled={!pcaResult}
                helperText={!pcaResult ? 'Train PCA first.' : undefined}
              />
              <button
                onClick={handleTransformPCA}
                disabled={!pcaResult || !pcaTransformMatrixId || pcaTransforming}
                className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-semibold text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:disabled:bg-zinc-700 dark:hover:bg-zinc-200"
              >
                {pcaTransforming ? 'Transforming...' : 'Transform with PCA'}
              </button>
            </div>

            {pcaTransformResult && (
              <MatrixResultCard
                title="Transformed Output"
                matrix={pcaTransformResult}
                onSave={() => saveMatrixResult(pcaTransformResult)}
              />
            )}

            {pcaError && <ErrorBanner message={pcaError} />}
          </>
        )}

        {activeTab === 'svd' && (
          <>
            <SectionHeading title="SVD Decomposition" subtitle="POST /advanced/svd/decompose" />
            <div className="space-y-2">
              <MatrixSelect
                label="Matrix"
                value={svdMatrixId}
                onChange={setSvdMatrixId}
                matrices={savedMatrices}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumberInput
                  label="Max Iterations"
                  value={svdMaxIterations}
                  onChange={setSvdMaxIterations}
                />
                <NumberInput
                  label="Tolerance"
                  value={svdTolerance}
                  onChange={setSvdTolerance}
                  placeholder="1e-10"
                  step="any"
                />
              </div>
              <button
                onClick={handleDecomposeSVD}
                disabled={svdLoading || !svdMatrixId}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {svdLoading ? 'Decomposing...' : 'Run SVD'}
              </button>
            </div>

            {svdResult && (
              <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 p-4">
                <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-300">
                  <span>Rank: {svdResult.numerical_rank}</span>
                  <span>Condition #: {svdResult.condition_number.toFixed(3)}</span>
                  <span>σ₁: {svdResult.singular_values[0]?.toFixed(3) ?? '—'}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <MatrixResultCard title="U" matrix={svdResult.U} onSave={() => saveMatrixResult(svdResult.U)} />
                  <MatrixResultCard title="Σ" matrix={svdResult.Sigma} onSave={() => saveMatrixResult(svdResult.Sigma)} />
                  <MatrixResultCard title="Vᵀ" matrix={svdResult.VT} onSave={() => saveMatrixResult(svdResult.VT)} />
                </div>
              </div>
            )}

            <SectionHeading title="Low-rank Reconstruction" subtitle="POST /advanced/svd/reconstruct" />
            <div className="space-y-2">
              <MatrixSelect
                label="Matrix"
                value={svdReconstructMatrixId}
                onChange={setSvdReconstructMatrixId}
                matrices={savedMatrices}
              />
              <NumberInput
                label="Rank (k)"
                value={svdRank}
                onChange={setSvdRank}
                placeholder="2"
                min={1}
              />
              <button
                onClick={handleReconstructSVD}
                disabled={svdReconstructLoading || !svdReconstructMatrixId || !svdRank}
                className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-semibold text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:disabled:bg-zinc-700 dark:hover:bg-zinc-200"
              >
                {svdReconstructLoading ? 'Reconstructing...' : 'Reconstruct'}
              </button>
            </div>

            {svdReconstructResult && (
              <MatrixResultCard
                title={`Rank-${svdReconstructResult.rank} Reconstruction`}
                matrix={svdReconstructResult.reconstruction}
                onSave={() => saveMatrixResult(svdReconstructResult.reconstruction)}
              />
            )}

            {svdError && <ErrorBanner message={svdError} />}
          </>
        )}

        {activeTab === 'qr' && (
          <>
            <SectionHeading title="QR Decomposition" subtitle="POST /advanced/qr/decompose" />
            <div className="space-y-2">
              <MatrixSelect
                label="Matrix"
                value={qrMatrixId}
                onChange={setQrMatrixId}
                matrices={savedMatrices}
              />
              <button
                onClick={handleDecomposeQR}
                disabled={qrLoading || !qrMatrixId}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {qrLoading ? 'Decomposing...' : 'Decompose'}
              </button>
            </div>

            {qrResult && (
              <div className="space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 p-4">
                <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-300">
                  <span>Rank: {qrResult.rank}</span>
                  <span>Determinant: {qrResult.determinant.toFixed(3)}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <MatrixResultCard title="Q" matrix={qrResult.Q} onSave={() => saveMatrixResult(qrResult.Q)} />
                  <MatrixResultCard title="R" matrix={qrResult.R} onSave={() => saveMatrixResult(qrResult.R)} />
                </div>
              </div>
            )}

            <SectionHeading title="Solve A · x = b" subtitle="POST /advanced/qr/solve" />
            <div className="space-y-2">
              <div className="grid gap-3 md:grid-cols-2">
                <MatrixSelect
                  label="Matrix A"
                  value={qrSolveAId}
                  onChange={setQrSolveAId}
                  matrices={savedMatrices}
                />
                <MatrixSelect
                  label="Matrix b"
                  value={qrSolveBId}
                  onChange={setQrSolveBId}
                  matrices={savedMatrices}
                />
              </div>
              <button
                onClick={handleSolveQR}
                disabled={qrSolveLoading || !qrSolveAId || !qrSolveBId}
                className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-semibold text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:disabled:bg-zinc-700 dark:hover:bg-zinc-200"
              >
                {qrSolveLoading ? 'Solving...' : 'Solve System'}
              </button>
            </div>

            {qrSolveResult && (
              <div className="grid gap-3 md:grid-cols-2">
                <MatrixResultCard
                  title="Solution (x)"
                  matrix={qrSolveResult.solution}
                  onSave={() => saveMatrixResult(qrSolveResult.solution)}
                />
                <MatrixResultCard
                  title="Verification (A · x)"
                  matrix={qrSolveResult.verification}
                  onSave={() => saveMatrixResult(qrSolveResult.verification)}
                />
              </div>
            )}

            {qrError && <ErrorBanner message={qrError} />}
          </>
        )}
      </div>
    </div>
  );
}

interface MatrixSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  matrices: SavedMatrix[];
  disabled?: boolean;
  helperText?: string;
}

function MatrixSelect({ label, value, onChange, matrices, disabled, helperText }: MatrixSelectProps) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:disabled:bg-zinc-900"
      >
        <option value="">Select matrix...</option>
        {matrices.map((matrix) => (
          <option key={matrix.id} value={matrix.id}>
            {matrix.name} ({matrix.dimensions.rows}×{matrix.dimensions.cols})
          </option>
        ))}
      </select>
      {helperText && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  step?: string;
}

function NumberInput({ label, value, onChange, placeholder, min = 1, step = '1' }: NumberInputProps) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
        {label}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

interface MatrixResultCardProps {
  title: string;
  matrix?: MatrixResult | null;
  onSave?: () => void;
}

function MatrixResultCard({ title, matrix, onSave }: MatrixResultCardProps) {
  if (!matrix) {
    return null;
  }

  const previewRows = matrix.data.slice(0, 3);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {matrix.rows}×{matrix.cols}
          </p>
        </div>
        {onSave && (
          <button
            onClick={onSave}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300"
          >
            Save
          </button>
        )}
      </div>
      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-2 text-xs font-mono text-zinc-700 dark:text-zinc-200 max-h-32 overflow-auto">
        {previewRows.map((row, rowIndex) => (
          <div key={`${title}-${rowIndex}`}>[{row.join(', ')}]</div>
        ))}
        {matrix.data.length > 3 && <div>…</div>}
      </div>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
      {message}
    </div>
  );
}

