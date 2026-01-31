'use client'

import { fixtures, getFixtureCategories, getFixturesByCategory, type FixtureMetadata } from '@/lib/fixtures'
import { useState } from 'react'

interface FixtureSelectorProps {
  onLoadFixture: (fixture: FixtureMetadata) => void
}

export default function FixtureSelector({ onLoadFixture }: FixtureSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedFixture, setSelectedFixture] = useState<string>('')

  const categories = getFixtureCategories()
  const categoryFixtures = selectedCategory ? getFixturesByCategory(selectedCategory) : []

  const handleLoad = () => {
    const fixture = fixtures.find(f => f.id === selectedFixture)
    if (fixture) {
      onLoadFixture(fixture)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <h3 className="text-sm font-semibold">Load Example Fixture</h3>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedFixture('')
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select a category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Fixture</label>
          <select
            value={selectedFixture}
            onChange={(e) => setSelectedFixture(e.target.value)}
            disabled={!selectedCategory}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          >
            <option value="">Select a fixture...</option>
            {categoryFixtures.map(fixture => (
              <option key={fixture.id} value={fixture.id}>{fixture.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleLoad}
          disabled={!selectedFixture}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded shadow-sm disabled:cursor-not-allowed"
        >
          Load
        </button>
      </div>
      {selectedFixture && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {fixtures.find(f => f.id === selectedFixture)?.description}
        </p>
      )}
    </div>
  )
}
