# Rush Hour API Experiment

## Overview

This document records an experiment testing the random puzzle generation API at `https://www.michaelfogleman.com/rushserver/random.json`.

## API Endpoint

- **URL**: https://www.michaelfogleman.com/rushserver/random.json
- **Method**: GET
- **Response Format**: JSON
- **Purpose**: Generates random Rush Hour puzzle boards

## Response Format

Each response contains:
```json
{
  "desc": "string",           // Board configuration description
  "empty": number,            // Number of empty spaces
  "moves": number,            // Minimum moves to solve
  "occupied": number,         // Number of occupied spaces
  "pieces": number,           // Number of puzzle pieces
  "states": number,           // Number of game states
  "three": number,            // Count of 3-unit pieces
  "two": number,              // Count of 2-unit pieces
  "walls": number             // Number of walls
}
```

## Experiment 1: API Refresh Rate

### Objective
Determine how many requests are needed before the API returns a previously seen board configuration.

### Method
- Made sequential requests to the endpoint
- Tracked all unique board configurations
- Recorded when a duplicate appeared
- Ran multiple test iterations

### Results
The refresh rate varies significantly:
- **Run 1**: 144 requests
- **Run 2**: 214 requests
- **Run 3**: No repeats within 250 requests
- **Earlier runs**: 33, 50 requests

**Conclusion**: The API generates virtually infinite unique boards (or at least astronomically many). Repeats are rare and seem more coincidental than following a set cycle.

## Experiment 2: Puzzle Difficulty Distribution

### Objective
Analyze the distribution of puzzle difficulties across 100 randomly generated boards.

### Method
- Fetched 100 random boards via the API
- Extracted the "moves" value (minimum moves to solve) from each
- Created a histogram of the distribution

### Results

**Statistics**:
- **Minimum difficulty**: 15 moves
- **Maximum difficulty**: 49 moves
- **Average difficulty**: 30.74 moves
- **Mode**: 31 moves (9 boards)

**Distribution**:
- Most boards cluster around 20-40 moves
- Some challenging boards require 45-49 moves
- Easier boards exist at 15-19 moves
- Fairly wide spread across difficulty range

**Key Observations**:
- The puzzle generator produces a fairly balanced difficulty distribution
- Mid-to-high difficulty (30-35 moves) is most common
- No obvious clustering at extreme ends
- Average puzzle requires ~31 moves to solve optimally

## Technical Notes

- The API returns different results on every request (no caching observed)
- Response times are fast (typically under 1 second)
- SSL certificate validation needed to be disabled in initial tests due to environment issues
- The endpoint appears robust and handles high request frequency well

## Files Used

- `test_api_refresh.sh` - Shell script to detect when results repeat
- `moves_histogram.py` - Python script to generate difficulty distribution histogram
- `moves_histogram.png` - Resulting visualization of difficulty distribution

## Conclusion

The Rush Hour API is a reliable source of random puzzle configurations with good variety in difficulty levels. The generator produces a diverse set of solvable puzzles with moderate difficulty on average (around 31 moves), making it suitable for testing puzzle-solving algorithms or for casual gameplay.
