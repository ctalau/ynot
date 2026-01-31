package com.yworks.yguard;

import java.util.Random;

/**
 * Minimal version of ObfuscatorTask containing only LineNumberScrambler.
 * Extracted from yGuard for standalone deobfuscation functionality.
 */
public class ObfuscatorTask {

  /**
   * The type Line number scrambler.
   */
  public static final class LineNumberScrambler {
    private int[] scrambled;
    private int[] unscrambled;

    /**
     * Instantiates a new Line number scrambler.
     *
     * @param size the size
     * @param seed the seed
     */
    public LineNumberScrambler(int size, long seed){
      this.scrambled = new int[size];
      this.unscrambled = new int[size];
      for (int i = 0; i < size; i++){
        this.scrambled[i] = i;
        this.unscrambled[i] = i;
      }
      Random r = new Random(seed);
      for (int i = 0; i < 10; i++){
        for (int j = 0; j < size; j++){
          int otherIndex = r.nextInt(size);
          if (otherIndex != j){
            int pos1 = this.scrambled[j];
            int pos2 = this.scrambled[otherIndex];

            int p1 = this.unscrambled[pos1];
            int p2 = this.unscrambled[pos2];
            this.unscrambled[pos1] = p2;
            this.unscrambled[pos2] = p1;

            this.scrambled[j] = pos2;
            this.scrambled[otherIndex] = pos1;
          }
        }
      }
    }

    /**
     * Scramble int.
     *
     * @param i the
     * @return the int
     */
    public int scramble(int i){
      if (i >= scrambled.length){
        return scrambled[i % scrambled.length] + (i / scrambled.length) * scrambled.length;
      } else {
        return scrambled[i];
      }
    }

    /**
     * Unscramble int.
     *
     * @param i the
     * @return the int
     */
    public int unscramble(int i){
      if (i >= scrambled.length){
        return unscrambled[i % scrambled.length] + (i / scrambled.length) * scrambled.length;
      } else {
        return unscrambled[i];
      }
    }
  }
}
