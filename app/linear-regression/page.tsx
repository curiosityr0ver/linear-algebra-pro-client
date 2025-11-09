'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/ui/Header';
import Navigation from '@/components/ui/Navigation';
import { 
  trainLinearRegression, 
  predictLinearRegression, 
  listModels, 
  deleteModel,
  LinearRegressionOptions,
  ModelInfo,
  LinearRegressionTrainResponse
} from '@/lib/utils/api';
import { parseMatrixInput, reshapeToMatrix, calculatePossibleDimensions } from '@/lib/utils/matrix';

export default function LinearRegressionPage() {
  const [activeTab, setActiveTab] = useState<'train' | 'predict' | 'models'>('train');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Training state
  const [XInput, setXInput] = useState('');
  const [yInput, setYInput] = useState('');
  const [XMatrix, setXMatrix] = useState<number[][] | null>(null);
  const [yMatrix, setYMatrix] = useState<number[][] | null>(null);
  const [trainingResult, setTrainingResult] = useState<LinearRegressionTrainResponse | null>(null);
  const [options, setOptions] = useState<LinearRegressionOptions>({
    learningRate: 0.01,
    maxIterations: 1000,
    tolerance: 1e-6,
    method: 'adam',
  });

  // Prediction state
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [predictionInput, setPredictionInput] = useState('');
  const [predictionMatrix, setPredictionMatrix] = useState<number[][] | null>(null);
  const [predictions, setPredictions] = useState<number[][] | null>(null);

  // Load models on mount and when models change
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await listModels();
      setModels(response?.models || []);
    } catch (err) {
      console.error('Error loading models:', err);
      setModels([]); // Ensure models is always an array
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleTrain = async () => {
    if (!XMatrix || !yMatrix) {
      setError('Please provide both X and y matrices');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrainingResult(null);

    try {
      const result = await trainLinearRegression(XMatrix, yMatrix, options, 'mse');
      setTrainingResult(result);
      await loadModels(); // Refresh model list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedModelId) {
      setError('Please select a model');
      return;
    }
    if (!predictionMatrix) {
      setError('Please provide input data for prediction');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictions(null);

    try {
      const result = await predictLinearRegression(selectedModelId, predictionMatrix);
      setPredictions(result.predictions.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model?')) {
      return;
    }

    try {
      await deleteModel(modelId);
      await loadModels();
      if (selectedModelId === modelId) {
        setSelectedModelId('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete model');
    }
  };

  // Parse X input
  useEffect(() => {
    const parsed = parseMatrixInput(XInput);
    if (parsed && parsed.length > 0) {
      // For now, assume single feature (each value is a row with one column)
      // Users can input comma-separated values: 1,2,3,4 -> [[1],[2],[3],[4]]
      setXMatrix(parsed.map(val => [val]));
    } else {
      setXMatrix(null);
    }
  }, [XInput]);

  // Parse y input
  useEffect(() => {
    const parsed = parseMatrixInput(yInput);
    if (parsed && parsed.length > 0) {
      setYMatrix(parsed.map(val => [val]));
    } else {
      setYMatrix(null);
    }
  }, [yInput]);

  // Parse prediction input
  useEffect(() => {
    const parsed = parseMatrixInput(predictionInput);
    if (parsed && parsed.length > 0) {
      setPredictionMatrix(parsed.map(val => [val]));
    } else {
      setPredictionMatrix(null);
    }
  }, [predictionInput]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex-1 flex flex-col items-center bg-white dark:bg-black overflow-y-auto">
        <div className="w-full max-w-6xl px-8 sm:px-16 py-8">
          <Navigation />
          <Header
            title="Linear Regression"
            subtitle="Train and use linear regression models for predictions"
          />

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-zinc-300 dark:border-zinc-700">
            <button
              onClick={() => setActiveTab('train')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'train'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50'
              }`}
            >
              Train Model
            </button>
            <button
              onClick={() => setActiveTab('predict')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'predict'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50'
              }`}
            >
              Predict
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'models'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50'
              }`}
            >
              Models ({isLoadingModels ? '...' : (models?.length || 0)})
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-700">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Train Tab */}
          {activeTab === 'train' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* X Input */}
                <div className="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
                  <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
                    Features (X) - Comma-separated values
                  </label>
                  <input
                    type="text"
                    value={XInput}
                    onChange={(e) => setXInput(e.target.value)}
                    placeholder="1, 2, 3, 4, 5"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:border-blue-500"
                  />
                  {XMatrix && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      Shape: {XMatrix.length}×{XMatrix[0]?.length || 0}
                    </div>
                  )}
                </div>

                {/* y Input */}
                <div className="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
                  <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
                    Target (y) - Comma-separated values
                  </label>
                  <input
                    type="text"
                    value={yInput}
                    onChange={(e) => setYInput(e.target.value)}
                    placeholder="3, 5, 7, 9, 11"
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:border-blue-500"
                  />
                  {yMatrix && (
                    <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                      Shape: {yMatrix.length}×{yMatrix[0]?.length || 0}
                    </div>
                  )}
                </div>
              </div>

              {/* Training Options */}
              <div className="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-zinc-50">Training Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">
                      Learning Rate
                    </label>
                    <input
                      type="number"
                      value={options.learningRate}
                      onChange={(e) => setOptions({ ...options, learningRate: parseFloat(e.target.value) || 0.01 })}
                      step="0.001"
                      min="0.0001"
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">
                      Max Iterations
                    </label>
                    <input
                      type="number"
                      value={options.maxIterations}
                      onChange={(e) => setOptions({ ...options, maxIterations: parseInt(e.target.value) || 1000 })}
                      min="1"
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">
                      Method
                    </label>
                    <select
                      value={options.method}
                      onChange={(e) => setOptions({ ...options, method: e.target.value as 'sgd' | 'momentum' | 'adam' })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                    >
                      <option value="sgd">SGD</option>
                      <option value="momentum">Momentum</option>
                      <option value="adam">Adam</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Train Button */}
              <button
                onClick={handleTrain}
                disabled={isLoading || !XMatrix || !yMatrix}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Training...' : 'Train Model'}
              </button>

              {/* Training Results */}
              {trainingResult && (
                <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                  <h3 className="text-lg font-semibold mb-3 text-black dark:text-zinc-50">Training Results</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-black dark:text-zinc-50">Model ID:</span>
                      <span className="ml-2 text-zinc-600 dark:text-zinc-400 font-mono text-xs">{trainingResult.modelId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-black dark:text-zinc-50">Converged:</span>
                      <span className="ml-2 text-zinc-600 dark:text-zinc-400">{trainingResult.result.converged ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-black dark:text-zinc-50">Iterations:</span>
                      <span className="ml-2 text-zinc-600 dark:text-zinc-400">{trainingResult.result.iterations}</span>
                    </div>
                    <div>
                      <span className="font-medium text-black dark:text-zinc-50">Final Loss:</span>
                      <span className="ml-2 text-zinc-600 dark:text-zinc-400">{trainingResult.result.final_loss.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-black dark:text-zinc-50">Weights:</span>
                      <span className="ml-2 text-zinc-600 dark:text-zinc-400 font-mono">
                        [{trainingResult.result.weights.data.flat().join(', ')}]
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-black dark:text-zinc-50">Bias:</span>
                      <span className="ml-2 text-zinc-600 dark:text-zinc-400 font-mono">
                        {trainingResult.result.bias.data.flat().join(', ')}
                      </span>
                    </div>
                    {trainingResult.result.loss_history && trainingResult.result.loss_history.length > 0 && (
                      <div className="mt-3">
                        <span className="font-medium text-black dark:text-zinc-50 block mb-2">Loss History:</span>
                        <div className="flex flex-wrap gap-2">
                          {trainingResult.result.loss_history.slice(0, 10).map((loss, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-zinc-200 dark:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-mono"
                            >
                              {loss.toFixed(4)}
                            </span>
                          ))}
                          {trainingResult.result.loss_history.length > 10 && (
                            <span className="px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400">
                              +{trainingResult.result.loss_history.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Predict Tab */}
          {activeTab === 'predict' && (
            <div className="space-y-6">
              <div className="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
                <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
                  Select Model
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50"
                >
                  <option value="">Choose a model...</option>
                  {(models || []).map((model) => (
                    <option key={model.modelId} value={model.modelId}>
                      {model.modelId} ({model.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900">
                <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
                  Input Data (X) - Comma-separated values
                </label>
                <input
                  type="text"
                  value={predictionInput}
                  onChange={(e) => setPredictionInput(e.target.value)}
                  placeholder="1.5, 2.5, 3.5"
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:border-blue-500"
                />
                {predictionMatrix && (
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    Shape: {predictionMatrix.length}×{predictionMatrix[0]?.length || 0}
                  </div>
                )}
              </div>

              <button
                onClick={handlePredict}
                disabled={isLoading || !selectedModelId || !predictionMatrix}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Predicting...' : 'Make Prediction'}
              </button>

              {/* Predictions Results */}
              {predictions && (
                <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                  <h3 className="text-lg font-semibold mb-3 text-black dark:text-zinc-50">Predictions</h3>
                  <div className="space-y-1">
                    {predictions.map((row, i) => (
                      <div key={i} className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                        Prediction {i + 1}: {row[0]?.toFixed(4)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Models Tab */}
          {activeTab === 'models' && (
            <div className="space-y-4">
              {isLoadingModels ? (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  <p>Loading models...</p>
                </div>
              ) : !models || models.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  <p>No models trained yet. Train a model to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {(models || []).map((model) => (
                    <div
                      key={model.modelId}
                      className="border-2 border-zinc-300 dark:border-zinc-700 rounded-lg p-4 bg-zinc-50 dark:bg-zinc-900"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-black dark:text-zinc-50">{model.modelId}</h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">Type: {model.type}</p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Created: {new Date(model.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteModel(model.modelId)}
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
