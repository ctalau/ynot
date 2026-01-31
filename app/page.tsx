'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [debugInfo, setDebugInfo] = useState({
    tailwindApplied: false,
    stylesheetCount: 0,
    nextCssCount: 0,
    stylesheetHrefs: [] as string[],
    inlineStylesheetCount: 0,
    probeBackgroundColor: '',
    userAgent: '',
    cssBytes: 0,
    cssHasBgBlue: false,
    cssFetchError: '',
    errorMessage: '',
  })
  const tailwindProbeRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const inspectStyles = async () => {
      try {
        const styleSheets = Array.from(document.styleSheets)
        const stylesheetHrefs = styleSheets
          .map((sheet) => sheet.href)
          .filter((href): href is string => Boolean(href))
        const inlineStylesheetCount = styleSheets.length - stylesheetHrefs.length
        const nextCssCount = styleSheets.filter((sheet) =>
          sheet.href?.includes('/_next/static/css')
        ).length
        const tailwindApplied =
          tailwindProbeRef.current !== null &&
          window.getComputedStyle(tailwindProbeRef.current).display === 'none'
        const probeBackgroundColor =
          tailwindProbeRef.current !== null
            ? window.getComputedStyle(tailwindProbeRef.current).backgroundColor
            : ''

        let cssBytes = 0
        let cssHasBgBlue = false
        let cssFetchError = ''

        if (stylesheetHrefs.length > 0) {
          try {
            const response = await fetch(stylesheetHrefs[0])
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`)
            }
            const cssText = await response.text()
            cssBytes = cssText.length
            cssHasBgBlue = cssText.includes('bg-blue-600') || cssText.includes('.bg-blue-600')
          } catch (err) {
            cssFetchError = err instanceof Error ? err.message : 'Failed to fetch stylesheet'
          }
        }

        setDebugInfo({
          tailwindApplied,
          stylesheetCount: styleSheets.length,
          nextCssCount,
          stylesheetHrefs,
          inlineStylesheetCount,
          probeBackgroundColor,
          userAgent: navigator.userAgent,
          cssBytes,
          cssHasBgBlue,
          cssFetchError,
          errorMessage: '',
        })
      } catch (err) {
        setDebugInfo({
          tailwindApplied: false,
          stylesheetCount: 0,
          nextCssCount: 0,
          stylesheetHrefs: [],
          inlineStylesheetCount: 0,
          probeBackgroundColor: '',
          userAgent: navigator.userAgent,
          cssBytes: 0,
          cssHasBgBlue: false,
          cssFetchError: '',
          errorMessage:
            err instanceof Error ? err.message : 'Unable to inspect stylesheets',
        })
      }
    }

    void inspectStyles()
  }, [])

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
        const failures: string[] = []
        if (!stackResponse.ok) {
          failures.push(`stack trace (${fixture.stackPath}) [${stackResponse.status} ${stackResponse.statusText}]`)
        }
        if (!mappingResponse.ok) {
          failures.push(`mapping (${fixture.mappingPath}) [${mappingResponse.status} ${mappingResponse.statusText}]`)
        }
        throw new Error(`Failed to load fixture files: ${failures.join('; ')}`)
      }

      const stackContent = await stackResponse.text()
      const mappingContent = await mappingResponse.text()

      setStackTrace(stackContent)
      setMapping(mappingContent)
      setResult('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load fixture: ${fixture.name}`)
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
          <details className="mt-4 rounded-lg border border-gray-200/70 bg-white/70 p-4 text-left text-xs text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">
              Debug styling info
            </summary>
            <div className="mt-3 space-y-1">
              <p>
                Tailwind applied:{' '}
                <span className="font-medium">
                  {debugInfo.tailwindApplied ? 'Yes' : 'No'}
                </span>
              </p>
              <p>
                Stylesheets detected:{' '}
                <span className="font-medium">{debugInfo.stylesheetCount}</span>
              </p>
              <p>
                Inline stylesheets:{' '}
                <span className="font-medium">{debugInfo.inlineStylesheetCount}</span>
              </p>
              <p>
                Next CSS bundles:{' '}
                <span className="font-medium">{debugInfo.nextCssCount}</span>
              </p>
              <p>
                Probe background:{' '}
                <span className="font-medium">{debugInfo.probeBackgroundColor || 'n/a'}</span>
              </p>
              <p>
                CSS bytes:{' '}
                <span className="font-medium">{debugInfo.cssBytes || 'n/a'}</span>
              </p>
              <p>
                CSS includes .bg-blue-600:{' '}
                <span className="font-medium">
                  {debugInfo.cssHasBgBlue ? 'Yes' : 'No'}
                </span>
              </p>
              {debugInfo.cssFetchError && (
                <p className="text-red-500">CSS fetch error: {debugInfo.cssFetchError}</p>
              )}
              <p className="break-all">
                User agent:{' '}
                <span className="font-medium">{debugInfo.userAgent}</span>
              </p>
              {debugInfo.stylesheetHrefs.length > 0 && (
                <div>
                  <p className="font-semibold">Stylesheet URLs:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    {debugInfo.stylesheetHrefs.map((href) => (
                      <li key={href} className="break-all">
                        {href}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {debugInfo.errorMessage && (
                <p className="text-red-500">Error: {debugInfo.errorMessage}</p>
              )}
            </div>
          </details>
        </div>
      </div>
      <span
        ref={tailwindProbeRef}
        className="pointer-events-none absolute left-0 top-0 h-2 w-2 bg-blue-600 opacity-0"
        aria-hidden="true"
      />
    </main>
  )
}
