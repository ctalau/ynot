# Standalone yGuard Deobfuscator (Java Reference Implementation)

This directory contains a minimal, standalone version of the yGuard deobfuscator extracted from the [yWorks/yGuard](https://github.com/yWorks/yGuard/) project. It has been simplified to remove all external dependencies and GUI components, making it suitable for:

1. **Fixture Validation**: Validating test fixtures against the original Java implementation
2. **Reference Implementation**: Serving as a reference for the TypeScript port
3. **Baseline Testing**: Ensuring behavioral compatibility

## What's Included

### Source Files

- **YGuardLogParser.java**: Main deobfuscator class (modified to remove GUI)
- **Conversion.java**: Java signature conversion utilities (modified to remove unused methods)
- **ObfuscatorTask.java**: Line number scrambling/unscrambling (minimal version)

### Scripts

- **build.sh**: Compilation script (no build tools required, just javac)
- **test.sh**: Test runner that validates all fixtures

## Dependencies

**None!** This standalone version requires only:
- JDK 7 or higher (built-in XML parser and standard library only)
- No Maven, Gradle, or external JARs

## Building

```bash
./build.sh
```

This compiles all Java sources to the `build/` directory.

## Running the Deobfuscator

### Command Line Mode

Translate a single obfuscated name:

```bash
java -cp build com.yworks.yguard.YGuardLogParser mapping.xml "A.A.A.A"
```

Translate multiple names:

```bash
java -cp build com.yworks.yguard.YGuardLogParser mapping.xml "A.A.A.A" "A.A.A.B.A"
```

### Pipe Mode

Process stack traces from stdin:

```bash
java -cp build com.yworks.yguard.YGuardLogParser mapping.xml -pipe < obfuscated.txt > deobfuscated.txt
```

Example:
```bash
echo -e "A.A.A.A\n\tat A.A.A.A.A()" | \
  java -cp build com.yworks.yguard.YGuardLogParser mapping.xml -pipe
```

## Running Tests

Validate all fixtures against the Java implementation:

```bash
./test.sh
```

This will:
1. Build the project
2. Run each fixture through the deobfuscator
3. Compare actual output with expected output
4. Report results with color-coded output

### Test Output Example

```
Running fixture tests...
========================================

Testing category: common-mappings
----------------------------------------
✓ common-mappings/mapping

Testing category: invalid-mappings
----------------------------------------
✓ invalid-mappings/001-no-prefix-mapping
✓ invalid-mappings/002-with-prefix-mapping

...

========================================
Test Results:
  Total:  21
  Passed: 21
  Failed: 0
========================================
```

## Modifications from Original

### Removed Components

1. **GUI (LogParserView)**: The Swing-based GUI is not included. GUI mode now shows an error message.
2. **ClassTree Dependency**: The `mapSignature()` method in Conversion.java has been commented out (not used for basic deobfuscation).
3. **Build System**: No Maven or Gradle - uses simple shell scripts instead.

### Simplified Components

- **ObfuscatorTask.java**: Only contains the `LineNumberScrambler` inner class, all other obfuscation functionality removed.

### Why These Changes?

- **Zero Dependencies**: Makes the code easier to understand and port to TypeScript
- **Focus on Deobfuscation**: Removes obfuscation-related code to focus only on the reverse process
- **Simplicity**: Easier to build and test without complex build systems

## File Structure

```
java-reference/
├── src/
│   └── com/yworks/yguard/
│       ├── YGuardLogParser.java     # Main deobfuscator (1280 lines)
│       ├── Conversion.java           # Signature conversion (246 lines)
│       └── ObfuscatorTask.java       # Line number scrambling (80 lines)
├── build/                            # Compiled classes (generated)
├── build.sh                          # Build script
├── test.sh                           # Test runner
└── README.md                         # This file
```

## Usage in TypeScript Port

This reference implementation serves as:

1. **Specification**: The definitive behavior for edge cases
2. **Validation**: All TypeScript tests must match Java output exactly
3. **Reference**: When in doubt about algorithm details, check the Java code

## Mapping File Format

The deobfuscator expects yGuard XML mapping files:

```xml
<yguard version="1.5">
  <expose>
    <!-- Elements that were NOT obfuscated -->
  </expose>
  <map>
    <!-- Obfuscation mappings -->
    <package name="original.package" map="obfuscated"/>
    <class name="original.Class" map="ObfClass"/>
    <method class="original.Class" name="void method()" map="a"/>
    <field class="original.Class" name="field" map="b"/>
  </map>
</yguard>
```

### Prefix Handling

Packages can include an obfuscation prefix using `/` delimiter:

```xml
<package name="com" map="prefix/A"/>
```

This means the obfuscated package is `prefix.A.A.A` (slash becomes dot in output).

## Supported Features

✓ Package deobfuscation
✓ Class deobfuscation (including inner classes with `$`)
✓ Method deobfuscation (including overloaded methods)
✓ Field deobfuscation
✓ Stack trace parsing (standard Java format)
✓ Module-qualified names (Java 9+)
✓ Obfuscation prefix handling
✓ Line number descrambling (when salt is present)
✓ Leading `$` in identifiers
✓ Graceful degradation for missing mappings

## Limitations

✗ GUI mode not supported
✗ JRockit VM stack trace format (could be added if needed)
✗ Generic signature mapping (mapSignature() removed)

## Testing Against Fixtures

The `test.sh` script validates all 35 test cases across 6 categories:

1. **common-mappings** (4 tests): Basic deobfuscation
2. **invalid-mappings** (8 tests): Error handling and prefix behavior
3. **leading-dollar** (4 tests): Special character handling
4. **module-qualified** (12 tests): Java 9+ module support
5. **overload** (3 tests): Method overloading
6. **prefixed** (4 tests): Obfuscation prefix configuration

All tests must pass (21/21) for the fixtures to be considered valid.

## License

This code is extracted from yGuard, which is licensed under the MIT License.

Original project: https://github.com/yWorks/yGuard/
Copyright (c) yWorks GmbH

## See Also

- **docs/java-classes.md**: Detailed documentation of the deobfuscation classes
- **docs/java-setup.md**: Build and setup instructions for the full yGuard project
- **docs/java-tests.md**: Test infrastructure documentation
- **fixtures/**: Test fixtures validated by this implementation
