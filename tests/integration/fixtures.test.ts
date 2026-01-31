/**
 * Integration tests using fixtures from the Java reference implementation
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { deobfuscate } from '../../src/index.js';

const FIXTURES_DIR = join(process.cwd(), 'fixtures');

type FixtureEntry = {
  category: string;
  path: string;
  mappingFile: string;
  inputFile: string;
  expectedFile: string;
};

/**
 * Get all fixture entries
 */
function getFixtureEntries(): FixtureEntry[] {
  const entries: FixtureEntry[] = [];

  const categories = readdirSync(FIXTURES_DIR).filter((name) => {
    const path = join(FIXTURES_DIR, name);
    return statSync(path).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = join(FIXTURES_DIR, category);

    // Check if this category has direct test files
    const files = readdirSync(categoryPath);
    if (files.includes('mapping.xml') && files.includes('input.txt')) {
      entries.push({
        category,
        path: categoryPath,
        mappingFile: 'mapping.xml',
        inputFile: 'input.txt',
        expectedFile: 'expected.txt',
      });
    } else {
      // Check for subdirectories with fixtures
      const subdirs = files.filter((name) => {
        const path = join(categoryPath, name);
        return statSync(path).isDirectory();
      });

      for (const subdir of subdirs) {
        const subdirPath = join(categoryPath, subdir);
        const subdirFiles = readdirSync(subdirPath);
        if (subdirFiles.includes('mapping.xml') && subdirFiles.includes('input.txt')) {
          entries.push({
            category: `${category}/${subdir}`,
            path: subdirPath,
            mappingFile: 'mapping.xml',
            inputFile: 'input.txt',
            expectedFile: 'expected.txt',
          });
        }
      }

      // If no subdirectories, this category dir itself is a fixture
      if (subdirs.length === 0) {
        const mappingFiles = files.filter((name) => name.endsWith('-mapping.xml'));
        for (const mappingFile of mappingFiles) {
          const prefix = mappingFile.replace(/-mapping\.xml$/, '');
          const inputFile = `${prefix}-input.txt`;
          const expectedFile = `${prefix}-expected.txt`;
          if (files.includes(inputFile) && files.includes(expectedFile)) {
            entries.push({
              category: `${category}/${prefix}`,
              path: categoryPath,
              mappingFile,
              inputFile,
              expectedFile,
            });
          }
        }
      }
    }
  }

  return entries;
}

/**
 * Load fixture files
 */
function loadFixture(
  fixturePath: string,
  mappingFile: string,
  inputFile: string,
  expectedFile: string
): {
  mapping: string;
  input: string[];
  expected: string[];
} {
  const mappingPath = join(fixturePath, mappingFile);
  const inputPath = join(fixturePath, inputFile);
  const expectedPath = join(fixturePath, expectedFile);

  const mapping = readFileSync(mappingPath, 'utf-8');
  const input = readFileSync(inputPath, 'utf-8').split('\n');
  const expected = readFileSync(expectedPath, 'utf-8').split('\n');

  return { mapping, input, expected };
}

describe('yGuard Deobfuscator - Fixture Tests', () => {
  const fixtures = getFixtureEntries();

  if (fixtures.length === 0) {
    it.skip('No fixtures found', () => {});
    return;
  }

  for (const fixture of fixtures) {
    it(`should deobfuscate: ${fixture.category}`, () => {
      const { mapping, input, expected } = loadFixture(
        fixture.path,
        fixture.mappingFile,
        fixture.inputFile,
        fixture.expectedFile
      );

      // Deobfuscate each input line
      const result = deobfuscate(input, mapping) as string[];

      // Compare line by line
      for (let i = 0; i < expected.length; i++) {
        const expectedLine = expected[i];
        const resultLine = result[i] || '';

        expect(resultLine.trim()).toBe(
          expectedLine.trim(),
          `Line ${i + 1} mismatch:\nExpected: ${expectedLine}\nGot: ${resultLine}`
        );
      }

      // Ensure same number of lines
      expect(result.length).toBe(expected.length);
    });
  }
});

describe('yGuard Deobfuscator - String Input', () => {
  it('should handle string input', () => {
    const fixtures = getFixtureEntries();
    if (fixtures.length === 0) return;

    const { mapping, input, expected } = loadFixture(
      fixtures[0].path,
      fixtures[0].mappingFile,
      fixtures[0].inputFile,
      fixtures[0].expectedFile
    );

    const inputStr = input.join('\n');
    const expectedStr = expected.join('\n');

    const result = deobfuscate(inputStr, mapping) as string;

    expect(result.trim()).toBe(expectedStr.trim());
  });
});
