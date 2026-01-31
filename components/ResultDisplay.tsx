'use client'

interface ResultDisplayProps {
  value: string
  error?: string
}

export default function ResultDisplay({ value, error }: ResultDisplayProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
  }

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'deobfuscated-stacktrace.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Deobfuscated Output</label>
        {value && !error && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={handleDownload}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Download
            </button>
          </div>
        )}
      </div>
      {error ? (
        <div className="w-full h-64 p-3 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400 font-semibold mb-2">Error:</p>
          <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{error}</pre>
        </div>
      ) : (
        <textarea
          value={value}
          readOnly
          className="w-full h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-y"
          placeholder="Deobfuscated output will appear here..."
          spellCheck={false}
        />
      )}
    </div>
  )
}
