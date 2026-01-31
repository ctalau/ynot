/**
 * Type definitions for yGuard deobfuscator
 * Based on YGuardLogParser.java from yWorks/yGuard
 */

/**
 * Represents a mapped element (package, class, method, or field)
 */
export interface Mapped {
  /** Original name before obfuscation */
  name: string;
  /** Obfuscated/mapped name */
  mappedName: string;
}

/**
 * Package mapping structure
 */
export interface PackageStruct extends Mapped {
  type: 'package';
}

/**
 * Class mapping structure
 */
export interface ClassStruct extends Mapped {
  type: 'class';
}

/**
 * Method mapping structure
 */
export interface MethodStruct extends Mapped {
  type: 'method';
  signature?: string;
}

/**
 * Field mapping structure
 */
export interface FieldStruct extends Mapped {
  type: 'field';
}

/**
 * Tree node structure for hierarchical mapping
 */
export interface TreeNode<T extends Mapped = Mapped> {
  data: T;
  children: TreeNode[];
  parent?: TreeNode;
}

/**
 * Properties map for class-specific settings (e.g., scrambling-salt)
 */
export type PropertyMap = Record<string, Record<string, string>>;

/**
 * Stack trace element structure
 */
export interface StackTraceElement {
  prefix?: string;
  className: string;
  methodName: string;
  fileName?: string;
  lineNumber?: number;
  suffix?: string;
}

/**
 * Deobfuscation result
 */
export interface DeobfuscationResult {
  /** Original obfuscated input */
  original: string;
  /** Deobfuscated output */
  translated: string;
  /** Whether translation was successful */
  success: boolean;
}
