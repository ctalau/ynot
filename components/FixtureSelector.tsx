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
    <div className="card">
      <h3 className="card__title">Load Example Fixture</h3>
      <div className="card__row">
        <div className="form-field">
          <label className="form-label">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedFixture('')
            }}
            className="select"
          >
            <option value="">Select a category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Fixture</label>
          <select
            value={selectedFixture}
            onChange={(e) => setSelectedFixture(e.target.value)}
            disabled={!selectedCategory}
            className="select"
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
          className="button button--success"
        >
          Load
        </button>
      </div>
      {selectedFixture && (
        <p className="helper-text">
          {fixtures.find(f => f.id === selectedFixture)?.description}
        </p>
      )}
    </div>
  )
}
