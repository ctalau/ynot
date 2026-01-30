import { StackTraceElement } from '../types';

/**
 * Parser for stack traces in various formats (V8, Firefox, Java, JRockit)
 */
export class StackTraceParser {
  // Regex patterns for different stack trace formats
  private static readonly V8_PATTERN = /at\s+(.+?)\s+\(([^:]+):(\d+):(\d+)\)(.*)$/;
  private static readonly V8_PATTERN_NO_FILE = /at\s+(.+?)\s+\(unknown source\)(.*)$/i;
  private static readonly FIREFOX_PATTERN = /^(.+?)@([^:]+):(\d+):(\d+)(.*)$/;
  private static readonly JAVA_PATTERN = /at\s+([^(]+)\(([^)]*)\)(.*)$/;
  private static readonly JROCKIT_PATTERN = /^(.*\s+)?([^;()\\s]+)\.([^;()\\s]+)\(([^)]*)\)(.+)\(([^:)]+)(?::(\d*))?(.*)$/;

  /**
   * Parse a stack trace string into individual frames
   */
  parseStackTrace(stackTrace: string): StackTraceElement[] {
    const lines = stackTrace.split('\n');
    const frames: StackTraceElement[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      const frame = this.parseFrame(trimmed);
      if (frame) {
        frames.push(frame);
      }
    }

    return frames;
  }

  /**
   * Parse a single stack frame line
   */
  parseFrame(line: string): StackTraceElement | null {
    // Try V8 format first (most common)
    let match = StackTraceParser.V8_PATTERN.exec(line);
    if (match) {
      return this.parseV8Frame(match, line);
    }

    // Try V8 "unknown source" format
    match = StackTraceParser.V8_PATTERN_NO_FILE.exec(line);
    if (match) {
      return {
        className: this.extractClassName(match[1]),
        methodName: this.extractMethodName(match[1]),
        fileName: '',
        lineNumber: 0,
      };
    }

    // Try Firefox format
    match = StackTraceParser.FIREFOX_PATTERN.exec(line);
    if (match) {
      return this.parseFirefoxFrame(match);
    }

    // Try Java format
    match = StackTraceParser.JAVA_PATTERN.exec(line);
    if (match) {
      return this.parseJavaFrame(match);
    }

    // Try JRockit format
    match = StackTraceParser.JROCKIT_PATTERN.exec(line);
    if (match) {
      return this.parseJRockitFrame(match);
    }

    return null;
  }

  private parseV8Frame(match: RegExpExecArray, _line: string): StackTraceElement {
    const functionPart = match[1];
    const file = match[2];
    const lineNum = parseInt(match[3], 10);
    // const col = parseInt(match[4], 10);

    return {
      className: this.extractClassName(functionPart),
      methodName: this.extractMethodName(functionPart),
      fileName: file,
      lineNumber: lineNum,
    };
  }

  private parseFirefoxFrame(match: RegExpExecArray): StackTraceElement {
    const functionPart = match[1];
    const file = match[2];
    const lineNum = parseInt(match[3], 10);
    // const col = parseInt(match[4], 10);

    return {
      className: this.extractClassName(functionPart),
      methodName: this.extractMethodName(functionPart),
      fileName: file,
      lineNumber: lineNum,
    };
  }

  private parseJavaFrame(match: RegExpExecArray): StackTraceElement {
    const fullQName = match[1];
    const sourceInfo = match[2];

    const lastDot = fullQName.lastIndexOf('.');
    const className = lastDot >= 0 ? fullQName.substring(0, lastDot) : '';
    const methodName = lastDot >= 0 ? fullQName.substring(lastDot + 1) : fullQName;

    const lineNum = this.extractLineNumber(sourceInfo);

    return {
      className,
      methodName,
      fileName: this.extractFileName(sourceInfo),
      lineNumber: lineNum,
    };
  }

  private parseJRockitFrame(match: RegExpExecArray): StackTraceElement {
    // JRockit: module.Type.method(...)(source:line)
    const moduleAndType = match[2];
    const methodName = match[3];
    // const params = match[4];
    const source = match[6];
    const lineNum = match[7] ? parseInt(match[7], 10) : 0;

    return {
      className: moduleAndType,
      methodName,
      fileName: source,
      lineNumber: lineNum,
    };
  }

  private extractClassName(functionPart: string): string {
    const lastDot = functionPart.lastIndexOf('.');
    if (lastDot < 0) {
      return '';
    }
    return functionPart.substring(0, lastDot);
  }

  private extractMethodName(functionPart: string): string {
    const lastDot = functionPart.lastIndexOf('.');
    if (lastDot < 0) {
      return functionPart;
    }
    return functionPart.substring(lastDot + 1);
  }

  private extractFileName(sourceInfo: string): string {
    // Extract filename from "FileName.java:123" or "Unknown Source"
    const match = /([^:]+)/.exec(sourceInfo);
    return match ? match[1] : '';
  }

  private extractLineNumber(sourceInfo: string): number {
    const match = /:(\d+)/.exec(sourceInfo);
    return match ? parseInt(match[1], 10) : 0;
  }
}
