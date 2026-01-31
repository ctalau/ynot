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
    <div className="panel">
      <div className="panel__header">
        <label className="panel__label">Deobfuscated Output</label>
        {value && !error && (
          <div className="panel__actions">
            <button
              onClick={handleCopy}
              className="link-button"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={handleDownload}
              className="link-button"
            >
              Download
            </button>
          </div>
        )}
      </div>
      {error ? (
        <div className="error-box">
          <p className="error-box__title">Error:</p>
          <pre className="error-box__message">{error}</pre>
        </div>
      ) : (
        <textarea
          value={value}
          readOnly
          className="textarea textarea--output"
          placeholder="Deobfuscated output will appear here..."
          spellCheck={false}
        />
      )}
    </div>
  )
}
