/**
 * Main deobfuscator for yGuard obfuscated stack traces
 * Ported from YGuardLogParser.java
 */

import type { StackTraceElement, ClassStruct, MethodStruct, TreeNode } from '../types/index';
import { MappingTree } from '../mapping/parser';
import { LineNumberScrambler } from './lineNumberScrambler';
import {
  parseStackTraceLine,
  findFQNs,
  convertUnicodeEscapes,
  formatStackTraceElement,
} from '../parser/stackTrace';

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
      const { modulePrefix, className } = this.splitModulePrefix(fqn);
      const translated = this.translateObfuscatedFqn(className);
      return modulePrefix + translated;
    } catch (e) {
      // If translation fails, return original
      return fqn;
    }
  }

  private translateObfuscatedFqn(fqn: string): string {
    let node: TreeNode | null = this.tree.root;
    let translated = '';
    let sb = '';
    let buildPrefix = true;
    const tokens = this.tokenizeWithDelimiters(fqn, ['.', '$']);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      sb += token;

      if (token === '.' || token === '$') {
        continue;
      }

      const hasNext = i < tokens.length - 1;
      const types = hasNext ? (['package', 'class'] as const) : (['class'] as const);
      const child = node ? this.findMappedChild(node, sb, [...types]) : null;

      if (!child) {
        if (buildPrefix && hasNext) {
          if (tokens[i + 1] === '.') {
            i += 1;
          }
          sb += '/';
          continue;
        }

        if (hasNext) {
          translated += sb.replace(/\//g, '.');
          translated += tokens.slice(i + 1).join('');
        } else if (buildPrefix) {
          translated += fqn;
        } else if (node && (node.data as any).type === 'class') {
          translated += this.translateMethodNameForNode(node, sb);
        } else {
          translated += sb.replace(/\//g, '.');
        }
        node = null;
        break;
      }

      buildPrefix = false;
      sb = '';
      node = child;
      translated += child.data.name;
      if (hasNext) {
        translated += tokens[i + 1];
        i += 1;
      }
    }

    return translated;
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

      const { modulePrefix, className: classNameWithoutModule } =
        this.splitModulePrefix(ste.className);
      const translation = this.translateStackTraceClassName(classNameWithoutModule);

      const fullTranslatedClass = modulePrefix + translation.translatedClassName;

      // Translate method name
      const translatedMethod = this.translateMethodNameForNode(
        translation.classNode,
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
      const fileName = translation.classNode ? this.buildFileName(translation.translatedClassName) : '';

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

  private translateStackTraceClassName(className: string): {
    translatedClassName: string;
    classNode: TreeNode<ClassStruct> | null;
  } {
    let classNode: TreeNode | null = this.tree.root;
    const dollarPos = className.indexOf('$');
    const normalizedDollarPos = dollarPos < 0 ? className.length : dollarPos;
    const lastDot = className.substring(0, normalizedDollarPos).lastIndexOf('.');

    const packageName = className.substring(0, lastDot + 1);
    const classAndInnerClassName = className.substring(lastDot + 1);
    let translated = '';

    let sb = '';
    let buildPrefix = packageName.length > 0;
    const packageTokens = this.tokenizeWithDelimiters(packageName, ['.']);
    for (let i = 0; i < packageTokens.length; i++) {
      const token = packageTokens[i];
      sb += token;

      if (token === '.') {
        continue;
      }

      const hasNext = i < packageTokens.length - 1;
      const child = classNode
        ? this.findMappedChild(classNode, sb, ['package'])
        : null;
      if (!child) {
        if (buildPrefix && hasNext) {
          if (packageTokens[i + 1] === '.') {
            i += 1;
          }
          sb += '/';
          continue;
        }
        classNode = null;
        break;
      }

      buildPrefix = false;
      sb = '';
      classNode = child;
      translated += child.data.name;
      if (hasNext) {
        translated += packageTokens[i + 1];
        i += 1;
      }
    }

    if (buildPrefix) {
      return { translatedClassName: className, classNode: null };
    }

    sb = '';
    const classTokens = this.tokenizeWithDelimiters(classAndInnerClassName, ['$', '.']);
    for (let i = 0; i < classTokens.length; i++) {
      const token = classTokens[i];
      sb += token;

      if (token === '$' || token === '.') {
        continue;
      }

      const hasNext = i < classTokens.length - 1;
      const child = classNode
        ? this.findMappedChild(classNode, sb, ['class'])
        : null;
      if (!child) {
        translated += sb + classTokens.slice(i + 1).join('');
        classNode = null;
        sb = '';
        break;
      }

      classNode = child;
      translated += child.data.name;
      sb = '';
      if (hasNext) {
        translated += classTokens[i + 1];
        i += 1;
      }
    }

    if (sb) {
      translated += sb;
    }

    return {
      translatedClassName: translated,
      classNode: classNode as TreeNode<ClassStruct> | null,
    };
  }

  /**
   * Translate method name
   */
  private translateMethodName(
    translatedClassName: string,
    obfuscatedMethodName: string
  ): string {
    try {
      const classNode = this.tree.getClassNode(translatedClassName, false);
      return this.translateMethodNameForNode(classNode, obfuscatedMethodName);
    } catch (e) {
      return obfuscatedMethodName;
    }
  }

  private translateMethodNameForNode(
    classNode: TreeNode | null,
    obfuscatedMethodName: string
  ): string {
    if (!classNode) {
      return obfuscatedMethodName;
    }

    const matchingMethods: string[] = [];
    for (const child of classNode.children) {
      const childData = child.data as any;
      if (childData.type === 'method') {
        const methodData = child.data as MethodStruct;
        const mappedMethodName = this.formatMethodName(methodData.mappedName);
        if (mappedMethodName === obfuscatedMethodName) {
          const originalMethodName = this.formatMethodName(methodData.name);
          matchingMethods.push(originalMethodName);
        }
      }
    }

    if (matchingMethods.length > 0) {
      return matchingMethods.join('|');
    }

    return obfuscatedMethodName;
  }

  /**
   * Extract method name from signature
   * "void methodName(args)" -> "methodName"
   */
  private formatMethodName(signature: string): string {
    let name = signature;
    const braceIndex = name.indexOf('(');
    if (braceIndex > 0 && name.indexOf(')') === braceIndex + 1) {
      name = name.substring(0, braceIndex);
    }
    const spaceIndex = name.lastIndexOf(
      ' ',
      braceIndex < 0 ? name.length : braceIndex
    );
    if (spaceIndex > 0) {
      name = name.substring(spaceIndex + 1);
    }
    return name;
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
    const lastDot = className.lastIndexOf('.');
    if (lastDot > -1) {
      className = className.substring(lastDot + 1);
    }
    return className + '.java';
  }

  private splitModulePrefix(className: string): { modulePrefix: string; className: string } {
    const lastSlash = className.lastIndexOf('/');
    if (lastSlash >= 0) {
      return {
        modulePrefix: className.substring(0, lastSlash + 1),
        className: className.substring(lastSlash + 1),
      };
    }
    return { modulePrefix: '', className };
  }

  private tokenizeWithDelimiters(value: string, delimiters: string[]): string[] {
    if (!value) {
      return [];
    }
    const escaped = delimiters.map((delimiter) => `\\${delimiter}`).join('');
    const regex = new RegExp(`([${escaped}])`);
    return value.split(regex).filter((token) => token.length > 0);
  }

  private findMappedChild(
    node: TreeNode,
    name: string,
    types: Array<'package' | 'class' | 'method' | 'field'>
  ): TreeNode | null {
    for (const child of node.children) {
      const childData = child.data as any;
      if (types.includes(childData.type) && child.data.mappedName === name) {
        return child as TreeNode;
      }
    }
    return null;
  }

}
