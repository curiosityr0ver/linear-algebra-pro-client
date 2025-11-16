'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/ui/Header';
import Navigation from '@/components/ui/Navigation';
import LossHistoryChart from '@/components/ml/LossHistoryChart';
import {
  trainLinearRegression,
  predictLinearRegression,
  listModels,
  deleteModel,
  getModelInfo,
  getModelHistory,
  LinearRegressionOptions,
  ModelInfo,
  LinearRegressionTrainResponse,
  ModelHistoryResponse,
} from '@/lib/utils/api';
import { parseMatrixInput } from '@/lib/utils/matrix';

export default function LinearRegressionPage() {
  const [activeTab, setActiveTab] = useState<'train' | 'predict' | 'models'>('train');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedModelId, setCopiedModelId] = useState<string | null>(null);

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
  const [selectedPredictionModelId, setSelectedPredictionModelId] = useState<string>('');
  const [predictionInput, setPredictionInput] = useState('');
  const [predictionMatrix, setPredictionMatrix] = useState<number[][] | null>(null);
  const [predictions, setPredictions] = useState<number[][] | null>(null);

  // Model details state
  const [selectedDetailsModelId, setSelectedDetailsModelId] = useState<string | null>(null);
  const [modelDetails, setModelDetails] = useState<ModelInfo | null>(null);
  const [modelHistory, setModelHistory] = useState<ModelHistoryResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const selectedModelSummary = models.find((model) => model.modelId === selectedDetailsModelId);
  const detailSource = modelDetails || selectedModelSummary || null;

  // Helper function to get model date
  const getModelDate = (model: ModelInfo): Date => {
    const dateString = model.createdAt || model.created;
    if (dateString) {
      try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {
        // Invalid date, fall through
      }
    }
    // Fallback: Extract timestamp from modelId
    try {
      const parts = model.modelId.split('_');
      if (parts.length >= 3) {
        const timestamp = parseInt(parts[2]);
        if (!isNaN(timestamp)) {
          return new Date(timestamp);
        }
      }
    } catch {
      // Invalid date
    }
    return new Date(0); // Default to epoch if no date found
  };

  // Helper function to format model date in custom format: "13th Jan, '25 03:25 PM"
  const formatModelDate = (model: ModelInfo): string => {
    const date = getModelDate(model);
    if (date.getTime() === 0) {
      return 'Unknown';
    }
    
    // Get day with ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
    const day = date.getDate();
    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    // Get month abbreviation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    
    // Get year in 2-digit format with apostrophe
    const year = `'${date.getFullYear().toString().slice(-2)}`;
    
    // Get time in 12-hour format with AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes.toString();
    const hoursStr = hours < 10 ? `0${hours}` : hours.toString();
    
    return `${day}${getOrdinalSuffix(day)} ${month}, ${year} ${hoursStr}:${minutesStr} ${ampm}`;
  };

  // Helper to retrieve the most descriptive model name available
  const getModelName = (model: ModelInfo): string => {
    const candidates = [
      model.name,
      model.modelName,
      model.title,
      model.metadata?.name,
      model.metadata?.title,
      model.options?.name,
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    if (candidates.length > 0) {
      return candidates[0].trim();
    }

    const modelId = model.modelId || '';
    const derivedName = modelId
      .replace(/linear[-_ ]*regression[-_]?/i, '')
      .replace(/[_-]?\d{8,}$/i, '')
      .replace(/[_-]+/g, ' ')
      .trim();

    return derivedName || modelId || 'Unnamed Model';
  };

  const MODEL_NAME_MAX_LENGTH = 32;

  const formatModelDisplayLabel = (model: ModelInfo): string => {
    const name = getModelName(model);
    const truncatedName =
      name.length > MODEL_NAME_MAX_LENGTH ? `${name.slice(0, MODEL_NAME_MAX_LENGTH - 1)}…` : name;
    const formattedDate = formatModelDate(model);
    return formattedDate === 'Unknown' ? truncatedName : `${truncatedName} • ${formattedDate}`;
  };

  // Load models on mount and when models change
  const loadModels = useCallback(async () => {
    setIsLoadingModels(true);
    try {
      const modelsList = await listModels();

      // Sort by creation date (newest first)
      const sortedModels = [...modelsList].sort((a, b) => {
        const dateA = getModelDate(a);
        const dateB = getModelDate(b);
        return dateB.getTime() - dateA.getTime(); // Reverse chronological order
      });
      
      setModels(sortedModels);
      setSelectedDetailsModelId((currentId) => {
        if (!currentId) {
          return currentId;
        }
        const stillExists = sortedModels.some((model) => model.modelId === currentId);
        if (!stillExists) {
          setModelDetails(null);
          setModelHistory(null);
          return null;
        }
        return currentId;
      });
    } catch (err) {
      console.error('Error loading models:', err);
      setError(`Failed to load models: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setModels([]); // Ensure models is always an array
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const fetchModelDetails = async (modelId: string) => {
    setIsLoadingDetails(true);
    try {
      const info = await getModelInfo(modelId);
      setModelDetails(info);
    } catch (err) {
      console.error('Error loading model details:', err);
      setError(`Failed to load model details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchModelHistory = async (modelId: string) => {
    setIsLoadingHistory(true);
    try {
      const history = await getModelHistory(modelId);
      setModelHistory(history);
    } catch (err) {
      console.error('Error loading model history:', err);
      setError(`Failed to load loss history: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const focusModelDetails = (modelId: string) => {
    setSelectedDetailsModelId(modelId);
    setModelDetails(null);
    setModelHistory(null);
    fetchModelDetails(modelId);
    fetchModelHistory(modelId);
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
      console.log('Training result:', result);
      setTrainingResult(result);
      setError(null);
      
      // Optimistically add the new model to the list immediately
      if (result?.modelId) {
        const newModel: ModelInfo = {
          modelId: result.modelId,
          type: 'linear_regression',
          createdAt: new Date().toISOString(),
        };
        setModels((prev) => {
          // Check if model already exists to avoid duplicates
          if (prev.some(m => m.modelId === result.modelId)) {
            return prev;
          }
          // Add new model and sort by date (newest first)
          const updated = [...prev, newModel];
          return updated.sort((a, b) => {
            const dateA = getModelDate(a);
            const dateB = getModelDate(b);
            return dateB.getTime() - dateA.getTime();
          });
        });

        focusModelDetails(result.modelId);
      }
      
      // Also refresh from server to ensure we have the latest data
      await loadModels();
    } catch (err) {
      console.error('Training error:', err);
      setError(err instanceof Error ? err.message : 'Training failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedPredictionModelId) {
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
      const result = await predictLinearRegression(selectedPredictionModelId, predictionMatrix);
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
      if (selectedPredictionModelId === modelId) {
        setSelectedPredictionModelId('');
      }
      if (selectedDetailsModelId === modelId) {
        setSelectedDetailsModelId(null);
        setModelDetails(null);
        setModelHistory(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete model');
    }
  };

  const handleUseModelForPrediction = (modelId: string) => {
    setSelectedPredictionModelId(modelId);
    setActiveTab('predict');
  };

  const handleCopyModelId = async (modelId: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setError('Clipboard API is not available in this environment.');
      return;
    }
    try {
      await navigator.clipboard.writeText(modelId);
      setCopiedModelId(modelId);
      setTimeout(() => setCopiedModelId(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy model ID');
    }
  };

  const handleRefreshDetails = () => {
    if (!selectedDetailsModelId) return;
    fetchModelDetails(selectedDetailsModelId);
    fetchModelHistory(selectedDetailsModelId);
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
      <div className="bg-white dark:bg-black">
        <div className="w-full px-6 py-8 sm:px-12">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            <Navigation />
            <Header
              title="Linear Regression"
              subtitle="Train and use linear regression models for predictions"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col bg-white dark:bg-black overflow-y-auto">
        <div className="w-full px-6 py-8 sm:px-12">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-300 dark:border-zinc-700">
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
                    className="w-full px-4 py-3 text-sm border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans transition-all shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600"
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
                    className="w-full px-4 py-3 text-sm border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans transition-all shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600"
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
                      className="w-full px-4 py-3 text-sm border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600"
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
                      className="w-full px-4 py-3 text-sm border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black dark:text-zinc-50">
                      Method
                    </label>
                    <div className="relative">
                      <select
                        value={options.method}
                        onChange={(e) => setOptions({ ...options, method: e.target.value as 'sgd' | 'momentum' | 'adam' })}
                        className="w-full px-4 py-3 text-sm border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer appearance-none pr-10"
                      >
                        <option value="sgd">SGD</option>
                        <option value="momentum">Momentum</option>
                        <option value="adam">Adam</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-black dark:text-zinc-50">
                    Select Model
                  </label>
                  <button
                    onClick={loadModels}
                    disabled={isLoadingModels}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isLoadingModels ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={selectedPredictionModelId}
                    onChange={(e) => setSelectedPredictionModelId(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer appearance-none pr-10"
                  >
                    <option value="">Choose a model...</option>
                    {(models || []).map((model) => (
                      <option key={model.modelId} value={model.modelId}>
                        {formatModelDisplayLabel(model)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {models && models.length === 0 && !isLoadingModels && (
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    No models available. Train a model first.
                  </p>
                )}
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
                  className="w-full px-4 py-3 text-sm border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans transition-all shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600"
                />
                {predictionMatrix && (
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    Shape: {predictionMatrix.length}×{predictionMatrix[0]?.length || 0}
                  </div>
                )}
              </div>

              <button
                onClick={handlePredict}
                disabled={isLoading || !selectedPredictionModelId || !predictionMatrix}
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
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">Trained Models</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Explore metadata, parameters, and training history for each saved model.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={loadModels}
                    disabled={isLoadingModels}
                    className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isLoadingModels ? 'Refreshing...' : 'Refresh List'}
                  </button>
                  <button
                    onClick={handleRefreshDetails}
                    disabled={!selectedDetailsModelId || isLoadingDetails || isLoadingHistory}
                    className="px-4 py-2 text-sm border-2 border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-100 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    Reload Selection
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
                <div className="border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40 p-4">
                  {isLoadingModels ? (
                    <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">Loading models…</div>
                  ) : !models || models.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                      No models trained yet. Train a model to get started.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(models || []).map((model) => {
                        const isSelected = model.modelId === selectedDetailsModelId;
                        return (
                          <button
                            type="button"
                            key={model.modelId}
                            onClick={() => focusModelDetails(model.modelId)}
                            className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/20'
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-black dark:text-zinc-50">
                                  {getModelName(model)}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {formatModelDate(model)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                  Final Loss
                                </p>
                                <p className="font-mono text-base text-zinc-900 dark:text-zinc-100">
                                  {model.final_loss !== undefined ? model.final_loss.toFixed(4) : '—'}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800/60 px-2 py-1">
                                Optimizer: {model.optimizer || '—'}
                              </div>
                              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800/60 px-2 py-1">
                                Iterations: {model.iterations ?? '—'}
                              </div>
                              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800/60 px-2 py-1">
                                Loss Fn: {model.lossFunction || '—'}
                              </div>
                              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800/60 px-2 py-1">
                                Status:{' '}
                                <span className={model.converged ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                                  {model.converged ? 'Converged' : 'Not converged'}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40 p-6 min-h-[420px] flex flex-col gap-6">
                  {selectedDetailsModelId && detailSource ? (
                    <>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            Selected Model
                          </p>
                          <h4 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                            {getModelName(detailSource)}
                          </h4>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {formatModelDate(detailSource)}
                          </p>
                          <p className="mt-2 font-mono text-xs text-zinc-400 dark:text-zinc-500 break-all">
                            {selectedDetailsModelId}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUseModelForPrediction(selectedDetailsModelId)}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            Use for Predictions
                          </button>
                          <button
                            onClick={() => handleCopyModelId(selectedDetailsModelId)}
                            className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-100 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                          >
                            {copiedModelId === selectedDetailsModelId ? 'Copied!' : 'Copy Model ID'}
                          </button>
                          <button
                            onClick={handleRefreshDetails}
                            disabled={isLoadingDetails || isLoadingHistory}
                            className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-100 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          >
                            Refresh Details
                          </button>
                          <button
                            onClick={() => handleDeleteModel(selectedDetailsModelId)}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                          >
                            Delete Model
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <StatisticCard label="Final Loss" value={detailSource.final_loss} format="decimal" />
                        <StatisticCard label="Iterations" value={detailSource.iterations} format="integer" />
                        <StatisticCard label="Optimizer" value={detailSource.optimizer} format="text" />
                        <StatisticCard label="Loss Function" value={detailSource.lossFunction} format="text" />
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Weights &amp; Bias</h5>
                        {isLoadingDetails ? (
                          <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Loading parameters…</div>
                        ) : modelDetails?.result ? (
                          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <MatrixPreviewCard label="Weights" values={modelDetails.result.weights?.data} />
                            <MatrixPreviewCard label="Bias" values={modelDetails.result.bias?.data} />
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Parameter details will appear once loaded.
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Training History</h5>
                          <button
                            onClick={handleRefreshDetails}
                            disabled={isLoadingHistory}
                            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
                          >
                            {isLoadingHistory ? 'Refreshing…' : 'Refresh'}
                          </button>
                        </div>
                        {isLoadingHistory ? (
                          <div className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Loading loss history…</div>
                        ) : modelHistory && modelHistory.modelId === selectedDetailsModelId ? (
                          <div className="mt-4 space-y-4">
                            <LossHistoryChart data={modelHistory.loss_history} />
                            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-600 dark:text-zinc-300">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Iterations</p>
                                <p className="mt-1 text-lg font-semibold">{modelHistory.iterations}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Converged</p>
                                <p className="mt-1 text-lg font-semibold">
                                  {modelHistory.converged ? 'Yes' : 'No'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Final Loss</p>
                                <p className="mt-1 text-lg font-semibold">
                                  {modelHistory.final_loss.toFixed(6)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Optimizer</p>
                                <p className="mt-1 text-lg font-semibold">{modelHistory.optimizer || '—'}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Loss history will load once selected.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="m-auto text-center text-zinc-500 dark:text-zinc-400">
                      <p className="text-base font-medium">Select a model to inspect its details.</p>
                      <p className="text-sm mt-1">Choose any model from the list on the left.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
  );
}

interface StatisticCardProps {
  label: string;
  value?: number | string | null;
  format?: 'decimal' | 'integer' | 'text';
}

function StatisticCard({ label, value, format = 'decimal' }: StatisticCardProps) {
  let display: string = '—';

  if (value !== undefined && value !== null) {
    if (typeof value === 'number') {
      if (format === 'integer') {
        display = Math.round(value).toString();
      } else if (format === 'text') {
        display = value.toString();
      } else {
        display = value.toFixed(4);
      }
    } else {
      display = value;
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{display}</p>
    </div>
  );
}

interface MatrixPreviewCardProps {
  label: string;
  values?: number[][];
}

function MatrixPreviewCard({ label, values }: MatrixPreviewCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/30 p-4">
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-50">{label}</p>
      {values && values.length > 0 ? (
        <div className="mt-3 space-y-1 font-mono text-xs text-zinc-600 dark:text-zinc-300">
          {values.map((row, index) => (
            <div key={`${label}-${index}`}>[{row.join(', ')}]</div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">No data available.</p>
      )}
    </div>
  );
}
