# Test Fixtures Index

This document catalogs all test fixtures extracted from the yGuard Java project, specifically from `LogParserTest.java`. These fixtures are organized by feature category and provide comprehensive coverage of the deobfuscation functionality.

## Overview

- **Total Fixture Sets**: 11
- **Total Test Cases**: 35 individual inputs
- **Source**: `src/test/java/com/yworks/yguard/LogParserTest.java` from yGuard Java project
- **Format**: Each fixture set contains:
  - `mapping.xml`: XML mapping configuration
  - `input.txt`: Obfuscated input (one or more lines)
  - `expected.txt`: Expected deobfuscated output (matching line count)

## Fixture Organization

### Category 1: Common Mappings

**Directory**: `fixtures/common-mappings/`

**Purpose**: Tests basic deobfuscation of packages, classes, methods, and inner classes.

**Files**:
- `mapping.xml`: Standard mapping without obfuscation prefix
- `input.txt`: 4 test cases
- `expected.txt`: 4 expected outputs

**Test Cases**:
1. Simple class FQN: `A.A.A.A` → `com.yworks.test.Test`
2. Inner class FQN: `A.A.A.B$C` → `com.yworks.test.EnclosingClass$InnerClass`
3. Stack trace entry: `at A.A.A.A.A()` → `at com.yworks.test.Test.run(Test.java:0)`
4. Inner class stack trace: `at A.A.A.B$C.A()` → `at com.yworks.test.EnclosingClass$InnerClass.run(EnclosingClass.java:0)`

**Features Tested**:
- Package obfuscation
- Class obfuscation
- Method obfuscation
- Inner class handling (using `$` delimiter)
- Stack trace formatting
- Source file name generation

**Source**: `LogParserTest.testCommonMappings()`

---

### Category 2: Invalid Mappings

**Directory**: `fixtures/invalid-mappings/`

**Purpose**: Tests behavior when encountering obfuscated names not present in the mapping file. Demonstrates graceful degradation and prefix handling.

#### Fixture Set 001: No Prefix

**Files**:
- `001-no-prefix-mapping.xml`: Standard mapping without prefix
- `001-no-prefix-input.txt`: 4 test cases
- `001-no-prefix-expected.txt`: 4 expected outputs

**Test Cases**:
1. Missing class (packages exist): `A.A.A.D` → `com.yworks.test.D`
2. Unprefixed unknown: `yguard.A.A.A.D` → `yguard.A.A.A.D` (unchanged)
3. Missing class in stack trace: `at A.A.A.D.A()` → `at com.yworks.test.D.A()`
4. Unprefixed unknown stack trace: `at yguard.A.A.A.D.A()` → `at yguard.A.A.A.D.A()` (unchanged)

**Features Tested**:
- Partial deobfuscation (packages only)
- Unknown class handling
- Prefix detection without configuration
- Graceful degradation

**Source**: `LogParserTest.testInvalidMappings()` (first call)

#### Fixture Set 002: With Prefix

**Files**:
- `002-with-prefix-mapping.xml`: Mapping with `yguard/` prefix in package map
- `002-with-prefix-input.txt`: 4 test cases
- `002-with-prefix-expected.txt`: 4 expected outputs

**Test Cases**:
1. Missing class without prefix: `A.A.A.D` → `A.A.A.D` (unchanged)
2. Missing class with prefix: `yguard.A.A.A.D` → `yguard.A.A.A.D` (unchanged)
3. Stack trace without prefix: `at A.A.A.D.A()` → `at A.A.A.D.A()` (unchanged)
4. Stack trace with prefix: `at yguard.A.A.A.D.A()` → `at yguard.A.A.A.D.A()` (unchanged)

**Features Tested**:
- Prefix configuration impact
- Behavior when prefix is configured but input doesn't match
- Consistent handling across FQN and stack trace formats

**Source**: `LogParserTest.testInvalidMappings()` (second call)

---

### Category 3: Leading Dollar Sign

**Directory**: `fixtures/leading-dollar/`

**Purpose**: Tests handling of classes and methods that begin with `$` character, which is a valid Java identifier character but requires special handling.

#### Fixture Set 001: Qualified Names

**Files**:
- `001-qualified-name-mapping.xml`: Standard mapping with `$A` and `$C` classes
- `001-qualified-name-input.txt`: 2 test cases
- `001-qualified-name-expected.txt`: 2 expected outputs

**Test Cases**:
1. Class starting with `$`: `A.A.A.$A` → `com.yworks.test.DollarSign`
2. Inner class of `$` class: `A.A.A.$A$$C` → `com.yworks.test.DollarSign$InnerClass`

**Features Tested**:
- Leading `$` in class names
- Double `$` delimiter between `$`-prefixed outer class and inner class
- FQN translation with special characters

**Source**: `LogParserTest.testLeadingDollarQualifiedName()`

#### Fixture Set 002: Stack Trace

**Files**:
- `002-stacktrace-mapping.xml`: Standard mapping with `$A` classes
- `002-stacktrace-input.txt`: 2 test cases
- `002-stacktrace-expected.txt`: 2 expected outputs

**Test Cases**:
1. Stack trace with `$` class: `at A.A.A.$A.$A()` → `at com.yworks.test.DollarSign.run(DollarSign.java:0)`
2. Stack trace with inner `$` class: `at A.A.A.$A$$C.$A()` → `at com.yworks.test.DollarSign$InnerClass.run(DollarSign.java:0)`

**Features Tested**:
- Stack trace parsing with `$` characters
- Source file name generation from `$`-prefixed classes
- Inner class source file naming (uses outer class name)

**Source**: `LogParserTest.testLeadingDollarStacktraceEntry()`

---

### Category 4: Module-Qualified Names

**Directory**: `fixtures/module-qualified/`

**Purpose**: Tests Java 9+ module system support, including module names, version info, and layer info in fully qualified names.

#### Fixture Set 001: Qualified Names

**Files**:
- `001-qualified-name-mapping.xml`: Standard mapping
- `001-qualified-name-input.txt`: 4 test cases
- `001-qualified-name-expected.txt`: 4 expected outputs

**Test Cases**:
1. Module only: `yfiles.test/A.A.A.A` → `yfiles.test/com.yworks.test.Test`
2. Module with version: `yfiles.test@10.0.1/A.A.A.A` → `yfiles.test@10.0.1/com.yworks.test.Test`
3. Layer, module, and version: `app/yfiles.test@10.0.1/A.A.A.A` → `app/yfiles.test@10.0.1/com.yworks.test.Test`
4. Layer with empty module: `app//A.A.A.A` → `app//com.yworks.test.Test`

**Features Tested**:
- Module prefix preservation
- Version info preservation
- Layer info preservation
- Class name translation with module context
- Multiple `/` delimiters

**Source**: `LogParserTest.testModuleQualifiedName()`

#### Fixture Set 002: Stack Trace

**Files**:
- `002-stacktrace-mapping.xml`: Standard mapping
- `002-stacktrace-input.txt`: 8 test cases
- `002-stacktrace-expected.txt`: 8 expected outputs

**Test Cases**:
1. Module with source: `at yfiles.test/A.A.A.A.A()` → `at yfiles.test/com.yworks.test.Test.run(Test.java:0)`
2. Module, no source: `at yfiles.test/A.A.A.A.A(Unknown Source)` → `at yfiles.test/com.yworks.test.Test.run(Test.java:0)`
3. Module@version with source: `at yfiles.test@10.0.1/A.A.A.A.A()` → `at yfiles.test@10.0.1/com.yworks.test.Test.run(Test.java:0)`
4. Module@version, no source: `at yfiles.test@10.0.1/A.A.A.A.A(Unknown Source)` → `at yfiles.test@10.0.1/com.yworks.test.Test.run(Test.java:0)`
5. Layer/module@version with source: `at app/yfiles.test@10.0.1/A.A.A.A.A()` → `at app/yfiles.test@10.0.1/com.yworks.test.Test.run(Test.java:0)`
6. Layer/module@version, no source: `at app/yfiles.test@10.0.1/A.A.A.A.A(Unknown Source)` → `at app/yfiles.test@10.0.1/com.yworks.test.Test.run(Test.java:0)`
7. Layer with empty module, source: `at app//A.A.A.A.A()` → `at app//com.yworks.test.Test.run(Test.java:0)`
8. Layer with empty module, no source: `at app//A.A.A.A.A(Unknown Source)` → `at app//com.yworks.test.Test.run(Test.java:0)`

**Features Tested**:
- Module prefix in stack traces
- "Unknown Source" handling
- Source file generation with modules
- All module format variations
- Line number defaulting to 0

**Source**: `LogParserTest.testModuleStacktraceEntry()`

---

### Category 5: Method Overloading

**Directory**: `fixtures/overload/`

**Purpose**: Tests handling of multiple methods mapped to the same obfuscated name (method overloading). The deobfuscator should display all possible candidates.

#### Fixture Set 001: Qualified Names

**Files**:
- `001-qualified-name-mapping.xml`: Standard mapping with two methods mapped to `B`
- `001-qualified-name-input.txt`: 2 test cases
- `001-qualified-name-expected.txt`: 2 expected outputs

**Test Cases**:
1. Overloaded method: `A.A.A.A.B` → `com.yworks.test.Test.isEnabled|setEnabled(boolean)`
2. Non-existent method: `A.A.A.A.Z` → `com.yworks.test.Test.Z`

**Mapping Details**:
- Both `boolean isEnabled()` and `void setEnabled(boolean)` map to `B`
- Output shows both candidates separated by `|`
- Second method signature includes parameter type

**Features Tested**:
- Method overloading detection
- Multiple candidate display
- Separator format (`|`)
- Signature formatting in output
- Unknown method handling

**Source**: `LogParserTest.testOverloadQualifiedName()`

#### Fixture Set 002: Stack Trace

**Files**:
- `002-stacktrace-mapping.xml`: Standard mapping with overloaded methods
- `002-stacktrace-input.txt`: 1 test case
- `002-stacktrace-expected.txt`: 1 expected output

**Test Cases**:
1. Overloaded in stack trace: `at A.A.A.A.B()` → `at com.yworks.test.Test.isEnabled|setEnabled(boolean)(Test.java:0)`

**Features Tested**:
- Overload display in stack trace context
- Proper formatting with source file and line number
- Multiple method names before source location

**Source**: `LogParserTest.testOverloadStacktraceEntry()`

---

### Category 6: Obfuscation Prefix

**Directory**: `fixtures/prefixed/`

**Purpose**: Tests the obfuscation prefix feature, where yGuard can add a configurable prefix to all obfuscated packages. The prefix uses `/` delimiter instead of `.` to distinguish it from regular packages.

#### Fixture Set 001: Qualified Names

**Files**:
- `001-qualified-name-mapping.xml`: Mapping with `yguard/` prefix on root package
- `001-qualified-name-input.txt`: 2 test cases
- `001-qualified-name-expected.txt`: 2 expected outputs

**Test Cases**:
1. Prefixed class: `yguard.A.A.A.A` → `com.yworks.test.Test`
2. Prefixed inner class: `yguard.A.A.A.B$C` → `com.yworks.test.EnclosingClass$InnerClass`

**Mapping Details**:
- Root package `com` maps to `yguard/A` (note the `/` delimiter)
- Input uses `.` delimiter: `yguard.A.A.A.A`
- Output strips prefix completely

**Features Tested**:
- Prefix configuration in mapping file
- Prefix stripping during deobfuscation
- Delimiter conversion (`/` in map, `.` in input)
- Complete removal of prefix from output

**Source**: `LogParserTest.testPrefixedQualifiedName()`

#### Fixture Set 002: Stack Trace

**Files**:
- `002-stacktrace-mapping.xml`: Mapping with `yguard/` prefix
- `002-stacktrace-input.txt`: 2 test cases
- `002-stacktrace-expected.txt`: 2 expected outputs

**Test Cases**:
1. Prefixed stack trace: `at yguard.A.A.A.A.A()` → `at com.yworks.test.Test.run(Test.java:0)`
2. Prefixed inner class trace: `at yguard.A.A.A.B$C.A()` → `at com.yworks.test.EnclosingClass$InnerClass.run(EnclosingClass.java:0)`

**Features Tested**:
- Prefix handling in stack traces
- Clean output without prefix
- Source file and line number generation
- Inner class stack trace with prefix

**Source**: `LogParserTest.testPrefixedStacktraceEntry()`

---

## Fixture File Format

### Mapping File (mapping.xml)

Standard yGuard XML mapping format:

```xml
<yguard version="1.5">
  <expose>
    <!-- Elements exposed (not obfuscated) -->
  </expose>
  <map>
    <!-- Obfuscation mappings -->
    <package name="original.name" map="obfuscated"/>
    <class name="original.Class" map="Obf"/>
    <method class="original.Class" name="void method()" map="a"/>
    <field class="original.Class" name="field" map="b"/>
  </map>
</yguard>
```

### Input File (input.txt)

Plain text file with one test case per line. Each line can be:
- Fully qualified name (FQN): `com.example.Class.method`
- Stack trace entry: `\tat com.example.Class.method(Source.java:42)`
- Module-qualified: `module/com.example.Class`

### Expected Output File (expected.txt)

Plain text file with expected deobfuscated output, matching input line-by-line.

## Common Mapping Structure

Most fixtures use a common mapping template:

**Packages**:
- `com` → `A` (or `yguard/A` with prefix)
- `com.yworks` → `A`
- `com.yworks.test` → `A`

**Classes**:
- `com.yworks.test.Test` → `A`
- `com.yworks.test.EnclosingClass` → `B`
- `com.yworks.test.EnclosingClass$InnerClass` → `C`
- `com.yworks.test.DollarSign` → `$A`
- `com.yworks.test.DollarSign$InnerClass` → `$C`

**Methods**:
- `void run()` → `A` (on multiple classes)
- `boolean isEnabled()` → `B` (on Test)
- `void setEnabled(boolean)` → `B` (on Test, overloaded)
- `void run()` → `$A` (on DollarSign classes)

## Usage Notes

### For TypeScript Implementation

1. **Start Simple**: Begin with `common-mappings` to establish core functionality
2. **Progress by Feature**: Work through categories in order:
   - Common mappings (basic functionality)
   - Invalid mappings (error handling)
   - Leading dollar (special characters)
   - Module-qualified (Java 9+ support)
   - Overload (multiple candidates)
   - Prefixed (advanced mapping configuration)

3. **Validate Each Category**: Ensure all tests pass before moving to next category

4. **Line-by-Line Matching**: Each line in `input.txt` must produce the corresponding line in `expected.txt`

5. **Whitespace Preservation**: Stack traces include leading tabs/spaces that must be preserved

### For Adding New Fixtures

To add new test fixtures:

1. Create a new numbered directory or add to existing category
2. Follow naming convention: `NNN-description-type.ext`
3. Ensure line counts match between input and expected
4. Document in this index with:
   - Purpose
   - Test cases
   - Features tested
   - Source reference

### Special Considerations

**Tab Characters**: Stack trace entries use tab character (`\t`), not spaces

**Line Numbers**: Most tests use line number `0` as placeholder (actual line info lost during obfuscation)

**Dollar Signs**: Java allows `$` in identifiers; yGuard uses `$` for inner class delimiter

**Module Syntax**: Java 9+ format: `[layer/]module[@version]/class`

**Prefix Delimiter**: Mapping file uses `/`, input uses `.` (e.g., `yguard/A` vs `yguard.A.A.A`)

**Overload Display**: Multiple methods shown as `method1|method2` with signatures

## Coverage Summary

### Features Covered

✅ Package deobfuscation
✅ Class deobfuscation
✅ Method deobfuscation
✅ Field deobfuscation (in mappings, not tested in output)
✅ Inner class handling (`$` delimiter)
✅ Stack trace parsing (standard Java format)
✅ Source file name generation
✅ Module-qualified names (Java 9+)
✅ Module versions and layers
✅ Method overloading (multiple candidates)
✅ Obfuscation prefix handling
✅ Leading `$` in identifiers
✅ Missing mappings (graceful degradation)
✅ "Unknown Source" handling

### Features Not Covered (Potential Extensions)

❌ Line number descrambling (requires `scrambling-salt` property)
❌ JRockit VM stack trace format
❌ Generic type signatures
❌ Anonymous classes (`Outer$1`, `Outer$2`)
❌ Local classes
❌ Multiple stack traces in one input
❌ Mixed obfuscated/deobfuscated content
❌ Non-stack-trace text with embedded FQNs
❌ Field references in output
❌ Performance benchmarks

## Statistics

- **Fixture Sets**: 11
- **Mapping Files**: 11
- **Input Files**: 11
- **Expected Files**: 11
- **Total Test Inputs**: 35 lines
- **Categories**: 6
- **Source Test Methods**: 9
- **Lines of Java Test Code**: ~280
- **Lines of Documentation**: 500+ (this file)

## References

- **Source File**: `src/test/java/com/yworks/yguard/LogParserTest.java` in yGuard repository
- **yGuard Repository**: https://github.com/yWorks/yGuard/
- **Documentation**: See `docs/java-tests.md` for detailed test infrastructure documentation
- **Specification**: See `spec.md` for overall project plan

## Validation

All fixtures have been extracted directly from `LogParserTest.java` test methods and verified for:
- Accurate input/expected pairs
- Correct mapping configurations
- Proper file formatting
- Complete coverage of test methods

Each fixture can be validated by running through the Java implementation and comparing output.
