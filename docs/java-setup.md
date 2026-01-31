# yGuard Java Project Setup

## Repository Information

- **Repository URL**: https://github.com/yWorks/yGuard/
- **Main Branch**: master
- **Build System**: Gradle
- **Java Version**: Java 7+
- **Main Class**: `com.yworks.yguard.YGuardLogParser`

## Project Structure

```
yGuard/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/yworks/
│   │           ├── yguard/          # Main yGuard package
│   │           ├── yshrink/         # Shrinking functionality
│   │           └── logging/         # Logging utilities
│   └── test/
│       ├── java/                    # Test source files
│       └── resources/               # Test fixtures and data
├── annotation/                       # Annotation subproject
├── examples/                         # Usage examples
├── docs/                            # Documentation
├── build.gradle                     # Main build configuration
├── settings.gradle                  # Gradle settings
├── gradlew                          # Gradle wrapper (Unix)
└── gradlew.bat                      # Gradle wrapper (Windows)
```

## Build System Configuration

### Gradle Configuration

The project uses **Gradle** with the following plugins:
- `java-library-distribution` - Java library with distribution support
- `maven-publish` - Maven publication
- `signing` - Package signing for Maven Central
- `org.ec4j.editorconfig` - Coding style enforcement

### Key Dependencies

From `build.gradle`:
- **ASM 9.6** (`org.ow2.asm:asm:9.6`) - Java bytecode manipulation
- **Apache Ant 1.10.14** (`org.apache.ant:ant:1.10.14`) - Build tool integration
- **JUnit 4.13.2** (`junit:junit:4.13.2`) - Testing framework
- **Annotation Project** - Internal annotation module

### Build Properties

- Source/Target Compatibility: Java 1.7
- Version Format: `${VERSION_MAJOR}.${VERSION_MINOR}`
- Main JAR includes ASM library in classpath
- Main-Class manifest entry: `com.yworks.yguard.YGuardLogParser`

## Building the Project

### Prerequisites

- Java Development Kit (JDK) 7 or higher
- No need to install Gradle (uses Gradle wrapper)

### Clone the Repository

```bash
git clone https://github.com/yWorks/yGuard.git
cd yGuard
```

### Build Commands

#### Standard Build
```bash
./gradlew build
```

This command will:
1. Generate source files (version substitution)
2. Compile Java sources
3. Run all tests
4. Create JAR files
5. Run code style checks

#### Clean Build
```bash
./gradlew clean build
```

#### Build Without Tests
```bash
./gradlew build -x test
```

#### Create Distribution Bundle
```bash
./gradlew assembleBundleDist
```

This creates a distribution bundle for Ant users, including:
- Compiled JAR
- Dependencies (ASM library)
- Examples
- License and README

#### Build with Documentation
```bash
./gradlew assembleBundleDist -Pcopy-docs
```

### Build Output Locations

- **Compiled Classes**: `build/classes/java/main/`
- **JAR File**: `build/libs/yguard-${version}.jar`
- **Distribution**: `build/distributions/`
- **Test Results**: `build/test-results/`
- **Generated Sources**: `build/generated-src/`

## Running Tests

### Run All Tests
```bash
./gradlew test
```

### Run Specific Test Class
```bash
./gradlew test --tests LogParserTest
```

### Run Tests with Output
```bash
./gradlew test --info
```

### Test Reports

After running tests, HTML reports are available at:
```
build/reports/tests/test/index.html
```

## Running the Deobfuscator

### Command Line Usage

The YGuardLogParser can be run in three modes:

#### 1. GUI Mode (No Arguments)
```bash
java -jar build/libs/yguard-${version}.jar logfile.xml
```

Opens a GUI for interactive deobfuscation.

#### 2. Direct Translation
```bash
java -jar build/libs/yguard-${version}.jar logfile.xml "A.A.A.A"
```

Translates the provided name(s) and prints the result.

#### 3. Pipe Mode
```bash
java -jar build/libs/yguard-${version}.jar logfile.xml -pipe < obfuscated.txt > deobfuscated.txt
```

Reads from stdin and writes deobfuscated output to stdout.

### Using Main Class Directly
```bash
java -cp build/libs/yguard-${version}.jar:lib/asm-9.6.jar com.yworks.yguard.YGuardLogParser logfile.xml
```

### Gzipped Log Files

The tool supports gzipped log files:
```bash
java -jar build/libs/yguard-${version}.jar logfile.xml.gz
```

## IDE Setup

### IntelliJ IDEA

1. Open the `yGuard` directory in IntelliJ
2. IntelliJ will automatically detect the Gradle project
3. Wait for Gradle sync to complete
4. Sources, tests, and resources will be marked automatically

### Eclipse

1. Import as "Existing Gradle Project"
2. Select the `yGuard` directory
3. Wait for Gradle import to complete

### VS Code

1. Install the "Extension Pack for Java"
2. Open the `yGuard` directory
3. The Gradle extension will detect the project automatically

## Documentation

### Building Documentation

The project uses [mkdocs](https://www.mkdocs.org/) for documentation:

```bash
# Install mkdocs
pip3 install mkdocs mkdocs-material

# Build documentation
mkdocs build

# Serve documentation locally
mkdocs serve
```

Documentation will be available at `http://localhost:8000/`

## Common Issues

### Issue: OutOfMemoryError during build
**Solution**: Increase Gradle memory:
```bash
export GRADLE_OPTS="-Xmx2048m"
./gradlew build
```

### Issue: Tests fail due to missing resources
**Solution**: Run `./gradlew clean` before building

### Issue: Java version mismatch
**Solution**: Ensure JDK 7+ is installed and JAVA_HOME is set correctly

## Project Version Information

Version numbers are defined in `gradle.properties`:
- `VERSION_MAJOR` - Major version number
- `VERSION_MINOR` - Minor version number

The version string is injected into source files during the build process (see `generateSources` task).

## Continuous Integration

The project uses GitHub Actions for CI/CD:
- Workflow: `.github/workflows/`
- Runs on: Push and Pull Request events
- Tests on: Multiple Java versions

## Additional Resources

- **Online Documentation**: https://yworks.github.io/yGuard/
- **yWorks Website**: https://www.yworks.com/products/yguard
- **GitHub Issues**: https://github.com/yWorks/yGuard/issues
- **Examples**: See `examples/` directory for various use cases
