# yGuard TypeScript Deobfuscator - Project Specification

## Project Overview

This project aims to create a TypeScript implementation of the yGuard deobfuscator, based on the original Java implementation from [yWorks/yGuard](https://github.com/yWorks/yGuard/). The end result will be a standalone TypeScript library and a web-based interface for deobfuscating Java stack traces that were obfuscated by yGuard.

## Goals and Objectives

1. **Understand the Java Implementation**: Analyze and document the yGuard deobfuscation logic
2. **Create Comprehensive Test Suite**: Extract real test fixtures from the original project
3. **Port to TypeScript**: Implement a TypeScript version that maintains feature parity
4. **Build Web Interface**: Create a Next.js-based UI for easy deobfuscation
5. **Ensure Quality**: All tests must pass before completion

## Project Phases

### Phase 1: Research and Documentation

#### 1.1 Clone and Setup Java Project
- Clone the yGuard repository: `https://github.com/yWorks/yGuard/`
- Document the build system (Maven/Gradle configuration)
- Document how to build the project
- Document how to run tests
- Save this information in `docs/java-setup.md`

#### 1.2 Analyze Core Classes
- Primary entry point: `src/main/java/com/yworks/yguard/YGuardLogParser.java`
- Identify all classes involved in deobfuscation
- Document each class's purpose and responsibilities
- Create a class diagram or dependency map
- Save documentation in `docs/java-classes.md`

**Key Areas to Investigate:**
- Stack trace parsing logic
- Mapping file format and parsing
- Name resolution/deobfuscation algorithm
- Line number mapping
- Edge cases and error handling

#### 1.3 Locate Test Infrastructure
- Find all test files related to deobfuscation
- Document test organization
- Document test data location
- Save in `docs/java-tests.md`

**Deliverables:**
- `docs/java-setup.md` - Build and run instructions
- `docs/java-classes.md` - Class documentation and architecture
- `docs/java-tests.md` - Test infrastructure documentation

### Phase 2: Test Fixture Collection

#### 2.1 Extract Test Fixtures
- Collect test fixtures from the Java project's test suite
- Each fixture should contain:
  - Obfuscated stack trace (`.txt` file)
  - Mapping file (`.xml` file)
  - Expected deobfuscated output (`.expected.txt` file)
- Target: 50-100 diverse test cases
- Save in `fixtures/` directory with consistent naming:
  - `fixtures/test-001-stack.txt`
  - `fixtures/test-001-mapping.xml`
  - `fixtures/test-001-expected.txt`

#### 2.2 Categorize Fixtures
Create fixtures covering:
- Simple class/method name obfuscation
- Line number mapping
- Nested exceptions
- Multiple stack frames
- Edge cases (missing mappings, partial matches, etc.)
- Different Java versions
- Inner classes
- Lambda expressions
- Anonymous classes

#### 2.3 Validate Fixtures with Java Implementation
- Run each fixture through the Java deobfuscator
- Save the actual output as the expected result
- Ensure we have a baseline for comparison
- Document any discrepancies or special cases

**Deliverables:**
- `fixtures/` directory with 50-100 test cases
- `docs/fixtures-index.md` - Categorized list of all fixtures

### Phase 3: Standalone Java Deobfuscator

#### 3.1 Extract Core Java Classes
- Copy all Java classes needed for deobfuscation
- Place in `java-reference/src/`
- Remove dependencies on external libraries where possible
- Keep only deobfuscation-related code

#### 3.2 Create Minimal Build System
- **No Maven/Gradle** - use plain javac
- Create a simple build script (`java-reference/build.sh`)
- Include only necessary dependencies as jar files if absolutely required
- Create a test runner script (`java-reference/test.sh`)

#### 3.3 Verify Java Implementation
- Ensure the extracted code still works
- Run all fixtures through it
- Confirm outputs match expectations

**Deliverables:**
- `java-reference/` directory with standalone Java code
- `java-reference/build.sh` - Build script
- `java-reference/test.sh` - Test runner
- `java-reference/README.md` - Usage instructions

### Phase 4: TypeScript Implementation

#### 4.1 Project Setup
- Initialize TypeScript project with proper configuration
- Set up testing framework (Jest or Vitest)
- Configure build system (tsc or tsup)
- Set up linting and formatting (ESLint, Prettier)

**Project Structure:**
```
src/
  parser/          # Stack trace parsing
  mapping/         # Mapping file parsing
  deobfuscator/    # Core deobfuscation logic
  types/           # TypeScript type definitions
  index.ts         # Main entry point
tests/
  fixtures/        # Symlink or copy of fixtures
  unit/            # Unit tests
  integration/     # Integration tests
```

#### 4.2 Identify Classes to Port
Based on Java analysis, port the following (adjust based on actual findings):
- Stack trace parser
- Mapping file parser (XML)
- Name resolver
- Line number mapper
- Main deobfuscator class

#### 4.3 Implement Core Functionality
- Port each Java class to TypeScript
- Maintain similar structure for traceability
- Use TypeScript best practices (types, interfaces, generics)
- Add inline comments referencing Java source

**Porting Principles:**
- Preserve algorithm logic
- Use TypeScript idioms where appropriate
- Maintain readability and maintainability
- Add comprehensive type definitions

#### 4.4 Create Test Suite
- Implement test for each fixture
- Tests should:
  - Load obfuscated stack trace
  - Load mapping file
  - Run deobfuscation
  - Compare with expected output
- Use parameterized tests for all fixtures

#### 4.5 Iterative Development
1. Start with smoke test (1-2 simple fixtures)
2. Implement basic functionality to pass smoke test
3. Gradually add more fixtures
4. Fix issues until all tests pass
5. Refactor and optimize

**Deliverables:**
- `src/` directory with TypeScript implementation
- `tests/` directory with comprehensive test suite
- `package.json` with all dependencies
- `tsconfig.json` with TypeScript configuration
- `README.md` with API documentation

### Phase 5: Web Interface

#### 5.1 Next.js Setup
- Create Next.js application
- Use App Router
- Set up Tailwind CSS for styling
- Configure TypeScript

**Project Structure:**
```
app/
  page.tsx          # Main deobfuscation UI
  layout.tsx        # Root layout
  api/              # API routes if needed
components/
  StackInput.tsx    # Stack trace input area
  MappingInput.tsx  # Mapping file upload/paste
  ResultDisplay.tsx # Deobfuscated output
  FixtureSelector.tsx # Fixture dropdown
lib/
  deobfuscator.ts   # Import from core library
public/
  fixtures/         # Sample fixtures for demo
```

#### 5.2 UI Components

**Stack Input Area:**
- Large text area for pasting obfuscated stack traces
- Syntax highlighting (optional)
- Clear button

**Mapping Input Area:**
- Text area for pasting mapping XML
- File upload button (drag & drop)
- File URL input (optional)
- Clear button

**Fixture Selector:**
- Dropdown menu with all available fixtures
- Load fixture button
- Automatically populates stack and mapping inputs

**Result Display:**
- Read-only text area with deobfuscated output
- Copy to clipboard button
- Download as file button
- Diff view (show changes from obfuscated)

**Action Buttons:**
- "Deobfuscate" - Main action button
- "Clear All" - Reset form
- "Load Example" - Load sample fixture

#### 5.3 Features
- Client-side processing (runs in browser)
- No server required for deobfuscation
- Responsive design (mobile-friendly)
- Error handling and validation
- Loading states
- Dark mode support (optional)

#### 5.4 Testing
- Test with all fixtures
- Browser compatibility testing
- Performance testing with large stack traces
- Error handling edge cases

**Deliverables:**
- Next.js application in `web/` directory
- Deployed demo (Vercel/Netlify)
- `web/README.md` with setup and deployment instructions

## Technical Requirements

### TypeScript Library
- TypeScript 5.x
- Node.js 18+
- ESM and CJS module formats
- Full type definitions
- Zero runtime dependencies (if possible)
- Tree-shakeable

### Web Interface
- Next.js 14+
- React 18+
- Tailwind CSS
- Client-side only (static export compatible)
- Works offline after initial load

### Testing
- 100% of fixtures must pass
- Code coverage target: 80%+
- Both unit and integration tests
- CI/CD pipeline (GitHub Actions)

### Documentation
- Comprehensive README
- API documentation
- Architecture documentation
- Contributing guidelines
- Usage examples

## Project Structure (Final)

```
ynot/
├── docs/
│   ├── java-setup.md
│   ├── java-classes.md
│   ├── java-tests.md
│   ├── fixtures-index.md
│   └── architecture.md
├── java-reference/
│   ├── src/
│   ├── build.sh
│   ├── test.sh
│   └── README.md
├── fixtures/
│   ├── test-001-stack.txt
│   ├── test-001-mapping.xml
│   ├── test-001-expected.txt
│   ├── ... (50-100 fixtures)
├── src/
│   ├── parser/
│   ├── mapping/
│   ├── deobfuscator/
│   ├── types/
│   └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── web/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── package.json
├── tsconfig.json
├── spec.md (this file)
└── README.md
```

## Success Criteria

### Phase 1 Complete
- [ ] Java project successfully cloned and builds
- [ ] All deobfuscation classes identified and documented
- [ ] Test infrastructure understood and documented

### Phase 2 Complete
- [ ] 50-100 test fixtures collected
- [ ] All fixtures validated with Java implementation
- [ ] Fixtures organized and categorized

### Phase 3 Complete
- [ ] Standalone Java deobfuscator extracted
- [ ] Builds and runs without Maven/Gradle
- [ ] All fixtures pass through Java reference

### Phase 4 Complete
- [ ] TypeScript implementation complete
- [ ] All fixtures pass (100% success rate)
- [ ] Code coverage ≥ 80%
- [ ] Documentation complete

### Phase 5 Complete
- [ ] Web interface functional
- [ ] All fixtures loadable in UI
- [ ] Deobfuscation works in browser
- [ ] Deployed and accessible

### Overall Project Complete
- [ ] All phases complete
- [ ] All tests passing
- [ ] Documentation comprehensive
- [ ] Web demo deployed
- [ ] Code reviewed and refactored
- [ ] Ready for public release

## Timeline Estimates

This is a complex project. Work will proceed phase by phase, with each phase fully complete before moving to the next.

**Note**: Focus on quality over speed. Each phase builds on the previous one.

## Notes and Considerations

### Mapping File Format
- yGuard uses XML format for mapping files
- Need XML parser (use built-in DOMParser in browser, xml2js or similar in Node)
- Document the XML schema

### Stack Trace Format
- Support various Java stack trace formats
- Handle multi-line exceptions
- Preserve formatting where possible

### Performance
- Large stack traces must be handled efficiently
- Large mapping files must be parsed quickly
- Consider caching parsed mappings

### Edge Cases
- Missing mappings
- Partial matches
- Corrupted mapping files
- Invalid stack traces
- Special characters in class/method names

### Future Enhancements (Out of Scope for Initial Release)
- Support for ProGuard mapping format
- Batch processing
- API endpoint for server-side processing
- Browser extension
- VSCode extension
- CLI tool

## References

- yGuard Repository: https://github.com/yWorks/yGuard/
- yGuard Documentation: https://www.yworks.com/products/yguard
- Java Stack Trace Format: https://docs.oracle.com/javase/8/docs/api/java/lang/Throwable.html

## Appendix

### Naming Conventions
- Fixture files: `test-XXX-{stack|mapping|expected}.{txt|xml}`
- Test files: `*.test.ts`
- Source files: camelCase for files, PascalCase for classes

### Git Workflow
- Commit after each major milestone
- Meaningful commit messages
- Create branches for experimental work
- Main branch always buildable

### Code Style
- Follow TypeScript/ESLint standard style
- Use Prettier for formatting
- Consistent naming conventions
- Comprehensive comments for complex logic
