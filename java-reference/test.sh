#!/bin/bash
# Test runner for yGuard deobfuscator fixtures
# Validates all fixtures against the Java implementation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build first
./build.sh
echo ""

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Find all fixture directories
FIXTURE_DIRS=$(find ../fixtures -mindepth 1 -maxdepth 1 -type d | sort)

echo "Running fixture tests..."
echo "========================================"

for category_dir in $FIXTURE_DIRS; do
    category=$(basename "$category_dir")
    echo ""
    echo "Testing category: $category"
    echo "----------------------------------------"

    # Find all mapping files in this category
    for mapping_file in "$category_dir"/*.xml "$category_dir"/*-mapping.xml; do
        if [ ! -f "$mapping_file" ]; then
            continue
        fi

        # Derive the input and expected file names
        base=$(basename "$mapping_file" .xml)
        base=$(echo "$base" | sed 's/-mapping$//')

        # Try different naming patterns
        if [ -f "$category_dir/${base}-input.txt" ]; then
            input_file="$category_dir/${base}-input.txt"
            expected_file="$category_dir/${base}-expected.txt"
        elif [ -f "$category_dir/input.txt" ]; then
            input_file="$category_dir/input.txt"
            expected_file="$category_dir/expected.txt"
        else
            continue
        fi

        if [ ! -f "$input_file" ] || [ ! -f "$expected_file" ]; then
            continue
        fi

        TOTAL=$((TOTAL + 1))
        test_name="$category/$(basename "$mapping_file" .xml)"

        # Run the deobfuscator
        actual_output=$(java -cp build com.yworks.yguard.YGuardLogParser "$mapping_file" -pipe < "$input_file" 2>&1)
        expected_output=$(cat "$expected_file")

        # Compare outputs
        if [ "$actual_output" = "$expected_output" ]; then
            echo -e "${GREEN}✓${NC} $test_name"
            PASSED=$((PASSED + 1))
        else
            echo -e "${RED}✗${NC} $test_name"
            FAILED=$((FAILED + 1))
            echo "  Expected:"
            echo "$expected_output" | head -3 | sed 's/^/    /'
            if [ $(echo "$expected_output" | wc -l) -gt 3 ]; then
                echo "    ..."
            fi
            echo "  Actual:"
            echo "$actual_output" | head -3 | sed 's/^/    /'
            if [ $(echo "$actual_output" | wc -l) -gt 3 ]; then
                echo "    ..."
            fi
        fi
    done
done

echo ""
echo "========================================"
echo "Test Results:"
echo "  Total:  $TOTAL"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "  ${RED}Failed: $FAILED${NC}"
else
    echo -e "  ${GREEN}Failed: $FAILED${NC}"
fi
echo "========================================"

if [ $FAILED -gt 0 ]; then
    exit 1
fi
