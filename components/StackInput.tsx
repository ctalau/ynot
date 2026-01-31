'use client'

interface StackInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export default function StackInput({ value, onChange, onClear }: StackInputProps) {
  return (
    <div className="panel">
      <div className="panel__header">
        <label className="panel__label">Obfuscated Stack Trace</label>
        <button
          onClick={onClear}
          className="link-button link-button--muted"
        >
          Clear
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="textarea"
        placeholder="Paste your obfuscated Java stack trace here..."
        spellCheck={false}
      />
    </div>
  )
}
