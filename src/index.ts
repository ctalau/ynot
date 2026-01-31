/**
 * yGuard TypeScript Deobfuscator
 * Main entry point
 */

// Polyfill DOMParser for Node.js environment
import { DOMParser } from '@xmldom/xmldom';
if (typeof globalThis.DOMParser === 'undefined') {
  globalThis.DOMParser = DOMParser as any;
}

import { parseMappingXml } from './mapping/parser';
import { YGuardDeobfuscator } from './deobfuscator/index';

export { parseMappingXml, MappingTree } from './mapping/parser';
export { YGuardDeobfuscator } from './deobfuscator/index';
export { LineNumberScrambler } from './deobfuscator/lineNumberScrambler';
export * from './deobfuscator/conversion';
export * from './parser/stackTrace';
export * from './types/index';

/**
 * Convenience function to deobfuscate a stack trace
 * @param stackTrace Stack trace lines (array or string)
 * @param mappingXml yGuard mapping XML content
 * @returns Deobfuscated stack trace
 */
export function deobfuscate(
  stackTrace: string | string[],
  mappingXml: string
): string | string[] {
  const tree = parseMappingXml(mappingXml);
  const deobfuscator = new YGuardDeobfuscator(tree);

  if (typeof stackTrace === 'string') {
    const lines = stackTrace.split('\n');
    const translated = deobfuscator.translate(lines);
    return translated.join('\n');
  } else {
    return deobfuscator.translate(stackTrace);
  }
}
