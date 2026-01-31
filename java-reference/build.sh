#!/bin/bash
# Build script for standalone yGuard deobfuscator
# No external dependencies required - uses only JDK built-ins

set -e

echo "Building yGuard deobfuscator..."

# Clean previous build
rm -rf build
mkdir -p build

# Compile Java sources
javac -d build src/com/yworks/yguard/*.java

echo "Build complete! Classes compiled to build/"
echo ""
echo "Usage:"
echo "  java -cp build com.yworks.yguard.YGuardLogParser <mapping.xml> <obfuscated-name>"
echo "  java -cp build com.yworks.yguard.YGuardLogParser <mapping.xml> -pipe < input.txt > output.txt"
