/**
 * Main deobfuscator for yGuard obfuscated stack traces
 * Ported from YGuardLogParser.java
 */

import type { StackTraceElement, ClassStruct, MethodStruct } from '../types/index.js';
import { MappingTree } from '../mapping/parser.js';
import { LineNumberScrambler } from './lineNumberScrambler.js';
import {
  parseStackTraceLine,
  findFQNs,
  convertUnicodeEscapes,
  formatStackTraceElement,
} from '../parser/stackTrace.js';

/**
 * Main deobfuscator class
 */
export class YGuardDeobfuscator {
  private tree: MappingTree;

  constructor(tree: MappingTree) {
    this.tree = tree;
  }

  /**
   * Translate an array of stack trace lines
   */
  translate(lines: string[]): string[] {
    return lines.map((line) => this.translateLine(line));
  }

  /**
   * Translate a single line
   */
  translateLine(line: string): string {
    // Apply Unicode escape conversion
    line = convertUnicodeEscapes(line);

    // Try to parse as stack trace element
    const ste = parseStackTraceLine(line);
    if (ste) {
      return this.translateStackTraceElement(ste);
    }

    // Fall back to FQN replacement
    return this.translateFQNs(line);
  }

  /**
   * Translate fully qualified names in a line
   */
  private translateFQNs(line: string): string {
    const fqns = findFQNs(line);
    let result = line;

    // Replace FQNs in reverse order (to handle overlapping matches)
    for (let i = fqns.length - 1; i >= 0; i--) {
      const fqn = fqns[i];
      const translated = this.translateFQN(fqn);
      if (translated !== fqn) {
        result = result.replace(fqn, translated);
      }
    }

    return result;
  }

  /**
   * Translate a fully qualified name
   */
  private translateFQN(fqn: string): string {
    try {
      // Handle module-qualified names (Java 9+): "module/class.method"
      const slashIndex = fqn.indexOf('/');
      let moduleName = '';
      if (slashIndex > 0) {
        moduleName = fqn.substring(0, slashIndex + 1);
        fqn = fqn.substring(slashIndex + 1);
      }

      // Tokenize on . and $ to navigate the tree
      const tokens = fqn.split(/[.$]/);
      const delimiters = fqn.match(/[.$]/g) || [];

      let node: any = this.tree.root;
      const translatedTokens: string[] = [];

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const delimiter = i < delimiters.length ? delimiters[i] : '';

        // Try to find matching node (prefer exact match on mapped name)
        let child = this.tree.findChild(node, token, 'package', true);
        if (!child) {
          child = this.tree.findChild(node, token, 'class', true);
        }

        if (child) {
          // Found a mapping - use original name
          translatedTokens.push(child.data.name);
          node = child;
        } else {
          // No mapping found - use token as-is
          translatedTokens.push(token);

          // Try to navigate anyway (for unmapped intermediate nodes)
          const nextChild = this.tree.findChild(node, token, 'package', false);
          if (nextChild) {
            node = nextChild;
          } else {
            const classChild = this.tree.findChild(node, token, 'class', false);
            if (classChild) {
              node = classChild;
            }
          }
        }

        // Add delimiter
        if (i < delimiters.length) {
          translatedTokens.push(delimiter);
        }
      }

      return moduleName + translatedTokens.join('');
    } catch (e) {
      // If translation fails, return original
      return fqn;
    }
  }

  /**
   * Translate a stack trace element
   */
  private translateStackTraceElement(ste: StackTraceElement): string {
    try {
      // Split class name into package and class
      const className = ste.className;
      let packageName: string | null = null;
      let simpleClassName: string;

      const lastDot = className.lastIndexOf('.');
      if (lastDot < 0) {
        simpleClassName = className;
      } else {
        packageName = className.substring(0, lastDot);
        simpleClassName = className.substring(lastDot + 1);
      }

      // Translate package name
      const translatedPackage = packageName ? this.translatePackageName(packageName) : null;

      // Translate class name (including inner classes)
      const translatedClass = this.translateClassName(
        packageName,
        simpleClassName,
        translatedPackage
      );

      // Build full translated class name
      const fullTranslatedClass = translatedPackage
        ? translatedPackage + '.' + translatedClass
        : translatedClass;

      // Translate method name
      const translatedMethod = this.translateMethodName(
        fullTranslatedClass,
        ste.methodName
      );

      // Descramble line number if needed
      // If no line number in input, default to 0
      let translatedLineNumber = ste.lineNumber !== undefined ? ste.lineNumber : 0;
      if (translatedLineNumber > 0) {
        translatedLineNumber = this.descrambleLineNumber(
          fullTranslatedClass,
          translatedLineNumber
        );
      }

      // Build filename from class name
      const fileName = this.buildFileName(translatedClass);

      // Build translated stack trace element
      const translatedSte: StackTraceElement = {
        prefix: ste.prefix,
        className: fullTranslatedClass,
        methodName: translatedMethod,
        fileName: fileName,
        lineNumber: translatedLineNumber,
        suffix: ste.suffix,
      };

      return formatStackTraceElement(translatedSte);
    } catch (e) {
      // If translation fails, return original
      return formatStackTraceElement(ste);
    }
  }

  /**
   * Translate package name
   */
  private translatePackageName(packageName: string): string {
    const tokens = packageName.split('.');
    const translatedTokens: string[] = [];
    let node: any = this.tree.root;

    for (const token of tokens) {
      const child = this.tree.findChild(node, token, 'package', true);
      if (child) {
        translatedTokens.push(child.data.name);
        node = child;
      } else {
        // No mapping found
        translatedTokens.push(token);
        // Try to continue navigation
        const unmappedChild = this.tree.findChild(node, token, 'package', false);
        if (unmappedChild) {
          node = unmappedChild;
        }
      }
    }

    return translatedTokens.join('.');
  }

  /**
   * Translate class name (including inner classes)
   */
  private translateClassName(
    packageName: string | null,
    className: string,
    translatedPackage: string | null
  ): string {
    const packageNode = this.tree.getPackageNode(translatedPackage || packageName || '');

    if (className.indexOf('$') > 0) {
      // Handle inner classes
      const tokens = className.split('$');
      const translatedTokens: string[] = [];
      let node: any = packageNode;

      for (const token of tokens) {
        const child = this.tree.findChild<ClassStruct>(node, token, 'class', true);
        if (child) {
          translatedTokens.push(child.data.name);
          node = child;
        } else {
          translatedTokens.push(token);
          // Try to continue navigation
          const unmappedChild = this.tree.findChild<ClassStruct>(node, token, 'class', false);
          if (unmappedChild) {
            node = unmappedChild;
          }
        }
      }

      return translatedTokens.join('$');
    } else {
      // Simple class name
      const child = this.tree.findChild<ClassStruct>(packageNode, className, 'class', true);
      if (child) {
        return child.data.name;
      }
      return className;
    }
  }

  /**
   * Translate method name
   */
  private translateMethodName(
    translatedClassName: string,
    obfuscatedMethodName: string
  ): string {
    try {
      // Get the class node (use translated class name)
      const classNode = this.tree.getClassNode(translatedClassName, false);

      // Find methods with matching mapped name
      const matchingMethods: string[] = [];
      for (const child of classNode.children) {
        const childData = child.data as any;
        if (childData.type === 'method') {
          const methodData = child.data as MethodStruct;
          // Extract just the method name from signature (strip return type and parameters)
          const mappedMethodName = this.extractMethodName(methodData.mappedName);
          if (mappedMethodName === obfuscatedMethodName) {
            // Also extract method name from original signature
            const originalMethodName = this.extractMethodName(methodData.name);
            matchingMethods.push(originalMethodName);
          }
        }
      }

      if (matchingMethods.length > 0) {
        // If multiple methods match (overloads), join with |
        return matchingMethods.join('|');
      }

      // No mapping found
      return obfuscatedMethodName;
    } catch (e) {
      return obfuscatedMethodName;
    }
  }

  /**
   * Extract method name from signature
   * "void methodName(args)" -> "methodName"
   */
  private extractMethodName(signature: string): string {
    // Remove return type (everything before last space)
    const lastSpace = signature.lastIndexOf(' ');
    if (lastSpace > 0) {
      signature = signature.substring(lastSpace + 1);
    }

    // Remove parameters
    const parenIndex = signature.indexOf('(');
    if (parenIndex > 0) {
      signature = signature.substring(0, parenIndex);
    }

    return signature;
  }

  /**
   * Descramble line number
   */
  private descrambleLineNumber(className: string, lineNumber: number): number {
    try {
      // Get properties for this class
      const properties = this.tree.properties[className];
      if (!properties) {
        return lineNumber;
      }

      const saltString = properties['scrambling-salt'];
      if (!saltString) {
        return lineNumber;
      }

      // Calculate seed: salt XOR className.hashCode()
      const salt = parseInt(saltString, 10);
      const seed = salt ^ this.hashCode(className.replace(/\$/g, '.'));

      // Create scrambler and unscramble
      const scrambler = new LineNumberScrambler(3584, seed);
      return scrambler.unscramble(lineNumber);
    } catch (e) {
      return lineNumber;
    }
  }

  /**
   * Java-compatible hashCode implementation
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Build filename from class name
   * "OuterClass$InnerClass" -> "OuterClass.java"
   */
  private buildFileName(className: string): string {
    const dollarIndex = className.indexOf('$');
    if (dollarIndex > 0) {
      className = className.substring(0, dollarIndex);
    }
    return className + '.java';
  }
}
