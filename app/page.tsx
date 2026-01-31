'use client'

import { useState } from 'react'
import StackInput from '@/components/StackInput'
import MappingInput from '@/components/MappingInput'
import ResultDisplay from '@/components/ResultDisplay'
import FixtureSelector from '@/components/FixtureSelector'
import { deobfuscate } from '@/lib/deobfuscator'
import type { FixtureMetadata } from '@/lib/fixtures'

export default function Home() {
  const [stackTrace, setStackTrace] = useState('')
  const [mapping, setMapping] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDeobfuscate = () => {
    if (!stackTrace || !mapping) {
      setError('Please provide both a stack trace and a mapping file.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const deobfuscated = deobfuscate(stackTrace, mapping)
      setResult(typeof deobfuscated === 'string' ? deobfuscated : deobfuscated.join('\n'))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during deobfuscation')
      setResult('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearAll = () => {
    setStackTrace('')
    setMapping('')
    setResult('')
    setError('')
  }

  const handleLoadFixture = async (fixture: FixtureMetadata) => {
    setIsLoading(true)
    setError('')

    try {
      const [stackResponse, mappingResponse] = await Promise.all([
        fetch(fixture.stackPath),
        fetch(fixture.mappingPath),
      ])

      if (!stackResponse.ok || !mappingResponse.ok) {
        throw new Error('Failed to load fixture files')
      }

      const stackContent = await stackResponse.text()
      const mappingContent = await mappingResponse.text()

      setStackTrace(stackContent)
      setMapping(mappingContent)
      setResult('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fixture')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            yNot
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Deobfuscate Java stack traces obfuscated by yGuard
          </p>
        </div>

        {/* Fixture Selector */}
        <div className="mb-6">
          <FixtureSelector onLoadFixture={handleLoadFixture} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StackInput
            value={stackTrace}
            onChange={setStackTrace}
            onClear={() => setStackTrace('')}
          />
          <MappingInput
            value={mapping}
            onChange={setMapping}
            onClear={() => setMapping('')}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleDeobfuscate}
            disabled={isLoading || !stackTrace || !mapping}
            className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg font-medium shadow-md disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Deobfuscate'}
          </button>
          <button
            onClick={handleClearAll}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg font-medium shadow-md transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Result Display */}
        <ResultDisplay value={result} error={error} />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            TypeScript implementation of yGuard deobfuscator. All processing happens in your browser.
          </p>
          <p className="mt-1">
            Based on{' '}
            <a
              href="https://github.com/yWorks/yGuard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              yWorks/yGuard
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
