/**
 * Line number scrambler for yGuard obfuscation
 * Ported from ObfuscatorTask.java LineNumberScrambler
 */

/**
 * Seeded random number generator (LCG implementation matching Java's Random)
 * Using the same algorithm as java.util.Random for compatibility
 */
class SeededRandom {
  private seed: bigint;

  constructor(seed: number) {
    // Java Random uses: seed = (seed ^ 0x5DEECE66D) & ((1 << 48) - 1)
    this.seed = (BigInt(seed) ^ 0x5deece66dn) & 0xffffffffffffn;
  }

  /**
   * Generate next random integer (31 bits)
   * Matches java.util.Random.nextInt()
   */
  next(bits: number): number {
    // Linear congruential generator: seed = (seed * 0x5DEECE66D + 0xB) & ((1 << 48) - 1)
    this.seed = (this.seed * 0x5deece66dn + 0xbn) & 0xffffffffffffn;
    return Number(this.seed >> BigInt(48 - bits));
  }

  /**
   * Generate random integer in range [0, n)
   * Matches java.util.Random.nextInt(int n)
   */
  nextInt(n: number): number {
    if (n <= 0) throw new Error('n must be positive');

    // Special case for powers of 2
    if ((n & -n) === n) {
      return (n * this.next(31)) >> 31;
    }

    let bits: number;
    let val: number;
    do {
      bits = this.next(31);
      val = bits % n;
    } while (bits - val + (n - 1) < 0);

    return val;
  }
}

/**
 * Line number scrambler/unscrambler
 * Uses a seeded random permutation to scramble line numbers
 */
export class LineNumberScrambler {
  private scrambled: number[];
  private unscrambled: number[];

  /**
   * Create a new line number scrambler
   * @param size Size of the scrambling table (typically 3584)
   * @param seed Random seed for scrambling
   */
  constructor(size: number, seed: number) {
    this.scrambled = new Array(size);
    this.unscrambled = new Array(size);

    // Initialize identity mapping
    for (let i = 0; i < size; i++) {
      this.scrambled[i] = i;
      this.unscrambled[i] = i;
    }

    // Apply random permutations (10 iterations as per Java implementation)
    const r = new SeededRandom(seed);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < size; j++) {
        const otherIndex = r.nextInt(size);
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
   * Scramble a line number
   * @param i Line number to scramble
   * @returns Scrambled line number
   */
  scramble(i: number): number {
    if (i >= this.scrambled.length) {
      return (
        this.scrambled[i % this.scrambled.length] +
        Math.floor(i / this.scrambled.length) * this.scrambled.length
      );
    } else {
      return this.scrambled[i];
    }
  }

  /**
   * Unscramble a line number
   * @param i Scrambled line number
   * @returns Original line number
   */
  unscramble(i: number): number {
    if (i >= this.scrambled.length) {
      return (
        this.unscrambled[i % this.scrambled.length] +
        Math.floor(i / this.scrambled.length) * this.scrambled.length
      );
    } else {
      return this.unscrambled[i];
    }
  }
}
