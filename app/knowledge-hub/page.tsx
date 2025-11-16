'use client';

import { useState } from 'react';
import Header from '@/components/ui/Header';
import Navigation from '@/components/ui/Navigation';

const operationFlows = [
  {
    title: 'Addition & Subtraction',
    summary: 'Line up matrices element-by-element to blend or compare datasets.',
    steps: ['Pick matrices with identical shapes', 'Pair each cell (r, c)', 'Combine values → new matrix'],
    accent: 'from-blue-500/10 via-blue-500/5 to-blue-500/0 border-blue-400/50',
  },
  {
    title: 'Matrix Multiplication',
    summary: 'Project rows of A onto columns of B to uncover new relationships.',
    steps: ['Row of A • Column of B', 'Sum the products', 'Repeat for every cell'],
    accent: 'from-purple-500/10 via-purple-500/5 to-purple-500/0 border-purple-400/50',
  },
  {
    title: 'Transpose & Determinant',
    summary: 'Transpose reflects along the diagonal; determinant scales area/volume.',
    steps: ['Transpose flips axes', 'Determinant measures scaling', 'Zero det ⇒ no inverse'],
    accent: 'from-amber-500/10 via-amber-500/5 to-amber-500/0 border-amber-400/50',
  },
];

const storyBoard = [
  {
    label: 'Matrix A',
    data: [
      [1, 2],
      [3, 4],
    ],
    accent: 'bg-blue-100 text-blue-700',
  },
  {
    label: 'Matrix B',
    data: [
      [5, 6],
      [7, 8],
    ],
    accent: 'bg-rose-100 text-rose-700',
  },
  {
    label: 'Result (A × B)',
    data: [
      [19, 22],
      [43, 50],
    ],
    accent: 'bg-emerald-100 text-emerald-700',
  },
];

const advancedStages = [
  {
    id: 'pca',
    title: 'PCA',
    details: 'Center ➜ rotate ➜ project. Perfect for compressing correlated features.',
    highlight: 'Explained variance + mean vector',
    insights: [
      'Step 1: subtract the mean vector so every feature pivots around zero.',
      'Step 2: compute covariance to understand how features co-vary.',
      'Step 3: eigenvectors of covariance become the rotation axes (principal components).',
      'Step 4: project data → the coefficients tell you how much each component explains.',
    ],
  },
  {
    id: 'svd',
    title: 'SVD',
    details: 'Factor any matrix into energy (Σ) and directions (U, Vᵀ).',
    highlight: 'Low-rank reconstructions',
    insights: [
      'U encodes left singular vectors — basis of row space.',
      'Σ lists singular values; magnitude = energy captured by each vector.',
      'Vᵀ encodes right singular vectors — basis of column space.',
      'Truncate Σ to keep only strong signals and rebuild smooth approximations.',
    ],
  },
  {
    id: 'qr',
    title: 'QR',
    details: 'Orthogonal Q aligns axes; upper R solves linear systems with ease.',
    highlight: 'Stable solves for Ax = b',
    insights: [
      'Use Gram-Schmidt or Householder reflections to turn columns orthogonal.',
      'Q preserves lengths/angles, so projections stay stable.',
      'R collects the “weights” needed to rebuild the original matrix.',
      'Solve Ax = b by first computing y = Qᵀb then back-substituting through R.',
    ],
  },
];

const regressionFlow = [
  { label: '1. Prepare Data', text: 'Matrix X holds features, vector y holds targets.' },
  { label: '2. Optimize', text: 'Gradient methods tune weights + bias to minimize loss.' },
  { label: '3. Interpret', text: 'Weights describe slope, bias anchors the trend.' },
  { label: '4. Predict', text: 'Feed new X → get ŷ = X·W + b.' },
];

export default function KnowledgeHubPage() {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const toggleStage = (id: string) => {
    setExpandedStage((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <div className="bg-white dark:bg-black">
        <div className="w-full px-6 py-8 sm:px-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <Navigation />
            <Header
              size="md"
              title="Knowledge Hub"
              subtitle="A visual guide to the ideas powering Linear Algebra Pro."
            />
          </div>
        </div>
      </div>

      <main className="flex flex-1 flex-col bg-white dark:bg-black overflow-y-auto">
        <div className="w-full px-6 py-8 sm:px-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <section className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-100 via-white to-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-black">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Big Picture
                </p>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Matrices are storyboards for transformations.
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Every operation either reorders, combines, or projects these stories. Picture each
                  row as a data point and each column as a feature. Operations remix those features
                  to reveal patterns, reduce noise, or solve systems.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">Cheat Sheet</p>
                <ul className="mt-3 space-y-2">
                  <li>• Addition/Subtraction ⇒ element-wise blending</li>
                  <li>• Multiplication ⇒ row × column projections</li>
                  <li>• Transpose ⇒ axis flip for alignment</li>
                  <li>• Determinant ⇒ volume scaling + invertibility signal</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Operation Flow Deck
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Zoom into how each move works.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {operationFlows.map((flow) => (
                <article
                  key={flow.title}
                  className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-zinc-900 ${flow.accent}`}
                >
                  <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {flow.title}
                  </h4>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{flow.summary}</p>
                  <ol className="mt-4 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {flow.steps.map((step, idx) => (
                      <li key={step} className="flex items-start gap-2">
                        <span className="min-w-[1.25rem] rounded-full bg-zinc-200 px-1 text-center text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Visual Storyboard</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Follow a multiplication from inputs to output. Each highlighted dot represents the row–column
                pairing that fuels the final cell.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {storyBoard.map((matrix) => (
                  <MatrixCard key={matrix.label} {...matrix} />
                ))}
              </div>
              <p className="mt-4 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Interpretation
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Think of A as a set of row-wise questions and B as column-wise answers. Multiplication
                totals how strongly each question aligns with every answer.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Advanced Algorithms</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Tap a card to expand the math narrative and see how each algorithm reshapes your data.
              </p>
              <div className="mt-4 space-y-3">
                {advancedStages.map((stage) => {
                  const open = expandedStage === stage.id;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => toggleStage(stage.id)}
                      className={`w-full rounded-2xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white p-4 text-left transition-all hover:border-blue-300 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-900 ${
                        open ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                            {stage.title}
                          </h4>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{stage.details}</p>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {stage.highlight}
                        </span>
                      </div>
                      <div
                        className={`mt-3 grid overflow-hidden transition-all duration-300 ${
                          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="rounded-xl border border-dashed border-zinc-300 bg-white/80 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-300">
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            Deep Dive
                          </p>
                          <ul className="mt-2 space-y-2">
                            {stage.insights.map((insight) => (
                              <li key={insight} className="flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Linear Regression Storyline</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              The Linear Regression tab uses the same matrix ideas—X stores features, gradients walk across
              weights, and predictions are simply matrix multiplies.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {regressionFlow.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-white p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:from-blue-950/20 dark:to-zinc-900 dark:text-zinc-300"
                >
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">{item.label}</p>
                  <p className="mt-2">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Why visuals?</h4>
              <p className="mt-2">
                Operations feel abstract until you imagine each cell as a canvas pixel or dataset attribute.
                Keep this tab open while experimenting in the main Matrix Operations workspace to anchor
                the math in intuition.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Next steps</h4>
              <ul className="mt-2 space-y-2">
                <li>• Try building your own matrices in the Home tab, then revisit these diagrams.</li>
                <li>• Jump into the Linear Regression tab to see matrices in machine-learning mode.</li>
                <li>• Explore Advanced Operations to witness PCA, SVD, and QR in action.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
  );
}

interface MatrixCardProps {
  label: string;
  data: number[][];
  accent: string;
}

function MatrixCard({ label, data, accent }: MatrixCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className={`text-xs font-semibold uppercase tracking-wide ${accent}`}>{label}</p>
      <div className="mt-2 space-y-1 rounded-lg bg-zinc-50 p-3 text-sm font-mono text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
        {data.map((row, idx) => (
          <div key={`${label}-${idx}`} className="flex gap-2">
            {row.map((value, colIdx) => (
              <span
                key={`${label}-${idx}-${colIdx}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm shadow-sm dark:bg-zinc-800"
              >
                {value}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

