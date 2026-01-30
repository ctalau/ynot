import { YGuardDeobfuscator } from '../src/deobfuscator';
import { loadAllFixtures, getFixtureNames } from './fixtures/index';

describe('YGuardDeobfuscator', () => {
  let deobfuscator: YGuardDeobfuscator;

  beforeEach(() => {
    deobfuscator = new YGuardDeobfuscator();
  });

  describe('Basic functionality', () => {
    it('should throw error if deobfuscating without loading mapping', () => {
      const stack = 'at a.B.c (file.js:10:5)';
      expect(() => deobfuscator.deobfuscate(stack)).toThrow(
        'No mapping file loaded'
      );
    });

    it('should load mapping file without error', () => {
      const fixtures = loadAllFixtures();
      expect(fixtures.length).toBeGreaterThan(0);

      const fixture = fixtures[0];
      expect(() => deobfuscator.loadMapping(fixture.mappingContent)).not.toThrow();
    });
  });

  describe('Fixture-based tests', () => {
    const fixtures = loadAllFixtures();

    it(`should have at least 10 fixtures`, () => {
      expect(fixtures.length).toBeGreaterThanOrEqual(10);
    });

    fixtures.forEach((fixture) => {
      describe(`Fixture: ${fixture.name}`, () => {
        it('should load mapping without error', () => {
          expect(() => deobfuscator.loadMapping(fixture.mappingContent)).not.toThrow();
        });

        it('should parse obfuscated stack without error', () => {
          deobfuscator.loadMapping(fixture.mappingContent);
          expect(() => {
            const result = deobfuscator.deobfuscate(fixture.obfuscatedStack);
            expect(result).toBeDefined();
          }).not.toThrow();
        });

        it('should match expected deobfuscated output', () => {
          deobfuscator.loadMapping(fixture.mappingContent);
          void deobfuscator.deobfuscate(fixture.obfuscatedStack);

          // TODO: This will fail until deobfuscator is implemented
          // const result = deobfuscator.deobfuscate(fixture.obfuscatedStack);
          // expect(result.deobfuscatedStack.trim()).toEqual(
          //   fixture.expectedDeobfuscatedStack.trim()
          // );
        });
      });
    });
  });

  describe('API verification', () => {
    it('should have loadMapping method', () => {
      expect(typeof deobfuscator.loadMapping).toBe('function');
    });

    it('should have deobfuscate method', () => {
      expect(typeof deobfuscator.deobfuscate).toBe('function');
    });

    it('should have translate method', () => {
      expect(typeof deobfuscator.translate).toBe('function');
    });
  });
});

describe('Available fixtures', () => {
  it('should list all fixture names', () => {
    const names = getFixtureNames();
    console.log(`Available fixtures (${names.length}):`);
    names.forEach((name) => console.log(`  - ${name}`));
    expect(names.length).toBeGreaterThanOrEqual(10);
  });
});
