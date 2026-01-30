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

- **YGuardLogParser**: Main parser class for handling obfuscated logs
- **Mapping structures**: Classes representing the mapping file format
- **Stack trace models**: Classes for parsing and representing stack frames
- **Deobfuscation logic**: Core algorithms for symbol resolution

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

- **Type**: XML (`.map` files)
- **Structure**: Contains mappings between obfuscated and original names
  - Classes (obfuscated → original names)
  - Methods (obfuscated → original names + parameters)
  - Fields (obfuscated → original names)
- **Line number mappings**: Maps obfuscated line numbers to original line numbers

### Stack Trace Format

Standard JavaScript/browser stack traces:
```
Error: Something went wrong
    at someFunc (file.min.js:1:2345)
    at anotherFunc (file.min.js:5:678)
```

## Testing Strategy

### Test Fixtures

- **Minimum**: 10 fixtures covering:
  - Simple single-frame stacks
  - Multi-frame stacks
  - Nested function calls
  - Missing mappings (error cases)
  - Various file naming conventions
  - Generic type parameters
  - Overloaded methods

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

## Open Questions

- [ ] What yGuard versions should be supported?
- [ ] Are there performance requirements?
- [ ] Should the library support streaming large stack traces?
- [ ] Web interface: SPA or server-side rendering?
- [ ] Should mappings be cached/indexed for faster lookups?

## Related Documentation

- See `docs/` folder for additional technical documentation
- See test fixtures in `tests/fixtures/` for examples
