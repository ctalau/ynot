// Fixture metadata for the web UI
export interface FixtureMetadata {
  id: string
  name: string
  category: string
  description: string
  stackPath: string
  mappingPath: string
  expectedPath: string
}

export const fixtures: FixtureMetadata[] = [
  // Common Mappings
  {
    id: 'common-001',
    name: 'Basic Class/Method Deobfuscation',
    category: 'Common Mappings',
    description: 'Simple class FQN and inner classes',
    stackPath: '/fixtures/common-mappings/input.txt',
    mappingPath: '/fixtures/common-mappings/mapping.xml',
    expectedPath: '/fixtures/common-mappings/expected.txt',
  },

  // Invalid Mappings
  {
    id: 'invalid-001',
    name: 'Missing Mappings (No Prefix)',
    category: 'Invalid Mappings',
    description: 'Graceful handling of missing mappings without prefix',
    stackPath: '/fixtures/invalid-mappings/001-no-prefix-input.txt',
    mappingPath: '/fixtures/invalid-mappings/001-no-prefix-mapping.xml',
    expectedPath: '/fixtures/invalid-mappings/001-no-prefix-expected.txt',
  },
  {
    id: 'invalid-002',
    name: 'Missing Mappings (With Prefix)',
    category: 'Invalid Mappings',
    description: 'Graceful handling of missing mappings with prefix',
    stackPath: '/fixtures/invalid-mappings/002-with-prefix-input.txt',
    mappingPath: '/fixtures/invalid-mappings/002-with-prefix-mapping.xml',
    expectedPath: '/fixtures/invalid-mappings/002-with-prefix-expected.txt',
  },

  // Leading Dollar Sign
  {
    id: 'leading-dollar-001',
    name: 'Dollar Sign in Names (FQN)',
    category: 'Leading Dollar',
    description: 'Classes and methods starting with $',
    stackPath: '/fixtures/leading-dollar/001-qualified-name-input.txt',
    mappingPath: '/fixtures/leading-dollar/001-qualified-name-mapping.xml',
    expectedPath: '/fixtures/leading-dollar/001-qualified-name-expected.txt',
  },
  {
    id: 'leading-dollar-002',
    name: 'Dollar Sign in Stack Traces',
    category: 'Leading Dollar',
    description: 'Stack traces with $ prefixed names',
    stackPath: '/fixtures/leading-dollar/002-stacktrace-input.txt',
    mappingPath: '/fixtures/leading-dollar/002-stacktrace-mapping.xml',
    expectedPath: '/fixtures/leading-dollar/002-stacktrace-expected.txt',
  },

  // Module Qualified
  {
    id: 'module-001',
    name: 'Module Qualified Names (FQN)',
    category: 'Module Qualified',
    description: 'Java 9+ module-qualified names',
    stackPath: '/fixtures/module-qualified/001-qualified-name-input.txt',
    mappingPath: '/fixtures/module-qualified/001-qualified-name-mapping.xml',
    expectedPath: '/fixtures/module-qualified/001-qualified-name-expected.txt',
  },
  {
    id: 'module-002',
    name: 'Module Qualified Stack Traces',
    category: 'Module Qualified',
    description: 'Stack traces with module qualification',
    stackPath: '/fixtures/module-qualified/002-stacktrace-input.txt',
    mappingPath: '/fixtures/module-qualified/002-stacktrace-mapping.xml',
    expectedPath: '/fixtures/module-qualified/002-stacktrace-expected.txt',
  },

  // Prefixed
  {
    id: 'prefixed-001',
    name: 'Prefixed Names (FQN)',
    category: 'Prefixed',
    description: 'Names with obfuscation prefix',
    stackPath: '/fixtures/prefixed/001-qualified-name-input.txt',
    mappingPath: '/fixtures/prefixed/001-qualified-name-mapping.xml',
    expectedPath: '/fixtures/prefixed/001-qualified-name-expected.txt',
  },
  {
    id: 'prefixed-002',
    name: 'Prefixed Stack Traces',
    category: 'Prefixed',
    description: 'Stack traces with prefix',
    stackPath: '/fixtures/prefixed/002-stacktrace-input.txt',
    mappingPath: '/fixtures/prefixed/002-stacktrace-mapping.xml',
    expectedPath: '/fixtures/prefixed/002-stacktrace-expected.txt',
  },

  // Overload
  {
    id: 'overload-001',
    name: 'Overloaded Methods (FQN)',
    category: 'Overload',
    description: 'Method overloading deobfuscation',
    stackPath: '/fixtures/overload/001-qualified-name-input.txt',
    mappingPath: '/fixtures/overload/001-qualified-name-mapping.xml',
    expectedPath: '/fixtures/overload/001-qualified-name-expected.txt',
  },
  {
    id: 'overload-002',
    name: 'Overloaded Methods (Stack Trace)',
    category: 'Overload',
    description: 'Stack traces with overloaded methods',
    stackPath: '/fixtures/overload/002-stacktrace-input.txt',
    mappingPath: '/fixtures/overload/002-stacktrace-mapping.xml',
    expectedPath: '/fixtures/overload/002-stacktrace-expected.txt',
  },
]

export function getFixtureCategories(): string[] {
  const categories = new Set(fixtures.map(f => f.category))
  return Array.from(categories).sort()
}

export function getFixturesByCategory(category: string): FixtureMetadata[] {
  return fixtures.filter(f => f.category === category)
}
