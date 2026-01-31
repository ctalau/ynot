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
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900 dark:text-white">Mapping File (XML)</label>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Upload File
          </button>
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
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
        className="hidden"
      />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex-1 w-full min-h-48 sm:min-h-56 lg:min-h-64 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        placeholder="Paste your yGuard mapping XML here or drag & drop a file..."
        spellCheck={false}
      />
    </div>
  )
}
