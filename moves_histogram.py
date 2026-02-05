#!/usr/bin/env python3
import requests
import json
from collections import Counter
import matplotlib.pyplot as plt

url = "https://www.michaelfogleman.com/rushserver/random.json"
num_requests = 100
moves_list = []

print(f"Fetching {num_requests} random boards...")

for i in range(num_requests):
    try:
        response = requests.get(url, timeout=10, verify=False)
        response.raise_for_status()
        data = response.json()
        moves = data.get("moves")
        moves_list.append(moves)
        if (i + 1) % 20 == 0:
            print(f"... fetched {i + 1} boards")
    except Exception as e:
        print(f"Error fetching board {i + 1}: {e}")

print(f"\nCollected {len(moves_list)} boards")

# Create histogram
move_counts = Counter(moves_list)
sorted_moves = sorted(move_counts.items())

print("\nMove distribution:")
for moves, count in sorted_moves:
    print(f"  {moves} moves: {count} boards")

# Create matplotlib histogram
plt.figure(figsize=(12, 6))
moves_values = [item[0] for item in sorted_moves]
counts = [item[1] for item in sorted_moves]

plt.bar(moves_values, counts, color='steelblue', edgecolor='black')
plt.xlabel('Number of Moves Required', fontsize=12)
plt.ylabel('Frequency', fontsize=12)
plt.title('Distribution of Moves Required to Solve Random Boards (n=100)', fontsize=14)
plt.grid(axis='y', alpha=0.3)
plt.xticks(range(min(moves_values), max(moves_values) + 1))
plt.tight_layout()
plt.savefig('moves_histogram.png', dpi=150, bbox_inches='tight')
print("\nHistogram saved to moves_histogram.png")

# Print statistics
print(f"\nStatistics:")
print(f"  Min moves: {min(moves_list)}")
print(f"  Max moves: {max(moves_list)}")
print(f"  Average moves: {sum(moves_list) / len(moves_list):.2f}")
