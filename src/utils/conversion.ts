/**
 * Utility functions for converting Java type signatures and method signatures
 * Based on yGuard's Conversion class
 */

/**
 * Convert JVM type descriptor to Java type string
 * Examples:
 *   "I" -> "int"
 *   "[I" -> "int[]"
 *   "Ljava/lang/String;" -> "java.lang.String"
 */
export function toJavaType(type: string): string {
  let arrayDim = 0;

  // Count array dimensions
  while (arrayDim < type.length && type[arrayDim] === '[') {
    arrayDim++;
  }

  type = type.substring(arrayDim);

  let result = '';

  if (type.length === 0) {
    return '';
  }

  switch (type[0]) {
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
      // Class type
      const className = type.substring(1, type.length - 1);
      if (className.indexOf('<') >= 0) {
        // Handle generic types
        const genericStart = className.indexOf('<');
        const genericEnd = className.lastIndexOf('>');
        const baseName = className.substring(0, genericStart);
        const genericParams = className.substring(genericStart + 2, genericEnd - 1);
        result = baseName.replace(/\//g, '.') + '<' + toJavaParameters(genericParams) + '>';
      } else {
        result = className.replace(/\//g, '.');
      }
      break;
    }
    default:
      throw new Error('Unknown type: ' + type);
  }

  // Append array brackets
  for (let i = 0; i < arrayDim; i++) {
    result += '[]';
  }

  return result;
}

/**
 * Convert JVM method arguments string to Java parameter list
 */
export function toJavaParameters(parameters: string): string {
  if (parameters.length === 0) {
    return '';
  }

  const result: string[] = [];
  let i = 0;

  while (i < parameters.length) {
    // Handle wildcard/bound types
    if (parameters[i] === '+') {
      result.push('? extends ' + toJavaParameters(parameters.substring(i + 1)));
      break;
    }
    if (parameters[i] === '-') {
      result.push('? super ' + toJavaParameters(parameters.substring(i + 1)));
      break;
    }
    if (parameters[i] === '*') {
      result.push('?');
      i++;
      if (i < parameters.length && parameters[i] !== ',' && parameters[i] !== ';') {
        result.push(', ' + toJavaParameters(parameters.substring(i)));
      }
      break;
    }

    // Handle type parameters
    if (parameters[i] === 'T') {
      const semiIndex = parameters.indexOf(';', i);
      if (semiIndex >= 0) {
        result.push(parameters.substring(i + 1, semiIndex));
        i = semiIndex + 1;
        if (i < parameters.length) {
          result.push(', ');
        }
      } else {
        break;
      }
      continue;
    }

    // Regular type
    let j = i;
    while (j < parameters.length && parameters[j] === '[') {
      j++;
    }

    if (j < parameters.length) {
      if (parameters[j] === 'L') {
        // Find semicolon
        const semiIndex = parameters.indexOf(';', j);
        if (semiIndex >= 0) {
          result.push(toJavaType(parameters.substring(i, semiIndex + 1)));
          i = semiIndex + 1;
        } else {
          break;
        }
      } else {
        // Primitive type
        result.push(toJavaType(parameters.substring(i, j + 1)));
        i = j + 1;
      }

      if (i < parameters.length && parameters[i] !== ';' && parameters[i] !== '>') {
        result.push(', ');
      }
    } else {
      break;
    }
  }

  return result.join('');
}

/**
 * Format a method signature as Java method declaration
 */
export function toJavaMethod(name: string, signature: string): string {
  const openParen = signature.indexOf('(');
  const closeParen = signature.indexOf(')');

  if (openParen < 0 || closeParen < 0) {
    return name + '()';
  }

  const args = signature.substring(openParen + 1, closeParen);
  const ret = signature.substring(closeParen + 1);

  const returnType = toJavaType(ret);
  const params = args.length > 0 ? toJavaArguments(args) : '';

  return `${returnType} ${name}(${params})`;
}

/**
 * Convert method arguments to parameter list
 */
export function toJavaArguments(args: string): string {
  const result: string[] = [];
  let i = 0;

  while (i < args.length) {
    let j = i;
    while (j < args.length && args[j] === '[') {
      j++;
    }

    if (j < args.length) {
      if (args[j] === 'L') {
        const semiIndex = args.indexOf(';', j);
        if (semiIndex >= 0) {
          result.push(toJavaType(args.substring(i, semiIndex + 1)));
          i = semiIndex + 1;
        } else {
          break;
        }
      } else {
        result.push(toJavaType(args.substring(i, j + 1)));
        i = j + 1;
      }
    } else {
      break;
    }
  }

  return result.join(', ');
}

/**
 * Convert classfile format to Java class format
 * Example: "com/example/MyClass" -> "com.example.MyClass"
 */
export function toJavaClass(className: string): string {
  if (className.endsWith('.class')) {
    className = className.substring(0, className.length - 6);
  }
  return className.replace(/\//g, '.');
}
