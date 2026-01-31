// Re-export the deobfuscator for use in the web app
// Using direct imports to avoid Next.js module resolution issues
import { DOMParser } from '@xmldom/xmldom';
if (typeof globalThis.DOMParser === 'undefined') {
  globalThis.DOMParser = DOMParser as any;
}

import { parseMappingXml } from '../src/mapping/parser'
import { YGuardDeobfuscator } from '../src/deobfuscator/index'

export { parseMappingXml }

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
