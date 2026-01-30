import { StackTraceElement } from '../types';

/**
 * Parser for stack traces in various formats (V8, Firefox, Java, JRockit)
 */
export class StackTraceParser {
  /**
   * Parse a stack trace string into individual frames
   */
  parseStackTrace(_stackTrace: string): StackTraceElement[] {
    // TODO: Implement stack trace parsing with multiple format support
    // For now, return empty array
    return [];
  }

  /**
   * Parse a single stack frame
   */
  parseFrame(_line: string): StackTraceElement | null {
    // TODO: Implement frame parsing
    return null;
  }
}
