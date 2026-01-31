# yGuard TypeScript Deobfuscator

A TypeScript implementation of the yGuard deobfuscator for translating obfuscated Java stack traces back to their original form.

## Features

- ✅ Package, class, and method deobfuscation
- ✅ Inner class support (with `$` delimiter)
- ✅ Method overloading support
- ✅ Line number descrambling
- ✅ Module-qualified names (Java 9+)
- ✅ Obfuscation prefix handling
- ✅ Zero runtime dependencies
- ✅ Works in Node.js and browsers
- ✅ Full TypeScript support

## Installation

```bash
npm install ynot
```

## Usage

### Basic Usage

```typescript
import { deobfuscate } from 'ynot';

const obfuscatedStackTrace = `
at A.A.A.A.A()
at A.A.A.B$C.A()
`;

const mappingXml = `
<yguard version="1.5">
  <map>
    <package name="com.example" map="A"/>
    <class name="com.example.MyClass" map="A"/>
    <method class="com.example.MyClass" name="void run()" map="A"/>
  </map>
</yguard>
`;

const deobfuscated = deobfuscate(obfuscatedStackTrace, mappingXml);
console.log(deobfuscated);
// Output:
// at com.example.MyClass.run(MyClass.java:0)
// at com.example.OuterClass$InnerClass.run(OuterClass.java:0)
```

### Advanced Usage

```typescript
import { parseMappingXml, YGuardDeobfuscator } from 'ynot';

// Parse mapping file once
const tree = parseMappingXml(mappingXmlContent);

// Reuse deobfuscator for multiple stack traces
const deobfuscator = new YGuardDeobfuscator(tree);

// Deobfuscate array of lines
const lines = [
  'at A.A.A.A.A()',
  'at A.A.A.B.A()',
];
const translated = deobfuscator.translate(lines);

// Or translate individual lines
const singleLine = deobfuscator.translateLine('at A.A.A.A.A()');
```

## API

### `deobfuscate(stackTrace, mappingXml)`

Convenience function to deobfuscate a stack trace.

**Parameters:**
- `stackTrace`: `string | string[]` - Obfuscated stack trace (string or array of lines)
- `mappingXml`: `string` - yGuard XML mapping file content

**Returns:** `string | string[]` - Deobfuscated stack trace (same type as input)

### `parseMappingXml(xmlContent)`

Parse a yGuard XML mapping file.

**Parameters:**
- `xmlContent`: `string` - XML mapping file content

**Returns:** `MappingTree` - Parsed mapping tree

### `YGuardDeobfuscator`

Main deobfuscator class.

**Constructor:**
- `new YGuardDeobfuscator(tree: MappingTree)`

**Methods:**
- `translate(lines: string[]): string[]` - Translate array of lines
- `translateLine(line: string): string` - Translate single line

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import type {
  StackTraceElement,
  MappingTree,
  PackageStruct,
  ClassStruct,
  MethodStruct
} from 'ynot';
```

## Testing

```bash
npm test          # Run tests
npm run build     # Build library
npm run typecheck # Type check
```

## License

MIT

## Credits

Based on the original Java implementation from [yWorks/yGuard](https://github.com/yWorks/yGuard/).
