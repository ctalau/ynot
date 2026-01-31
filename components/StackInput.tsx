'use client'

interface StackInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export default function StackInput({ value, onChange, onClear }: StackInputProps) {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900 dark:text-white">Obfuscated Stack Trace</label>
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          Clear
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full min-h-48 sm:min-h-56 lg:min-h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        placeholder="Paste your obfuscated Java stack trace here..."
        spellCheck={false}
      />
    </div>
  )
}
