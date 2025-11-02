'use client';

interface MatrixInputProps {
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  error?: boolean;
  isValid?: boolean;
  valueCount?: number;
}

export default function MatrixInput({
  value,
  onChange,
  onReset,
  error = false,
  isValid = false,
  valueCount = 0,
}: MatrixInputProps) {
  return (
    <div className="w-full mb-8">
      <label htmlFor="matrix-input" className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
        Matrix Values
      </label>
      <input
        id="matrix-input"
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onReset?.();
        }}
        placeholder="e.g., 1, 2, 3, 4, 5, 6"
        className={`w-full px-4 py-3 rounded-lg border ${
          error
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-500'
            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900'
        } text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Please enter valid comma-separated numbers
        </p>
      )}
      {isValid && valueCount > 0 && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {valueCount} value{valueCount !== 1 ? 's' : ''} entered
        </p>
      )}
    </div>
  );
}

