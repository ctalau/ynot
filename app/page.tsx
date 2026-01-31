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
    <main className="page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            yNot
          </h1>
          <p className="page-subtitle">
            Deobfuscate Java stack traces obfuscated by yGuard
          </p>
        </div>

        {/* Fixture Selector */}
        <div className="section">
          <FixtureSelector onLoadFixture={handleLoadFixture} />
        </div>

        {/* Main Grid */}
        <div className="split-grid">
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
        <div className="actions">
          <button
            onClick={handleDeobfuscate}
            disabled={isLoading || !stackTrace || !mapping}
            className="button button--primary"
          >
            {isLoading ? 'Processing...' : 'Deobfuscate'}
          </button>
          <button
            onClick={handleClearAll}
            className="button button--secondary"
          >
            Clear All
          </button>
        </div>

        {/* Result Display */}
        <ResultDisplay value={result} error={error} />

        {/* Footer */}
        <div className="footer">
          <p>
            TypeScript implementation of yGuard deobfuscator. All processing happens in your browser.
          </p>
          <p>
            Based on{' '}
            <a
              href="https://github.com/yWorks/yGuard"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              yWorks/yGuard
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
