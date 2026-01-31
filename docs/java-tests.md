# yGuard Test Infrastructure Documentation

## Overview

The yGuard project includes a comprehensive test suite that covers deobfuscation functionality, obfuscation correctness, annotations, generics, and various Java language features. This document describes the test organization, test data location, and how to run and extend the tests.

## Test Organization

### Test Directory Structure

```
src/test/
├── java/
│   └── com/yworks/yguard/
│       ├── LogParserTest.java                    # Main deobfuscation tests
│       ├── annotations/
│       │   ├── AnnotationsTest.java              # Annotation handling tests
│       │   ├── AnnoTest*.java                    # Test fixtures
│       │   └── TestAnnotation.java               # Custom annotations
│       ├── generics/
│       │   ├── TestGenerics.java                 # Generics handling tests
│       │   └── ParameterizedType.java            # Test fixtures
│       └── obf/
│           ├── AbstractObfuscationTest.java      # Base test class
│           ├── MethodParametersTest.java         # Method parameter tests
│           ├── KeepExtendsTest.java              # Inheritance tests
│           ├── AdjustTest.java                   # Resource adjustment tests
│           ├── BootstrapMethodsTest.java         # Bootstrap method tests
│           └── Mapper.java                       # Test utilities
└── resources/
    ├── com/yworks/yguard/obf/
    │   ├── *.txt                                 # Expected test outputs
    │   ├── adjust/                               # Resource adjustment tests
    │   └── asm/                                  # ASM-specific tests
    └── com/yworks/yshrink/java13/
        └── *.txt                                 # Java 13+ feature tests
```

## Key Test Classes

### 1. LogParserTest

**Location**: `src/test/java/com/yworks/yguard/LogParserTest.java`

**Purpose**: Primary test suite for the deobfuscation functionality (YGuardLogParser).

**Test Coverage**:
- Common mapping scenarios (packages, classes, methods, fields)
- Invalid/missing mappings
- Inner classes (`$` delimiter)
- Leading dollar signs in names
- Module-qualified names (Java 9+)
- Method overloading
- Obfuscation prefix handling
- Stack trace parsing and translation
- Fully qualified name translation

**Test Structure**:
Each test follows this pattern:
```java
@Test
public void testScenario() throws Exception {
    deobfuscate(
        insert(MAPPINGS, "prefix"),
        new String[] { "obfuscated input" },
        new String[] { "expected deobfuscated output" }
    );
}
```

**Helper Methods**:
- `deobfuscate(mappings, input, expected)`: Main test method
- `insert(template, prefix)`: Inserts obfuscation prefix into mapping template

**Test Mappings**:
The class includes an embedded XML mapping template (`MAPPINGS` constant) that defines:
- Package mappings: `com.yworks.test` → `A.A.A`
- Class mappings: `Test` → `A`, `EnclosingClass` → `B`, etc.
- Method mappings: `run()` → `A`, `isEnabled()` → `B`, etc.
- Inner class mappings: `EnclosingClass$InnerClass` → `B$C`
- Dollar sign handling: `DollarSign` → `$A`

**Test Cases**:

1. **testCommonMappings**
   - Tests basic package, class, and method translation
   - Tests stack trace format parsing
   - Expected behavior: Full deobfuscation of standard names

2. **testInvalidMappings**
   - Tests handling of unmapped classes
   - Tests prefix behavior with missing mappings
   - Expected behavior: Partial deobfuscation, graceful degradation

3. **testLeadingDollarQualifiedName**
   - Tests classes starting with `$`
   - Tests inner classes of `$`-prefixed classes
   - Expected behavior: Correct handling of special characters

4. **testLeadingDollarStacktraceEntry**
   - Tests stack traces with `$`-prefixed classes
   - Expected behavior: Proper file name generation

5. **testModuleQualifiedName**
   - Tests Java 9+ module syntax
   - Formats: `module/class`, `module@version/class`, `layer/module@version/class`
   - Expected behavior: Preserve module prefix, translate class

6. **testModuleStacktraceEntry**
   - Tests stack traces with module information
   - Tests with and without source file info
   - Expected behavior: Module prefix preserved, class/method translated

7. **testOverloadQualifiedName**
   - Tests methods with same obfuscated name (overloading)
   - Expected behavior: Shows all candidates as `method1|method2`

8. **testOverloadStacktraceEntry**
   - Tests overloaded methods in stack traces
   - Expected behavior: Displays all possible methods

9. **testPrefixedQualifiedName**
   - Tests obfuscation prefix feature
   - Expected behavior: Prefix stripped during deobfuscation

10. **testPrefixedStacktraceEntry**
    - Tests prefix in stack trace context
    - Expected behavior: Clean deobfuscation without prefix

### 2. AbstractObfuscationTest

**Location**: `src/test/java/com/yworks/yguard/obf/AbstractObfuscationTest.java`

**Purpose**: Base class for obfuscation-related tests (not deobfuscation).

**Note**: This is for testing the obfuscation process itself, not the log parser. It's less relevant for our TypeScript port but useful for understanding the complete picture.

### 3. MethodParametersTest

**Location**: `src/test/java/com/yworks/yguard/obf/MethodParametersTest.java`

**Purpose**: Tests preservation of method parameter information during obfuscation.

### 4. KeepExtendsTest

**Location**: `src/test/java/com/yworks/yguard/obf/KeepExtendsTest.java`

**Purpose**: Tests the "keep extends" functionality that preserves inheritance relationships.

### 5. AdjustTest

**Location**: `src/test/java/com/yworks/yguard/obf/AdjustTest.java`

**Purpose**: Tests resource file adjustment (e.g., .properties files).

### 6. BootstrapMethodsTest

**Location**: `src/test/java/com/yworks/yguard/obf/BootstrapMethodsTest.java`

**Purpose**: Tests handling of Java bootstrap methods (lambdas, method references, etc.).

### 7. AnnotationsTest

**Location**: `src/test/java/com/yworks/yguard/annotations/AnnotationsTest.java`

**Purpose**: Tests annotation preservation and obfuscation.

### 8. TestGenerics

**Location**: `src/test/java/com/yworks/yguard/generics/TestGenerics.java`

**Purpose**: Tests generic type handling during obfuscation.

## Test Resources

### Resource Files

**Location**: `src/test/resources/`

**Organization**:
- Organized by package matching test classes
- `.txt` files contain expected outputs
- `.properties` files for resource adjustment tests
- Named to match test scenarios

**Example Resources**:

1. **Lambda Tests**
   - `LambdaMetaFactoryTest.txt`: Expected output for lambda expressions

2. **Method Parameter Tests**
   - `SimpleMethodParametersTest.txt`: Expected method parameter preservation

3. **Bootstrap Methods**
   - `ConstantBootstraps.txt`: Constant bootstrap handling
   - `SwitchBootstraps_typeSwitch.txt`: Type switch expressions
   - `SwitchBootstraps_enumSwitch.txt`: Enum switch expressions
   - `StringConcatFactoryTest.txt`: String concatenation

4. **ASM Tests** (in `asm/` subdirectory)
   - `SimpleClass.txt`: Basic class structure
   - `SealedSerializableClass.txt`: Sealed class (Java 17+)
   - `OuterClass.txt`: Nested class structures
   - `AbstractBaseClass.txt`: Abstract classes
   - `Sample.txt`, `Main.txt`, `Impl.txt`: Various scenarios

5. **Resource Adjustment** (in `adjust/` subdirectory)
   - `GlobalResources.properties`: Global resource file
   - `ClassWithResources.properties`: Class-specific resources
   - `ClassWithResources.txt`: Expected output

6. **Shrinking Tests** (in `yshrink/java13/`)
   - Java 13+ specific feature tests
   - Lambda, method reference handling
   - String concatenation factory

## Test Data Format

### Mapping File Format (XML)

```xml
<yguard version="1.5">
  <expose>
    <!-- Elements NOT obfuscated -->
    <package name="com.example.public"/>
    <class name="com.example.PublicAPI"/>
    <method class="com.example.API" name="publicMethod()"/>
    <field class="com.example.API" name="publicField"/>
  </expose>

  <map>
    <!-- Obfuscation mappings -->
    <package name="original.package" map="obfuscated"/>
    <class name="original.Class" map="A"/>
    <method class="original.Class" name="void method()" map="a"/>
    <field class="original.Class" name="field" map="b"/>
  </map>

  <property name="scrambling-salt" value="1234567890" owner="com.example.Class"/>
</yguard>
```

### Expected Output Format (.txt files)

Plain text files containing expected deobfuscated output, used for comparison in tests.

## Running Tests

### Run All Tests

```bash
./gradlew test
```

### Run Specific Test Class

```bash
./gradlew test --tests LogParserTest
./gradlew test --tests AnnotationsTest
```

### Run Specific Test Method

```bash
./gradlew test --tests LogParserTest.testCommonMappings
./gradlew test --tests LogParserTest.testModuleQualifiedName
```

### Run with Verbose Output

```bash
./gradlew test --info
```

### Run with Debug

```bash
./gradlew test --debug
```

### Generate Test Report

```bash
./gradlew test
# Open: build/reports/tests/test/index.html
```

## Test Assertions

### LogParserTest Assertions

The `LogParserTest` uses JUnit 4 assertions:

```java
// Verify line count matches
assertEquals("Invalid expected line count", input.length, expected.length);

// Verify each line matches expected output
for (int i = 0; i < out.length; ++i) {
    assertEquals("Invalid result", expected[i], out[i]);
}
```

### Testing Strategy

1. **Input**: Obfuscated names or stack traces
2. **Mapping**: Embedded XML mapping configuration
3. **Process**: Parse mapping, translate input
4. **Verify**: Compare output to expected results
5. **Assert**: Fail if any mismatch

## Creating New Tests

### For Deobfuscation (LogParserTest)

1. **Add test method**:
```java
@Test
public void testNewScenario() throws Exception {
    deobfuscate(
        insert(MAPPINGS, ""),
        new String[] {
            "obfuscated.input.Here"
        },
        new String[] {
            "expected.output.Here"
        }
    );
}
```

2. **Extend MAPPINGS if needed**:
```java
private static final String MAPPINGS =
    "<yguard version=\"1.5\">\n" +
    "  <map>\n" +
    "    <class name=\"expected.output.Here\" map=\"obfuscated.input.Here\"/>\n" +
    "    ...\n" +
    "  </map>\n" +
    "</yguard>\n";
```

### For Obfuscation Tests

1. Extend `AbstractObfuscationTest`
2. Provide test bytecode or source
3. Define expected obfuscation rules
4. Compare output bytecode or mapping

## Test Fixtures

### Built-in Fixtures (LogParserTest)

The `MAPPINGS` constant provides fixtures for:
- Package obfuscation
- Class obfuscation (including inner classes)
- Method obfuscation (including overloaded methods)
- Field obfuscation
- Dollar sign handling
- Prefix handling (parameterized)

### External Fixtures (resources/)

Resource files serve as fixtures for:
- Complex obfuscation scenarios
- Java version-specific features
- Edge cases
- Real-world examples

## Coverage

### What's Tested

1. **Core Functionality**
   - XML parsing
   - Tree structure building
   - Name translation
   - Stack trace parsing
   - Pattern matching

2. **Edge Cases**
   - Missing mappings
   - Invalid input
   - Special characters
   - Module system
   - Inner/anonymous classes

3. **Java Features**
   - Lambdas
   - Method references
   - Switch expressions
   - Sealed classes
   - Records
   - Annotations
   - Generics

4. **Integration**
   - Complete deobfuscation workflows
   - Multiple translation formats
   - Prefix handling
   - Line number descrambling

### What's NOT Tested (Gaps)

1. **Performance tests**: No benchmarks for large files
2. **Concurrent access**: No thread-safety tests
3. **Memory tests**: No large mapping file stress tests
4. **Error recovery**: Limited malformed XML tests
5. **CLI tests**: No command-line interface tests
6. **GUI tests**: No Swing interface tests

## Test Dependencies

### JUnit 4.13.2

The project uses JUnit 4 for all tests.

**Common Annotations**:
- `@Test`: Marks test methods
- `@Before`: Setup before each test
- `@After`: Cleanup after each test
- `@BeforeClass`: Setup once before all tests
- `@AfterClass`: Cleanup once after all tests

**Assertions Used**:
- `assertEquals(message, expected, actual)`
- `assertTrue(message, condition)`
- `assertFalse(message, condition)`
- `assertNull(message, object)`
- `assertNotNull(message, object)`

### No Mocking Frameworks

The tests use real implementations, not mocks. This provides:
- **Pros**: True integration testing, real behavior
- **Cons**: Harder to isolate failures, slower tests

## Best Practices

### For TypeScript Port

1. **Extract Test Cases**: Copy input/expected pairs from `LogParserTest`
2. **Preserve Test Names**: Keep test method names for traceability
3. **Use Same Fixtures**: Copy `MAPPINGS` constant to TypeScript tests
4. **Match Behavior**: Ensure identical output for identical input
5. **Add More Cases**: Consider additional edge cases found during porting

### Test Naming Convention

```java
// Pattern: test + <Scenario> + <Context>
testCommonMappings()
testInvalidMappings()
testLeadingDollarQualifiedName()
testModuleStacktraceEntry()
```

### Fixture Organization

```
resources/
  <package-path>/
    <TestClass><Scenario>.txt
```

Example: `com/yworks/yguard/obf/LambdaMetaFactoryTest.txt`

## Extracting Fixtures for TypeScript

### Step-by-Step Process

1. **Identify all test cases** in `LogParserTest.java`:
   - Read test methods
   - Extract input arrays
   - Extract expected arrays
   - Note mapping configuration (prefix parameter)

2. **Create fixture files**:
   - For each test case, create three files:
     - `test-NNN-stack.txt`: Obfuscated input
     - `test-NNN-mapping.xml`: Mapping configuration
     - `test-NNN-expected.txt`: Expected output
   - Use consistent numbering (001, 002, etc.)

3. **Document fixture purpose**:
   - Create `fixtures-index.md` (see Phase 2 of spec.md)
   - Categorize by feature tested
   - Note special requirements

4. **Validate fixtures**:
   - Run through Java implementation
   - Confirm output matches expected
   - Document any discrepancies

## Test Automation

### Continuous Integration

The project uses GitHub Actions (see `.github/workflows/`).

**Typical CI workflow**:
1. Checkout code
2. Set up Java
3. Run `./gradlew build` (includes tests)
4. Publish test results
5. Report coverage

### Local Automation

```bash
# Watch for changes and run tests
./gradlew test --continuous

# Run tests with coverage
./gradlew test jacocoTestReport
# View: build/reports/jacoco/test/html/index.html
```

## Debugging Tests

### Enable Debug Output

Uncomment debug code in `LogParserTest.deobfuscate()`:

```java
final String[] out = parser.translate(input);
final StringBuffer sb = new StringBuffer();
for (int i = 0; i < out.length; ++i) {
  sb.append(out[i]).append('\n');
}
System.out.println(sb.toString());  // Debug output
```

### Run Single Test in IDE

1. Open `LogParserTest.java` in IDE
2. Right-click on test method
3. Select "Run" or "Debug"
4. View output in console

### Print Tree Structure

Add to test:
```java
YGuardLogParser parser = new YGuardLogParser();
parser.parse(new InputSource(new StringReader(mappings)));
printTree(parser.getTreeModel().getRoot(), 0);
```

## Summary

The yGuard test infrastructure provides:

- **Comprehensive coverage** of deobfuscation scenarios
- **Embedded fixtures** for quick testing (in `LogParserTest`)
- **External fixtures** for complex scenarios (in `resources/`)
- **Clear patterns** for adding new tests
- **Good documentation** through test names and structure

For the TypeScript port:
- **Reuse test cases** from `LogParserTest`
- **Extract fixtures** from embedded MAPPINGS and expected outputs
- **Validate against Java** implementation for 100% compatibility
- **Expand coverage** with additional edge cases as needed

## References

- **Main Test**: `src/test/java/com/yworks/yguard/LogParserTest.java`
- **Test Resources**: `src/test/resources/`
- **Build File**: `build.gradle` (test dependencies and configuration)
- **CI Configuration**: `.github/workflows/`
