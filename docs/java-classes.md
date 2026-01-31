# yGuard Core Classes Documentation

## Overview

This document provides detailed information about the core classes involved in the yGuard deobfuscation process. The main functionality is centered around parsing obfuscated names and stack traces using an XML mapping file generated during the obfuscation process.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     YGuardLogParser                          │
│  (Main Entry Point - Coordinates deobfuscation)             │
│                                                              │
│  - parse(File/URL/InputSource)                              │
│  - translate(String fqn)                                     │
│  - translate(MyStackTraceElement)                            │
│  - translate(String[] stackTraceLines)                       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├──> MyContentHandler (SAX XML Parser)
                  │    - Parses mapping XML file
                  │    - Builds internal tree structure
                  │    - Handles <map>, <expose>, <property> sections
                  │
                  ├──> Tree Structure (javax.swing.tree)
                  │    - DefaultTreeModel (root)
                  │    - DefaultMutableTreeNode (nodes)
                  │    │
                  │    └──> Mapped Structs (user objects)
                  │         - PackageStruct
                  │         - ClassStruct
                  │         - MethodStruct
                  │         - FieldStruct
                  │
                  ├──> MyStackTraceElement
                  │    - Represents a stack trace entry
                  │    - Contains: className, methodName, fileName, lineNumber
                  │
                  ├──> CharConverter
                  │    - Converts HTML entities (&#NNNNN;)
                  │
                  └──> LineNumberScrambler (from ObfuscatorTask)
                       - Unscrambles line numbers if scrambling-salt is present
```

## Core Classes

### 1. YGuardLogParser (Main Class)

**Location**: `src/main/java/com/yworks/yguard/YGuardLogParser.java`

**Purpose**: Primary entry point for deobfuscation. Parses yGuard XML mapping files and provides methods to translate obfuscated names back to their original forms.

**Key Responsibilities**:
- Parse XML mapping files (including gzipped files)
- Build internal tree structure of mappings (packages, classes, methods, fields)
- Translate fully qualified names (FQNs)
- Translate stack trace elements
- Translate entire stack traces with regex pattern matching
- Handle module-qualified names (Java 9+)
- Handle inner classes and anonymous classes
- Handle method overloading
- Handle line number descrambling

**Key Methods**:

```java
// Parsing
void parse(File file)
void parse(URL url)
void parse(InputSource is)

// Translation
String translate(String fqn)
MyStackTraceElement translate(MyStackTraceElement ste)
String[] translate(String[] stackTraceLines)

// Tree Navigation
DefaultMutableTreeNode getPackageNode(String packageName, boolean useMap)
DefaultMutableTreeNode getClassNode(String fqn, boolean useMap)
DefaultMutableTreeNode getMethodNode(String cname, String fqn, boolean useMap)
DefaultMutableTreeNode getFieldNode(String cname, String fqn, boolean useMap)
```

**Internal Data Structure**:
- Uses `DefaultTreeModel` with `DefaultMutableTreeNode`
- Tree hierarchy: Root → Packages → Classes → Methods/Fields
- Supports nested classes (using `$` delimiter)
- Sorted insertion for efficient lookup

**Pattern Matching**:
The `translate(String[])` method uses three regex patterns:
1. **jrockitPattern**: JRockit VM stack trace format
2. **stePattern**: Standard Java stack trace format
3. **fqnPattern**: Fully qualified names (for replacing in arbitrary text)

**Special Features**:
- **Module Support**: Handles Java 9+ module prefixes (e.g., `module.name/com.example.Class`)
- **Obfuscation Prefix**: Supports prefix added during obfuscation (configurable)
- **Line Number Descrambling**: Reverses line number scrambling using salt from mapping file
- **Method Overloading**: Handles multiple methods mapped to same obfuscated name (displays as `method1|method2`)

### 2. MyContentHandler (Inner Class)

**Location**: `YGuardLogParser.java` (inner class)

**Purpose**: SAX-based XML parser for yGuard mapping files.

**XML Structure Handled**:

```xml
<yguard version="1.5">
  <property name="key" value="value" owner="com.example.Class"/>
  <expose>
    <!-- Elements that were exposed (not obfuscated) -->
    <package name="..."/>
    <class name="..."/>
    <method class="..." name="..."/>
    <field class="..." name="..."/>
  </expose>
  <map>
    <!-- Obfuscation mappings -->
    <package name="original.package" map="A"/>
    <class name="original.Class" map="B"/>
    <method class="..." name="original()" map="C"/>
    <field class="..." name="originalField" map="D"/>
  </map>
</yguard>
```

**Key Fields**:
- `inMapSection`: Tracks if currently in `<map>` section
- `inExposeSection`: Tracks if currently in `<expose>` section
- `inLogSection`: Tracks if currently in `<yguard>` section
- `ownerProperties`: Stores properties (e.g., scrambling-salt for line numbers)

**Key Methods**:
- `startElement()`: Creates struct objects and adds to tree
- `endElement()`: Manages section state
- `startDocument()`: Initializes state

### 3. Mapped Interface and Structs

**Location**: `YGuardLogParser.java` (inner classes)

**Purpose**: Represent obfuscated elements with their original and obfuscated names.

**Hierarchy**:
```
Mapped (interface)
  ├── getName()
  ├── getMappedName()
  └── getIcon()

AbstractMappedStruct (implements Mapped)
  ├── PackageStruct
  ├── ClassStruct
  ├── MethodStruct
  └── FieldStruct
```

**PackageStruct**:
- Represents a package mapping
- Example: `com.yworks.test` → `A.A.A`

**ClassStruct**:
- Represents a class mapping
- Handles inner classes with `$` delimiter
- Example: `Test` → `A`, `Outer$Inner` → `B$C`

**MethodStruct**:
- Represents a method mapping
- Includes full signature in name
- Example: `void run()` → `A`, `boolean isEnabled()` → `B`

**FieldStruct**:
- Represents a field mapping
- Includes field signature
- Example: `enabled` → `A`

### 4. MyStackTraceElement (Inner Class)

**Location**: `YGuardLogParser.java` (inner class)

**Purpose**: Represents a single stack trace frame, similar to Java's `StackTraceElement`.

**Fields**:
- `className`: Fully qualified class name
- `methodName`: Method name (may include signature)
- `fileName`: Source file name
- `lineNumber`: Line number (or 0 if unknown)

**Key Methods**:
- Constructor: Creates from parsed stack trace data
- Getters/Setters for all fields
- `toString()`: Formats as standard stack trace line

**Example**:
```
Input:  at A.A.A.A.run(y:42)
Output: at com.yworks.test.Test.run(Test.java:42)
```

### 5. CharConverter (Inner Class)

**Location**: `YGuardLogParser.java` (inner class)

**Purpose**: Converts HTML entity-encoded characters in stack traces.

**Functionality**:
- Converts `&#NNNNN;` format to actual characters
- Uses regex pattern: `&#(\d{1,5});`
- Handles Unicode escapes

**Example**:
```java
CharConverter.convert("&#65;&#66;&#67;") // Returns "ABC"
```

### 6. ObfuscatorTask.LineNumberScrambler

**Location**: `src/main/java/com/yworks/yguard/ObfuscatorTask.java`

**Purpose**: Scrambles and unscrambles line numbers for additional obfuscation.

**Algorithm**:
- Uses Linear Congruential Generator (LCG)
- Salt value stored in mapping file as property
- Seed = salt XOR className.hashCode()
- Reversible transformation

**Usage in Deobfuscation**:
1. Extract `scrambling-salt` from properties
2. Calculate seed from salt and class name
3. Create scrambler with seed
4. Call `unscramble(lineNumber)` to get original line number

### 7. MapParser (Ant Task Support)

**Location**: `src/main/java/com/yworks/yguard/ant/MapParser.java`

**Purpose**: Ant task integration for parsing mapping files.

**Note**: Not directly used in deobfuscation, but part of the build/obfuscation process.

### 8. Conversion (Utility Class)

**Location**: `src/main/java/com/yworks/yguard/Conversion.java`

**Purpose**: Converts between different method signature formats.

**Key Method**:
- `toJavaArguments(String params)`: Converts internal format to Java format

**Example**:
```
Input:  [Ljava.lang.String;)V
Output: String[]
```

## Deobfuscation Algorithm

### Stack Trace Translation Process

1. **Parse Stack Trace Line**
   - Use regex to extract: class, method, file, line number
   - Handle module prefixes (Java 9+)
   - Handle obfuscation prefixes

2. **Translate Class Name**
   - Split by package delimiter (`.`)
   - Handle obfuscation prefix (slash delimiter)
   - Traverse tree structure
   - Build original class name

3. **Translate Method Name**
   - Find all methods in class with matching obfuscated name
   - Handle overloading (multiple methods → `method1|method2`)
   - Strip signature formatting

4. **Descramble Line Number**
   - Check for `scrambling-salt` property
   - Calculate seed from salt and class name
   - Use LineNumberScrambler to reverse scrambling

5. **Build File Name**
   - Extract base class name (before `$` for inner classes)
   - Append `.java` extension

6. **Format Output**
   - Construct standard stack trace format
   - Return translated element

### FQN Translation Process

1. **Tokenize Input**
   - Split by `.` and `$` delimiters
   - Track delimiters for reconstruction

2. **Handle Obfuscation Prefix**
   - Check for prefix packages
   - Use slash delimiter for prefix

3. **Traverse Tree**
   - Navigate from root through packages
   - Find classes, methods, or fields
   - Build original name progressively

4. **Handle Special Cases**
   - Module prefixes: `module/class`
   - Inner classes: `Outer$Inner`
   - Anonymous classes: `Outer$1`

## Key Data Structures

### Tree Structure

```
Root (DefaultMutableTreeNode)
  └─ Package: com (mapped: A)
      └─ Package: yworks (mapped: A)
          └─ Package: test (mapped: A)
              ├─ Class: Test (mapped: A)
              │   ├─ Method: void run() (mapped: A)
              │   ├─ Method: boolean isEnabled() (mapped: B)
              │   └─ Method: void setEnabled(boolean) (mapped: B)
              └─ Class: EnclosingClass (mapped: B)
                  └─ Class: InnerClass (mapped: C)
                      └─ Method: void run() (mapped: A)
```

### Properties Map

```java
Map<String, Map<String, String>> ownerProperties
// Key: Class name (owner)
// Value: Map of property name → property value
// Example: {"com.example.Test": {"scrambling-salt": "1234567890"}}
```

## Pattern Matching Details

### Stack Trace Patterns

**jrockitPattern** (JRockit VM format):
```
(prefix)? class.method(params)returnType(file:line)(suffix)
Example: at A.A.A.E.main([Ljava.lang.String;)V(y:1866)
```

**stePattern** (Standard Java format):
```
(prefix)? class.method(file:line)(suffix)
Example: at com.example.Test.run(Test.java:42)
```

**fqnPattern** (Fully Qualified Name):
```
package.package.Class
Example: com.yworks.test.Test
```

## Supporting Classes

### LogParserView (GUI)

**Location**: `src/main/java/com/yworks/yguard/LogParserView.java`

**Purpose**: Swing-based GUI for interactive deobfuscation.

**Features**:
- Load mapping file
- Paste stack traces
- View deobfuscated output
- Tree view of mappings

### Icons (Inner Class)

**Location**: `YGuardLogParser.java` (inner class)

**Purpose**: Provides icons for GUI tree view.

**Icon Types**:
- `CLASS_ICON`: Blue circle with "C"
- `METHOD_ICON`: Red circle with "M"
- `PACKAGE_ICON`: Yellow circle with "P"
- `FIELD_ICON`: Green circle with "F"

## Class Dependencies

### External Dependencies

1. **org.xml.sax.*** (XML Parsing)
   - `SAXParser`, `XMLReader`, `ContentHandler`
   - Used for parsing mapping files

2. **javax.swing.*** (GUI)
   - Tree components for GUI
   - Required for tree structure even in CLI mode

3. **java.util.regex.*** (Pattern Matching)
   - `Pattern`, `Matcher`
   - Used for stack trace parsing

### Internal Dependencies

- `ObfuscatorTask.LineNumberScrambler`: Line number descrambling
- `Conversion`: Signature format conversion
- `LogParserView`: GUI interface (optional)

## Edge Cases and Error Handling

### Missing Mappings
- If a class/method is not found in mapping file, returns original obfuscated name
- Gracefully degrades to partial deobfuscation

### Invalid Input
- Malformed stack traces are passed through unchanged
- Invalid line numbers default to 0

### Inner Classes
- Handles `$` delimiter for inner classes
- Supports anonymous classes (`$1`, `$2`, etc.)
- Handles `$` in class names (e.g., `$A`)

### Module System (Java 9+)
- Supports module prefixes: `module.name/class.name`
- Supports version info: `module@version/class.name`
- Supports layer info: `layer/module@version/class.name`

### Obfuscation Prefix
- Handles prefix added by yGuard (configurable)
- Uses `/` delimiter instead of `.` for prefix portions
- Example: `yguard/A.A.A` instead of `yguard.A.A.A`

## Performance Considerations

### Tree Lookup
- Binary search for child insertion (see `calcChildIndex()`)
- Maintains sorted order for faster lookups
- Time complexity: O(log n) for insertion, O(n) for lookups

### Caching
- No explicit caching of translations
- Tree structure serves as implicit cache
- Multiple translations reuse same tree

### Memory Usage
- Tree structure grows with mapping size
- Swing components add overhead even in CLI mode
- Consider streaming for very large mapping files

## Extension Points

### Custom Mapping Formats
- Extend `MyContentHandler` to support other XML schemas
- Implement custom `Mapped` structs for additional element types

### Additional Translation Logic
- Override `translate()` methods
- Add custom pattern matchers
- Implement custom descrambling algorithms

## Testing Strategy

See [java-tests.md](java-tests.md) for detailed testing information.

## References

- **Main Class**: YGuardLogParser.java (~1280 lines)
- **Supporting**: ObfuscatorTask.java (line number scrambling)
- **Supporting**: Conversion.java (signature conversion)
- **GUI**: LogParserView.java (interactive interface)
