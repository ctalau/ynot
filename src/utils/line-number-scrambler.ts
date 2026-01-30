/**
 * Line number unscrambler based on yGuard's LineNumberScrambler algorithm
 *
 * Uses a seeded pseudo-random shuffle to unscramble obfuscated line numbers
 */
export class LineNumberScrambler {
  private scrambled: number[];
  private unscrambled: number[];

  constructor(size: number, seed: number) {
    this.scrambled = new Array(size);
    this.unscrambled = new Array(size);

    // Initialize arrays
    for (let i = 0; i < size; i++) {
      this.scrambled[i] = i;
      this.unscrambled[i] = i;
    }

    // Seed the random generator and shuffle
    const rng = new SeededRandom(seed);

    // Perform 10 rounds of shuffling
    for (let round = 0; round < 10; round++) {
      for (let j = 0; j < size; j++) {
        const otherIndex = rng.nextInt(size);

        if (otherIndex !== j) {
          const pos1 = this.scrambled[j];
          const pos2 = this.scrambled[otherIndex];

          const p1 = this.unscrambled[pos1];
          const p2 = this.unscrambled[pos2];

          this.unscrambled[pos1] = p2;
          this.unscrambled[pos2] = p1;

          this.scrambled[j] = pos2;
          this.scrambled[otherIndex] = pos1;
        }
      }
    }
  }

  /**
   * Scramble a line number (for testing)
   */
  scramble(i: number): number {
    if (i >= this.scrambled.length) {
      return (
        this.scrambled[i % this.scrambled.length] +
        Math.floor(i / this.scrambled.length) * this.scrambled.length
      );
    }
    return this.scrambled[i];
  }

  /**
   * Unscramble a line number
   */
  unscramble(i: number): number {
    if (i >= this.unscrambled.length) {
      return (
        this.unscrambled[i % this.unscrambled.length] +
        Math.floor(i / this.unscrambled.length) * this.unscrambled.length
      );
    }
    return this.unscrambled[i];
  }
}

/**
 * Simple seeded random number generator compatible with Java's Random
 */
class SeededRandom {
  private seed: number;

  constructor(initialSeed: number) {
    // Simulate Java's Random initialization
    // Use bitwise AND with 0xFFFFFFFF for 32-bit operations, then shift to 48-bit
    this.seed = (initialSeed ^ 0x5deece66d) >>> 0;
  }

  /**
   * Generate next random integer in range [0, n)
   */
  nextInt(n: number): number {
    if (n <= 0) {
      throw new Error('n must be positive');
    }

    if ((n & (n - 1)) === 0) {
      // n is a power of 2
      return ((n * this.next(31)) | 0) >> 31;
    }

    let bits, val;
    do {
      bits = this.next(31);
      val = bits % n;
    } while (bits - val + (n - 1) < 0);

    return val;
  }

  /**
   * Generate next random value
   */
  private next(bits: number): number {
    // Simulate LCG (Linear Congruential Generator) like Java's Random
    // Using 32-bit arithmetic for JavaScript compatibility
    const mul = 25214903917;
    const add = 11;

    // Simple LCG implementation
    this.seed = ((this.seed * mul + add) >>> 0);

    // Extract the desired number of bits
    return (this.seed >>> (32 - bits)) >>> 0;
  }
}
