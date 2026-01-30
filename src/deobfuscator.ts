import { DeobfuscationResult, DeobfuscatedStackTraceElement, YGuardMapping, StackTraceElement } from './types';
import { YGuardMappingParser } from './mapping/parser';
import { StackTraceParser } from './stack/parser';
import { LineNumberScrambler } from './utils/line-number-scrambler';

/**
 * Main deobfuscator class that coordinates mapping parsing and stack trace deobfuscation
 */
export class YGuardDeobfuscator {
  private mapping: YGuardMapping | null = null;
  private mappingParser: YGuardMappingParser;
  private stackParser: StackTraceParser;

  constructor() {
    this.mappingParser = new YGuardMappingParser();
    this.stackParser = new StackTraceParser();
  }

  /**
   * Load mapping file content (XML format)
   */
  loadMapping(mappingContent: string): void {
    this.mapping = this.mappingParser.parse(mappingContent);
  }

  /**
   * Deobfuscate a stack trace string
   */
  deobfuscate(stackTrace: string): DeobfuscationResult {
    if (!this.mapping) {
      throw new Error('No mapping file loaded. Call loadMapping() first.');
    }

    const errors: string[] = [];
    const frames = this.stackParser.parseStackTrace(stackTrace);

    // Translate each frame using mapping
    const deobfuscatedFrames: DeobfuscatedStackTraceElement[] = [];
    for (const frame of frames) {
      try {
        const translated = this.translateFrame(frame);
        deobfuscatedFrames.push(translated);
      } catch (e) {
        errors.push(`Error translating frame ${frame.className}.${frame.methodName}: ${e}`);
        deobfuscatedFrames.push({
          ...frame,
          originalClassName: frame.className,
          originalMethodName: frame.methodName,
        });
      }
    }

    // Format deobfuscated frames back to string
    const deobfuscatedStack = this.formatFrames(deobfuscatedFrames, stackTrace);

    return {
      originalStack: stackTrace,
      deobfuscatedStack,
      frames: deobfuscatedFrames,
      errors,
    };
  }

  /**
   * Translate a single stack frame
   */
  private translateFrame(frame: StackTraceElement): DeobfuscatedStackTraceElement {
    if (!this.mapping) {
      throw new Error('No mapping loaded');
    }

    // Look up class mapping
    let originalClassName = frame.className;
    let originalMethodName = frame.methodName;
    let originalLineNumber = frame.lineNumber;

    // Try to find the obfuscated class in mapping
    for (const [fqn, classNode] of this.mapping.packages) {
      // Simple string matching for now
      if (this.matchesObfuscated(frame.className, fqn)) {
        originalClassName = fqn;

        // Try to find method mapping
        const methods = (classNode as any).methods;
        if (methods) {
          for (const [methodName, methodNode] of methods) {
            if (methodName === frame.methodName || this.methodMatches(frame.methodName, methodName)) {
              originalMethodName = methodNode.name || methodName;
              break;
            }
          }
        }

        // Try to unscramble line number if property is set
        if (originalLineNumber > 0) {
          const props = this.mapping.ownerProperties.get(originalClassName);
          if (props && props['scrambling-salt']) {
            try {
              const salt = parseInt(props['scrambling-salt'], 10);
              const seed = salt ^ this.hashCode(originalClassName.replace('$', '.'));
              const scrambler = new LineNumberScrambler(3584, seed);
              originalLineNumber = scrambler.unscramble(originalLineNumber);
            } catch (_e) {
              // Silently fail on line number unscrambling
            }
          }
        }

        break;
      }
    }

    return {
      className: frame.className,
      methodName: frame.methodName,
      fileName: frame.fileName,
      lineNumber: frame.lineNumber,
      originalClassName,
      originalMethodName,
    };
  }

  /**
   * Translate a fully qualified class or method name
   */
  translate(name: string): string {
    if (!this.mapping) {
      throw new Error('No mapping file loaded. Call loadMapping() first.');
    }

    // Simple implementation: look for direct mapping
    for (const [fqn, classNode] of this.mapping.packages) {
      if (fqn === name) {
        return (classNode as any).mappedName || name;
      }
    }

    return name;
  }

  private matchesObfuscated(_obfuscated: string, _original: string): boolean {
    // This is a simplified matching. In reality, we'd need to track the mapping better
    // For now, just check if the obfuscated name is a "translation" of the original
    // In a real implementation, we'd have a reverse mapping

    // Simple case: check if they match directly in mapping
    // This will be improved in Phase 4

    // For now, return false - we'll need better mapping tracking
    // This is addressed in the full implementation
    return false;
  }

  private methodMatches(obfuscated: string, mapped: string): boolean {
    // Simple matching: if they're the same, it's a match
    // In a full implementation, we'd check signatures too
    return obfuscated === mapped;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  private formatFrames(frames: DeobfuscatedStackTraceElement[], original: string): string {
    // For now, just return a formatted string
    // This can be improved to match the exact original format
    const lines: string[] = [];

    for (const frame of frames) {
      const className = frame.originalClassName || frame.className;
      const methodName = frame.originalMethodName || frame.methodName;
      const fileName = frame.fileName;
      const lineNumber = frame.lineNumber;

      if (fileName && lineNumber > 0) {
        lines.push(`    at ${className}.${methodName} (${fileName}:${lineNumber})`);
      } else if (fileName) {
        lines.push(`    at ${className}.${methodName} (${fileName})`);
      } else {
        lines.push(`    at ${className}.${methodName} (Unknown Source)`);
      }
    }

    // If there's no frames, return original
    if (lines.length === 0) {
      return original;
    }

    // Extract header from original (everything before first "at")
    const atIndex = original.indexOf('    at');
    const header = atIndex > 0 ? original.substring(0, atIndex) : '';

    return header + lines.join('\n');
  }
}
