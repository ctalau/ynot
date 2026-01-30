/**
 * Represents a single stack trace frame
 */
export interface StackTraceElement {
  className: string;
  methodName: string;
  fileName: string;
  lineNumber: number;
}

/**
 * Represents a deobfuscated stack trace element
 */
export interface DeobfuscatedStackTraceElement extends StackTraceElement {
  originalClassName: string;
  originalMethodName: string;
}

/**
 * Represents a mapping for a named entity (package, class, method, field)
 */
export interface MappedSymbol {
  name: string;
  mappedName: string;
}

/**
 * Represents a package mapping
 */
export interface PackageMapping extends MappedSymbol {
  classes: Map<string, ClassMapping>;
}

/**
 * Represents a class mapping
 */
export interface ClassMapping extends MappedSymbol {
  methods: Map<string, MethodMapping>;
  fields: Map<string, FieldMapping>;
  innerClasses: Map<string, ClassMapping>;
}

/**
 * Represents a method mapping (may include signature for overloading)
 */
export interface MethodMapping extends MappedSymbol {
  signature?: string; // Optional JVM method signature
}

/**
 * Represents a field mapping
 */
export interface FieldMapping extends MappedSymbol {}

/**
 * Represents parsed yGuard mapping file
 */
export interface YGuardMapping {
  version: string;
  packages: Map<string, PackageMapping>;
  ownerProperties: Map<string, Record<string, string>>;
}

/**
 * Result of deobfuscating a stack trace
 */
export interface DeobfuscationResult {
  originalStack: string;
  deobfuscatedStack: string;
  frames: DeobfuscatedStackTraceElement[];
  errors: string[];
}
