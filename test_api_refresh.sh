#!/bin/bash

url="https://www.michaelfogleman.com/rushserver/random.json"
max_tries=250
declare -A seen_results

for attempt in $(seq 1 $max_tries); do
    result=$(curl -sk "$url" 2>/dev/null)

    if [[ -z "$result" ]]; then
        echo "Error: Empty response at attempt $attempt"
        exit 1
    fi

    if [[ -v seen_results["$result"] ]]; then
        first_attempt=${seen_results["$result"]}
        repeats_after=$((attempt - first_attempt))
        echo "Result repeated!"
        echo "First seen at attempt: $first_attempt"
        echo "Repeated at attempt: $attempt"
        echo "Repeated after $repeats_after requests"
        echo "Result: $result"
        exit 0
    fi

    seen_results["$result"]=$attempt

    if (( attempt % 10 == 0 )); then
        echo "... $attempt requests, ${#seen_results[@]} unique results so far"
    fi
done

echo "No repeats found after $max_tries requests"
echo "Total unique results: ${#seen_results[@]}"
