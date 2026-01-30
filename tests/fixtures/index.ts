import * as fs from 'fs';
import * as path from 'path';

/**
 * Represents a single test fixture
 */
export interface Fixture {
  name: string;
  mappingContent: string;
  obfuscatedStack: string;
  expectedDeobfuscatedStack: string;
}

/**
 * Load all fixtures from the fixtures directory
 */
export function loadAllFixtures(): Fixture[] {
  const fixturesDir = __dirname;
  const fixtures: Fixture[] = [];

  // Get all .xml files (mapping files)
  const xmlFiles = fs
    .readdirSync(fixturesDir)
    .filter((file) => file.endsWith('.xml'));

  for (const xmlFile of xmlFiles) {
    const baseName = xmlFile.replace('.xml', '');

    // Check if corresponding .txt and .deobfuscated.txt files exist
    const txtFile = path.join(fixturesDir, `${baseName}.txt`);
    const deobfuscatedFile = path.join(fixturesDir, `${baseName}.deobfuscated.txt`);

    if (fs.existsSync(txtFile) && fs.existsSync(deobfuscatedFile)) {
      const mappingPath = path.join(fixturesDir, xmlFile);
      const mappingContent = fs.readFileSync(mappingPath, 'utf-8');
      const obfuscatedStack = fs.readFileSync(txtFile, 'utf-8');
      const expectedDeobfuscatedStack = fs.readFileSync(deobfuscatedFile, 'utf-8');

      fixtures.push({
        name: baseName,
        mappingContent,
        obfuscatedStack,
        expectedDeobfuscatedStack,
      });
    }
  }

  return fixtures.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Load a specific fixture by name
 */
export function loadFixture(name: string): Fixture | null {
  const fixturesDir = __dirname;
  const xmlPath = path.join(fixturesDir, `${name}.xml`);
  const txtPath = path.join(fixturesDir, `${name}.txt`);
  const deobfuscatedPath = path.join(fixturesDir, `${name}.deobfuscated.txt`);

  if (!fs.existsSync(xmlPath) || !fs.existsSync(txtPath) || !fs.existsSync(deobfuscatedPath)) {
    return null;
  }

  const mappingContent = fs.readFileSync(xmlPath, 'utf-8');
  const obfuscatedStack = fs.readFileSync(txtPath, 'utf-8');
  const expectedDeobfuscatedStack = fs.readFileSync(deobfuscatedPath, 'utf-8');

  return {
    name,
    mappingContent,
    obfuscatedStack,
    expectedDeobfuscatedStack,
  };
}

/**
 * Get list of available fixture names
 */
export function getFixtureNames(): string[] {
  const fixturesDir = __dirname;
  const xmlFiles = fs
    .readdirSync(fixturesDir)
    .filter((file) => file.endsWith('.xml'));

  return xmlFiles
    .map((file) => file.replace('.xml', ''))
    .filter((baseName) => {
      const txtPath = path.join(fixturesDir, `${baseName}.txt`);
      const deobfuscatedPath = path.join(fixturesDir, `${baseName}.deobfuscated.txt`);
      return fs.existsSync(txtPath) && fs.existsSync(deobfuscatedPath);
    })
    .sort();
}
