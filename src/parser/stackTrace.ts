/**
 * Stack trace parsing utilities
 * Ported from YGuardLogParser.java
 */

import type { StackTraceElement } from '../types/index.js';

/**
 * Regex patterns for parsing stack traces
 * Based on YGuardLogParser.java patterns
 */

// JRockit pattern (most specific)
const JROCKIT_PATTERN =
  /(.*\s+)?([^;()\s]+)\.([^;()\s]+)\(([^)]*)\)(.+)\(([^:)]+)(?::(\d*))?\)(.*)/;

// Standard Java stack trace element pattern
const STE_PATTERN = /(.*\s+)?([^(\s]+)\.([^(\s]+)\(([^:)]*)(?::(\d*))?\)(.*)/;

// Fully qualified name pattern (least specific)
const FQN_PATTERN = /([^:;()\s]+\.)+([^:;()\s]+)/;

/**
 * Parse a single line of stack trace
 * Returns parsed element or null if no match
 */
export function parseStackTraceLine(line: string): StackTraceElement | null {
  // Try JRockit pattern first
  let match = line.match(JROCKIT_PATTERN);
  if (match) {
    return {
      prefix: match[1] || '',
      className: match[2],
      methodName: match[3],
      fileName: match[6],
      lineNumber: match[7] ? parseInt(match[7], 10) : undefined,
      suffix: match[8] || '',
    };
  }

  // Try standard stack trace element pattern
  match = line.match(STE_PATTERN);
  if (match) {
    return {
      prefix: match[1] || '',
      className: match[2],
      methodName: match[3],
      fileName: match[4],
      lineNumber: match[5] ? parseInt(match[5], 10) : undefined,
      suffix: match[6] || '',
    };
  }

  return null;
}

/**
 * Find all fully qualified names in a line
 * Used when stack trace pattern doesn't match
 */
export function findFQNs(line: string): string[] {
  const fqns: string[] = [];
  let match;
  const regex = new RegExp(FQN_PATTERN, 'g');

  while ((match = regex.exec(line)) !== null) {
    fqns.push(match[0]);
  }

  return fqns;
}

/**
 * Convert Unicode escape sequences (&#NNNN;) to actual characters
 * Java uses this for non-ASCII characters
 */
export function convertUnicodeEscapes(str: string): string {
  return str.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 10));
  });
}

/**
 * Build formatted stack trace element string
 */
export function formatStackTraceElement(ste: StackTraceElement): string {
  let result = ste.prefix || '';
  result += ste.className;
  result += '.';
  result += ste.methodName;
  result += '(';

  if (ste.fileName) {
    result += ste.fileName;
    if (ste.lineNumber !== undefined) {
      result += ':';
      result += ste.lineNumber;
    }
  }

  result += ')';
  result += ste.suffix || '';

  return result;
}
