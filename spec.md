# yGuard TypeScript Deobfuscator - Project Specification

## Project Overview

**ynot** is a TypeScript port of the yGuard deobfuscator, enabling JavaScript stack trace deobfuscation using yGuard mapping files. This project aims to provide both a programmatic library and a web-based interface for deobfuscating obfuscated stack traces.

## Goals

1. **Port Core Functionality**: Translate the Java YGuardLogParser implementation to TypeScript while maintaining compatibility with yGuard mapping files
2. **Comprehensive Testing**: Establish a robust test suite based on real-world obfuscated stack traces and mapping files
3. **Production-Ready Library**: Create a reusable TypeScript library for stack trace deobfuscation
4. **User-Friendly Interface**: Develop a web-based UI (Next.js) for interactive stack trace deobfuscation
5. **Maintainability**: Ensure the codebase is well-documented and easy to extend

## Technical Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Web Interface (Next.js)                   │
│         - Paste/Upload mapping files                        │
│         - Paste/Drop stack traces                           │
│         - Load test fixtures                                │
│         - Display deobfuscated results                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Core Deobfuscator Library (TypeScript)          │
│         - YGuard mapping file parser                        │
│         - Stack trace parser                                │
│         - Symbol resolver/deobfuscator                      │
│         - Result formatter                                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Classes to Port from Java

**Core Classes**:
- **YGuardLogParser**: Main parser class for handling obfuscated logs, XML parsing, and symbol resolution
- **MyStackTraceElement**: Represents a single stack trace frame (className, methodName, fileName, lineNumber)
- **MyContentHandler**: SAX ContentHandler for parsing XML mapping files (build internal tree structure)

**Mapping Structure Classes** (inner classes in YGuardLogParser):
- **Mapped** (interface): Base interface for mappable objects with getName/getMappedName
- **AbstractMappedStruct**: Base class implementing Mapped interface
- **PackageStruct**: Represents obfuscated → original package name mappings
- **ClassStruct**: Represents obfuscated → original class name mappings
- **MethodStruct**: Represents obfuscated → original method name mappings
- **FieldStruct**: Represents obfuscated → original field name mappings

**Utility Classes**:
- **CharConverter**: Converts HTML numeric character entities (e.g., `&#123;` → `{`)
- **Conversion**: Converts Java type signatures and method signatures
  - `toJavaClass()`: Convert classfile format to Java class format
  - `toJavaType()`: Convert JVM type descriptor to Java type string
  - `toJavaArguments()`: Convert JVM method arguments to Java parameter list
  - `toJavaMethod()`: Format a complete method signature

**Related Classes** (from ObfuscatorTask):
- **LineNumberScrambler**: Unscrambles line numbers based on salt and seed
  - Constructor takes array size and seed
  - `unscramble(lineNumber)`: Reverses line number scrambling

**Internal Data Structures**:
- **Tree Structure**: DefaultMutableTreeNode tree representing hierarchical package→class→method/field mappings
- **Owner Properties Map**: Stores class properties including scrambling-salt for line number recovery

## Implementation Phases

### Phase 1: Research & Test Fixtures

**Objective**: Understand yGuard format and collect comprehensive test data

**Tasks**:
1. Clone https://github.com/yWorks/yGuard/
2. Read and analyze `src/main/java/com/yworks/yguard/YGuardLogParser.java`
3. Identify key data structures and algorithms
4. Collect test fixtures:
   - Find or generate obfuscated stack traces
   - Find or generate corresponding mapping files
   - Save as pairs: `fixtures/{name}.txt` (obfuscated stack) and `fixtures/{name}.xml` (mapping file)
5. Run Java implementation on each fixture and save results:
   - `fixtures/{name}.deobfuscated.txt` (expected output)
6. Commit fixtures with results for reference

**Deliverables**:
- Minimum 10 test fixtures (prioritize variety: different stack types, edge cases)
- Documentation of yGuard format
- Understanding of mapping file structure (XML format expected)

### Phase 2: Test Infrastructure

**Objective**: Build test framework that validates deobfuscation against Java reference implementation

**Tasks**:
1. Set up TypeScript test suite (Jest or Vitest)
2. Create test fixtures loader
3. Implement test generators:
   - Load obfuscated stack + mapping file
   - Run TS deobfuscator
   - Compare against Java reference output
4. Parameterized tests for each fixture
5. Document fixture format and adding new fixtures

**Deliverables**:
- Working test suite
- All fixtures passing (when TS implementation is ready)
- Test fixture documentation

### Phase 3: Core Library Implementation

**Objective**: Implement TypeScript deobfuscator based on Java source

**Tasks**:
1. Implement mapping file parser:
   - XML parser for `.map` format
   - Data structures for class/method/field mappings
2. Implement stack trace parser:
   - Parse standard JavaScript stack format
   - Extract frame information (function, file, line, column)
   - Handle various stack trace formats
3. Implement deobfuscation engine:
   - Symbol lookup algorithms
   - Class/method/field resolution
   - Line number mapping
4. Create public API:
   - `deobfuscate(stackTrace: string, mappingFile: string): string`
   - `deobfuscateFrame(frame: StackFrame, mapping: Mapping): DeobfuscatedFrame`
5. Smoke tests: Verify basic functionality with 2-3 fixtures

**Deliverables**:
- Functional TS implementation
- Passes smoke tests (basic fixtures)
- Type definitions exported for library consumers

### Phase 4: Refinement & Full Test Coverage

**Objective**: Achieve full test suite passing and handle edge cases

**Tasks**:
1. Run full test suite against all fixtures
2. Debug and fix failures
3. Handle edge cases:
   - Missing mappings
   - Multiple overloads
   - Inline functions
   - Source map edge cases
4. Performance optimization
5. Error handling and validation
6. Code documentation and comments
7. Export library (npm package structure)

**Deliverables**:
- All tests passing
- Comprehensive error handling
- Production-ready library
- Clear API documentation

### Phase 5: Web Interface

**Objective**: Create user-friendly Next.js application for deobfuscation

**Features**:
1. **Stack Trace Input**:
   - Text area for pasting stack traces
   - Drag-and-drop or file upload for bulk traces
2. **Mapping File Input**:
   - Text area for pasting mapping file content
   - File upload for `.map` files
   - URL input for remote mapping files
3. **Test Fixtures**:
   - Dropdown to load pre-built fixtures
   - Quick preview of fixture contents
4. **Deobfuscation**:
   - Real-time or on-demand processing
   - Display original vs. deobfuscated side-by-side
   - Highlight changes
5. **Export**:
   - Copy to clipboard
   - Download as text file
   - Download as formatted document

**Technical Stack**:
- Next.js (React framework)
- TypeScript
- Core library as dependency
- Tailwind CSS or similar for styling

**Deliverables**:
- Fully functional web interface
- Responsive design (desktop/mobile)
- Error messages and loading states
- User guide/help text

## Project Structure

```
ynot/
├── spec.md                           # This file
├── README.md                         # Project overview
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── jest.config.js                    # Test config
│
├── src/
│   ├── index.ts                      # Main library entry point
│   ├── deobfuscator.ts               # Core deobfuscator class
│   ├── mapping/
│   │   ├── parser.ts                 # Mapping file parser
│   │   └── types.ts                  # Type definitions
│   ├── stack/
│   │   ├── parser.ts                 # Stack trace parser
│   │   └── types.ts                  # Stack frame types
│   └── utils/
│       └── helpers.ts                # Utility functions
│
├── tests/
│   ├── fixtures/
│   │   ├── fixture1.txt              # Obfuscated stack
│   │   ├── fixture1.xml              # Mapping file
│   │   ├── fixture1.deobfuscated.txt # Expected output
│   │   ├── ...
│   │   └── index.ts                  # Fixture loader
│   ├── deobfuscator.test.ts          # Core tests
│   ├── mapping.test.ts               # Mapping parser tests
│   └── stack.test.ts                 # Stack parser tests
│
├── apps/
│   └── web/
│       ├── package.json
│       ├── next.config.js
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   │   ├── StackInput.tsx
│       │   │   ├── MappingInput.tsx
│       │   │   ├── Results.tsx
│       │   │   └── FixtureLoader.tsx
│       │   └── utils/
│       └── public/
│
└── docs/
    ├── architecture.md               # Design decisions
    ├── yguard-format.md              # Format documentation
    └── api.md                        # Library API documentation
```

## yGuard Format Overview

### Mapping File Format

**Format**: XML (typically generated by yGuard obfuscation tool)

**Root Structure**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<yguard version="1.5">
  <property name="..." value="..." owner="..." />

  <map>
    <package name="original.pkg" map="a" />
    <class name="original.pkg.ClassName" map="A">
      <method name="methodName()" map="m" />
      <method name="methodName(Ljava/lang/String;)V" map="n" />
      <field name="fieldName" map="f" />
    </class>
  </map>

  <expose>
    <!-- Declarations of symbols that should NOT be obfuscated -->
    <method class="original.Class" name="method()" />
    <field class="original.Class" name="field" />
  </expose>
</yguard>
```

**Key Elements**:
- **`<yguard>`**: Root element with version attribute
- **`<property>`**: Class-level metadata (e.g., `scrambling-salt` for line number unscrambling)
  - Attributes: `name`, `value`, `owner` (fully qualified class name)
- **`<map>`**: Contains all symbol mappings
  - **`<package>`**: Package mappings (obfuscated → original)
  - **`<class>`**: Class mappings (hierarchical)
    - **`<method>`**: Method mappings with optional signature
    - **`<field>`**: Field mappings
- **`<expose>`**: Symbols that were kept unobfuscated (reverse lookup support)

**Method/Field Names**:
- May include Java type signatures for overloading support
- Format: `methodName(Ljava/lang/String;I)V` (JVM descriptor)
- Can also be simple names without signatures

### Stack Trace Format (Input)

Standard JavaScript/browser stack traces:
```
Error: Something went wrong
    at someFunc (file.min.js:1:2345)
    at anotherFunc (file.min.js:5:678)
    at Object.<anonymous> (file.min.js:10:1)
```

OR Java-style obfuscated stacks (for testing):
```
Exception in thread "main"
  at A.B.C.method(Unknown Source)
  at A.D.main(file.js:123)
```

**Stack Frame Patterns**:
1. **V8/Chrome format**: `at functionName (file.js:line:column)`
2. **Firefox format**: `functionName@file.js:line:column`
3. **Java format**: `at package.Class.method(SourceFile.java:123)`
4. **JRockit format**: More complex, includes module and type info

### Stack Trace Format

Standard JavaScript/browser stack traces:
```
Error: Something went wrong
    at someFunc (file.min.js:1:2345)
    at anotherFunc (file.min.js:5:678)
```

## Deobfuscation Algorithm Details

### Symbol Resolution Algorithm

1. **Parse mapping file** into tree structure: `root → packages → classes → methods/fields`
2. **For each stack frame**:
   - Extract: className, methodName, fileName, lineNumber
   - **Class resolution**:
     - Split className by `.` and `$` delimiters
     - Traverse mapping tree using obfuscated names
     - Look up original names at each level
     - Handle obfuscation prefixes (delimited by `/`)
   - **Method resolution**:
     - Get class node, search child MethodStructs
     - Match by obfuscated method name
     - Extract original method name (handle multiple overloads with `|` delimiter)
   - **Line number unscrambling** (if `scrambling-salt` property present):
     - Seed = salt XOR (originalClassName.hashCode())
     - Create LineNumberScrambler with size=3584 and computed seed
     - Call `unscramble(obfuscatedLineNumber)`

### LineNumberScrambler Algorithm

The scrambler uses a pseudo-random shuffle:
1. Initialize arrays: `scrambled[i] = i` and `unscrambled[i] = i`
2. Use seeded Random to perform 10 rounds of shuffling:
   - For each round, iterate through all indices
   - Swap with random other index
   - Update both scrambled and unscrambled mappings
3. To unscramble: `result = unscrambled[i % size] + (i / size) * size`

This allows obfuscators to randomize line numbers while keeping them recoverable with the salt.

## Testing Strategy

### Test Fixtures

- **Minimum**: 100 fixtures covering:
  - **Stack depth**: Single frame (10), 5 frames (10), 10+ frames (10)
  - **Method types**: Static (10), instance (10), constructors (5), anonymous (5), lambdas (5)
  - **Class hierarchy**: Top-level (15), inner classes (10), nested inner (10)
  - **Overloading**: Single method (10), multiple overloads (15)
  - **Missing mappings**: Unmapped class (5), unmapped method (5), partial mappings (5)
  - **Line numbers**: With line numbers (20), without (5), scrambled (5), edge cases (5)
  - **Package complexity**: Simple package (10), deep nesting (10), obfuscation prefixes (5)
  - **Generic types**: Parameterized types (8), wildcards (4), nested generics (3)
  - **Edge cases**: Empty methods (3), very long class names (3), special chars (2), JRockit format (5), Firefox format (3)

### Test Categories

1. **Unit Tests**:
   - Mapping parser (XML parsing, data structure creation)
   - Stack trace parser (frame extraction, format handling)
   - Deobfuscation logic (symbol resolution, accuracy)

2. **Integration Tests**:
   - End-to-end fixture testing
   - Comparison with Java reference implementation
   - Performance benchmarks

3. **Edge Cases**:
   - Partially mapped symbols
   - Invalid mapping files
   - Malformed stack traces
   - Very large mappings

## Success Criteria

- ✅ All test fixtures deobfuscate correctly (match Java output)
- ✅ Library is fully typed with exported types
- ✅ Web interface is responsive and user-friendly
- ✅ Handles edge cases gracefully with clear error messages
- ✅ Performance: Deobfuscation < 100ms for typical stacks
- ✅ Code is documented and maintainable
- ✅ npm package published (future: optional)

## Tools & Technologies

### Core Development
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 18+
- **Package Manager**: npm or yarn
- **Testing**: Jest or Vitest

### Web Interface
- **Framework**: Next.js 14+
- **UI**: React 18+
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (optional)

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Build**: TypeScript compiler + bundler (esbuild/tsup)

## References

- [yGuard GitHub Repository](https://github.com/yWorks/yGuard/)
- [Source Map Format](https://sourcemaps.info/)
- [Stack Trace Standardization](https://v8.dev/docs/stack-trace-api)

## Timeline & Phases

This is a phased approach. Each phase should be completed before moving to the next:

1. **Phase 1** (Research & Fixtures): Foundation for all testing
2. **Phase 2** (Tests): Validation framework in place
3. **Phase 3** (Core Library): Working implementation
4. **Phase 4** (Refinement): Production-ready
5. **Phase 5** (Web UI): User-facing tool

## Core Algorithms to Port

### 1. XML Mapping Parser (MyContentHandler)
- SAX-based XML parsing (use native TS XML parser)
- Build hierarchical tree structure during parsing
- Extract property metadata (scrambling-salt, version)
- Handle three sections: `<expose>`, `<map>`, `<yguard>`

### 2. Symbol Tree Navigation
- Tree structure: Package → Class (including inner classes with `$`) → Methods/Fields
- Lookup methods with exact name matching on obfuscated names
- Support for obfuscation prefixes (delimiter `/` to represent package obfuscation)
- Handle method overloads and method signature matching

### 3. Stack Trace Parsing
- Multiple regex patterns for different stack formats (V8, Firefox, Java, JRockit)
- Extract: className, methodName, fileName, lineNumber from each frame
- Support for module names and type information
- Character entity conversion (HTML numeric entities)

### 4. Deobfuscation/Translation
- `translate(classOrMethodName: string): string` - Translate fully qualified names
- `translateStackTraceElement(element: MyStackTraceElement): MyStackTraceElement` - Translate single frame
- Navigate tree to find obfuscated → original name mappings
- Return original name or fallback to input if not found

### 5. Line Number Unscrambling
- Compute seed from class name hash and scrambling-salt
- Initialize random number generator with seed
- Build lookup arrays through 10 rounds of Fisher-Yates-like shuffling
- Apply inverse mapping to obfuscated line numbers

### 6. Type Signature Conversion (from Conversion class)
- Parse Java type descriptors (`Ljava/lang/String;`, `I`, `V`, etc.)
- Handle array types (`[L...;`)
- Support generic types with type parameters
- Format methods with return type and parameter lists

## Open Questions

- [ ] What yGuard versions should be supported?
- [ ] Are there performance requirements?
- [ ] Should the library support streaming large stack traces?
- [ ] Web interface: SPA or server-side rendering?
- [ ] Should mappings be cached/indexed for faster lookups?

## Related Documentation

- See `docs/` folder for additional technical documentation
- See test fixtures in `tests/fixtures/` for examples
