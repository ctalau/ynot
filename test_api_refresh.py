#!/usr/bin/env python3
import requests
import json

url = "https://www.michaelfogleman.com/rushserver/random.json"
max_tries = 250

try:
    # Get the first response
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    first_result = response.json()
    print(f"Initial result: {json.dumps(first_result)}")

    # Keep making requests until we get a different result
    for attempt in range(2, max_tries + 1):
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        current_result = response.json()

        if current_result != first_result:
            print(f"\nResult changed after {attempt - 1} request(s)!")
            print(f"New result: {json.dumps(current_result)}")
            break

        if attempt % 50 == 0:
            print(f"... {attempt} requests, still the same result")
    else:
        print(f"\nNo change after {max_tries} requests")

except requests.exceptions.RequestException as e:
    print(f"Error making request: {e}")
except json.JSONDecodeError as e:
    print(f"Error decoding JSON: {e}")
