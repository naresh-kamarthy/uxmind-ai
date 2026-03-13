import { describe, it, expect, vi } from 'vitest';
import { estimateCost, generateConfidence } from '../../utils/tokenEstimator';

describe('tokenEstimator utilities', () => {
  describe('estimateCost', () => {
    it('should calculate cost correctly for 1000 tokens', () => {
      expect(estimateCost(1000)).toBe(0.0001);
    });

    it('should calculate cost correctly for 0 tokens', () => {
      expect(estimateCost(0)).toBe(0);
    });

    it('should calculate cost correctly for 5000 tokens', () => {
      expect(estimateCost(5000)).toBe(0.0005);
    });
  });

  describe('generateConfidence', () => {
    it('should return a value between 85 and 95', () => {
      const confidence = generateConfidence();
      expect(confidence).toBeGreaterThanOrEqual(85);
      expect(confidence).toBeLessThanOrEqual(95);
    });

    it('should return different values on multiple calls', () => {
      const val1 = generateConfidence();
      const val2 = generateConfidence();
      // This might fail if random returns same value, but highly unlikely
      // We can mock Math.random if we want deterministic tests
      vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
      expect(generateConfidence()).toBe(86);
      expect(generateConfidence()).toBe(94);
      vi.restoreAllMocks();
    });
  });
});
