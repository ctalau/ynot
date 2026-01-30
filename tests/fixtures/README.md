# Test Fixtures

This directory contains test fixtures for validating the yGuard deobfuscator implementation.

## Fixture Format

Each fixture should consist of three files:

1. **`{fixture_name}.xml`** - The yGuard mapping file (XML format)
   - Contains class, method, and field name mappings
   - May include properties like `scrambling-salt` for line number unscrambling

2. **`{fixture_name}.txt`** - The obfuscated stack trace
   - Original obfuscated stack as input to deobfuscator
   - Follows standard JavaScript/Java stack trace format

3. **`{fixture_name}.deobfuscated.txt`** - Expected deobfuscated output
   - Output from running Java implementation
   - Used as reference for testing TypeScript implementation

## Fixture Naming Convention

Use descriptive names:
- `simple_single_frame` - Simple single stack frame
- `multi_frame_nested` - Multiple nested calls
- `overloaded_methods` - Methods with overloading
- `inner_classes` - Inner class handling
- `missing_mappings` - Error case: unmapped symbols
- `line_number_scrambling` - Line number recovery test
- etc.

## Generating Fixtures

### Option 1: Create Manually
1. Create an obfuscated stack trace manually or from real code
2. Create a mapping file using yGuard (or manually)
3. Run Java deobfuscator to get expected output:
   ```bash
   java -cp yguard.jar com.yworks.yguard.YGuardLogParser mapping.xml -pipe < obfuscated.txt > expected.deobfuscated.txt
   ```

### Option 2: From Real Obfuscation
1. Obfuscate Java code with yGuard
2. Capture stack traces from exceptions
3. Use generated mapping files

### Option 3: Synthesize for Edge Cases
Create minimal fixtures targeting specific behaviors:
- Overloaded methods
- Missing mappings
- Deep nesting
- Special characters
- Different stack formats (V8, Firefox, Java, JRockit)

## Current Fixtures

(To be populated as fixtures are collected/created)

Total: 0/100 fixtures

## Quality Checklist

When adding a new fixture:
- [ ] Fixture name is descriptive and lowercase with underscores
- [ ] All three files present (.xml, .txt, .deobfuscated.txt)
- [ ] Mapping file is valid XML
- [ ] Stack trace follows a recognized format
- [ ] Expected output matches Java implementation output
- [ ] At least one deobfuscation occurs (not all unmapped)
- [ ] File sizes are reasonable (< 1MB each)
- [ ] Added to fixture index/list
