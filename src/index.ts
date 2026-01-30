/**
 * yGuard TypeScript Deobfuscator
 *
 * Main library entry point for stack trace deobfuscation using yGuard mapping files
 */

export { YGuardDeobfuscator } from './deobfuscator';
export { YGuardMappingParser } from './mapping/parser';
export { StackTraceParser } from './stack/parser';

export type {
  StackTraceElement,
  DeobfuscatedStackTraceElement,
  MappedSymbol,
  PackageMapping,
  ClassMapping,
  MethodMapping,
  FieldMapping,
  YGuardMapping,
  DeobfuscationResult,
} from './types';
