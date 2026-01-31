/**
 * Conversion utilities for Java signatures and types
 * Ported from Conversion.java
 */

/**
 * Converts a class name from internal format to Java format
 * Example: "com/example/MyClass.class" -> "com.example.MyClass"
 */
export function toJavaClass(className: string): string {
  if (className.endsWith('.class')) {
    className = className.substring(0, className.length - 6);
  }
  return className.replace(/\//g, '.');
}

/**
 * Converts a JVM type descriptor to Java type string
 * Example: "[Ljava/lang/String;" -> "java.lang.String[]"
 */
export function toJavaType(type: string): string {
  let result = '';
  let arraydim = 0;

  // Count array dimensions
  while (type.charAt(arraydim) === '[') arraydim++;
  type = type.substring(arraydim);

  // Parse base type
  switch (type.charAt(0)) {
    case 'B':
      result = 'byte';
      break;
    case 'C':
      result = 'char';
      break;
    case 'D':
      result = 'double';
      break;
    case 'F':
      result = 'float';
      break;
    case 'I':
      result = 'int';
      break;
    case 'J':
      result = 'long';
      break;
    case 'S':
      result = 'short';
      break;
    case 'Z':
      result = 'boolean';
      break;
    case 'V':
      result = 'void';
      break;
    case 'L': {
      // Object type: "Ljava/lang/String;" -> "java.lang.String"
      let className = type.substring(1, type.length - 1);

      // Handle generics
      if (className.indexOf('<') >= 0) {
        const parameters = type.substring(
          className.indexOf('<') + 2,
          className.lastIndexOf('>') - 1
        );
        className = className.substring(0, className.indexOf('<'));
        result = className.replace(/\//g, '.');
        result += '<';
        result += toJavaParameters(parameters);
        result += '>';
      } else {
        result = className.replace(/\//g, '.');
      }
      break;
    }
    default:
      throw new Error(`Unknown native type: ${type}`);
  }

  // Add array brackets
  for (let i = 0; i < arraydim; i++) {
    result += '[]';
  }

  return result;
}

/**
 * Converts generic parameters to Java format
 */
export function toJavaParameters(parameters: string): string {
  if (!parameters) return '';

  let result = '';

  switch (parameters.charAt(0)) {
    case '+':
      result = '? extends ' + toJavaParameters(parameters.substring(1));
      break;
    case '-':
      result = '? super ' + toJavaParameters(parameters.substring(1));
      break;
    case '*':
      result = '*';
      if (parameters.length > 1) {
        result += ', ' + toJavaParameters(parameters.substring(1));
      }
      break;
    case 'B':
      result = 'byte';
      break;
    case 'C':
      result = 'char';
      break;
    case 'D':
      result = 'double';
      break;
    case 'F':
      result = 'float';
      break;
    case 'I':
      result = 'int';
      break;
    case 'J':
      result = 'long';
      break;
    case 'S':
      result = 'short';
      break;
    case 'Z':
      result = 'boolean';
      break;
    case 'V':
      result = 'void';
      break;
    case 'T': {
      const index = parameters.indexOf(';');
      result = parameters.substring(1, index);
      if (parameters.length > index) {
        result += ', ';
        result += parameters.substring(index);
      }
      break;
    }
    default:
      throw new Error(`Unknown native type: ${parameters.charAt(0)}`);
  }

  return result;
}

/**
 * Converts method signature to Java format
 * Example: "methodName", "(Ljava/lang/String;)V" -> "void methodName(java.lang.String)"
 */
export function toJavaMethod(name: string, signature: string): string {
  const argsonly = signature.substring(signature.indexOf('(') + 1);
  let ret = signature.substring(signature.indexOf(')') + 1);
  ret = toJavaType(ret);

  let args = '(';
  const closeParenIndex = argsonly.indexOf(')');
  if (closeParenIndex > 0) {
    const argString = argsonly.substring(0, closeParenIndex);
    args += toJavaArguments(argString);
  }
  args += ')';

  return ret + ' ' + name + args;
}

/**
 * Converts method arguments descriptor to Java format
 */
export function toJavaArguments(args: string): string {
  const result: string[] = [];
  let pos = 0;
  let arg = '';

  while (pos < args.length) {
    // Count array dimensions
    while (args.charAt(pos) === '[') {
      arg += '[';
      pos++;
    }

    if (args.charAt(pos) === 'L') {
      // Object type - read until semicolon
      while (args.charAt(pos) !== ';') {
        arg += args.charAt(pos);
        pos++;
      }
      arg += ';';
      result.push(toJavaType(arg));
      arg = '';
      pos++;
    } else {
      // Primitive type - single character
      arg += args.charAt(pos);
      result.push(toJavaType(arg));
      arg = '';
      pos++;
    }
  }

  return result.join(', ');
}
