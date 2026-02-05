#!/usr/bin/env python3
import requests
import json

url = "https://www.michaelfogleman.com/rushserver/random.json"
max_tries = 250

try:
    results = []
    result_strings = {}  # Map result JSON string to first attempt number

    # Make requests and track results
    for attempt in range(1, max_tries + 1):
        response = requests.get(url, timeout=10, verify=False)
        response.raise_for_status()
        current_result = response.json()
        result_str = json.dumps(current_result, sort_keys=True)

        if result_str not in result_strings:
            result_strings[result_str] = attempt
        else:
            # Found a repeat!
            first_attempt = result_strings[result_str]
            print(f"Result repeated!")
            print(f"First seen at attempt: {first_attempt}")
            print(f"Repeated at attempt: {attempt}")
            print(f"Repeated after {attempt - first_attempt} requests")
            print(f"Result: {json.dumps(current_result)}")
            break

        results.append((attempt, current_result))

        if attempt % 50 == 0:
            print(f"... {attempt} requests, {len(result_strings)} unique results so far")
    else:
        print(f"\nNo repeats found after {max_tries} requests")
        print(f"Total unique results: {len(result_strings)}")

except requests.exceptions.RequestException as e:
    print(f"Error making request: {e}")
except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
