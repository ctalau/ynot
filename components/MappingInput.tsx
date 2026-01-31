'use client'

import { useRef } from 'react'

interface MappingInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export default function MappingInput({ value, onChange, onClear }: MappingInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        onChange(content)
      }
      reader.readAsText(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        onChange(content)
      }
      reader.readAsText(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
  }

  return (
    <div className="panel">
      <div className="panel__header">
        <label className="panel__label">Mapping File (XML)</label>
        <div className="panel__actions">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="link-button"
          >
            Upload File
          </button>
          <button
            onClick={onClear}
            className="link-button link-button--muted"
          >
            Clear
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml"
        onChange={handleFileUpload}
        className="visually-hidden"
      />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="textarea"
        placeholder="Paste your yGuard mapping XML here or drag & drop a file..."
        spellCheck={false}
      />
    </div>
  )
}
