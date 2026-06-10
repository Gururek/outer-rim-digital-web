import { describe, it, expect } from 'vitest';
import { CombatResolver } from './CombatResolver.js';

describe('CombatResolver', () => {
  describe('rollDice', () => {
    it('rolls the correct number of dice', () => {
      const result = CombatResolver.rollDice(3);
      expect(result.faces).toHaveLength(3);
    });

    it('always rolls at least 1 die', () => {
      const result = CombatResolver.rollDice(0);
      expect(result.faces).toHaveLength(1);
    });

    it('negative dice count defaults to 1', () => {
      const result = CombatResolver.rollDice(-5);
      expect(result.faces).toHaveLength(1);
    });

    it('returns valid dice faces', () => {
      for (let i = 0; i < 100; i++) {
        const result = CombatResolver.rollDice(5);
        for (const face of result.faces) {
          expect(['HIT', 'CRIT', 'FOCUS', 'BLANK']).toContain(face);
        }
      }
    });

    it('calculates totalDamage correctly (HIT=1, CRIT=2)', () => {
      // Run many rolls and verify the math is consistent
      for (let i = 0; i < 50; i++) {
        const result = CombatResolver.rollDice(5);
        const expected = result.faces.filter(f => f === 'HIT').length +
                        result.faces.filter(f => f === 'CRIT').length * 2;
        expect(result.totalDamage).toBe(expected);
      }
    });

    it('hitCount matches HIT faces', () => {
      for (let i = 0; i < 30; i++) {
        const result = CombatResolver.rollDice(4);
        expect(result.hitCount).toBe(result.faces.filter(f => f === 'HIT').length);
      }
    });

    it('critCount matches CRIT faces', () => {
      for (let i = 0; i < 30; i++) {
        const result = CombatResolver.rollDice(4);
        expect(result.critCount).toBe(result.faces.filter(f => f === 'CRIT').length);
      }
    });

    it('focusCount matches FOCUS faces', () => {
      for (let i = 0; i < 30; i++) {
        const result = CombatResolver.rollDice(4);
        expect(result.focusCount).toBe(result.faces.filter(f => f === 'FOCUS').length);
      }
    });

    it('blankCount matches BLANK faces', () => {
      for (let i = 0; i < 30; i++) {
        const result = CombatResolver.rollDice(4);
        expect(result.blankCount).toBe(result.faces.filter(f => f === 'BLANK').length);
      }
    });

    it('all face counts sum to total dice', () => {
      for (let i = 0; i < 30; i++) {
        const result = CombatResolver.rollDice(6);
        expect(result.hitCount + result.critCount + result.focusCount + result.blankCount).toBe(6);
      }
    });

    it('large dice pools work (e.g. 8 dice)', () => {
      const result = CombatResolver.rollDice(8);
      expect(result.faces).toHaveLength(8);
      expect(result.totalDamage).toBeGreaterThanOrEqual(0);
      expect(result.totalDamage).toBeLessThanOrEqual(16);
    });
  });

  describe('resolveSkillTest', () => {
    it('always rolls exactly 2 dice', () => {
      const result = CombatResolver.resolveSkillTest(0);
      expect(result.roll.faces).toHaveLength(2);
      const result2 = CombatResolver.resolveSkillTest(3);
      expect(result2.roll.faces).toHaveLength(2);
    });

    it('Unskilled (0): passes only on CRIT', () => {
      // Run many tests to verify the logic (statistical, not deterministic)
      let passedCount = 0;
      for (let i = 0; i < 100; i++) {
        const result = CombatResolver.resolveSkillTest(0);
        if (result.passed) passedCount++;
        // If passed, must have at least 1 CRIT
        if (result.passed) {
          expect(result.roll.critCount).toBeGreaterThanOrEqual(1);
        }
      }
      // Should be some passes (CRIT is 1/8 per die)
      expect(passedCount).toBeGreaterThan(0);
    });

    it('Skilled (1): passes on CRIT or HIT', () => {
      for (let i = 0; i < 30; i++) {
        const result = CombatResolver.resolveSkillTest(1);
        if (result.passed) {
          const hasHit = result.roll.hitCount >= 1;
          const hasCrit = result.roll.critCount >= 1;
          expect(hasHit || hasCrit).toBe(true);
        }
      }
    });

    it('Highly Skilled (2+): passes on CRIT, HIT, or FOCUS', () => {
      for (let i = 0; i < 30; i++) {
        const result = CombatResolver.resolveSkillTest(2);
        if (result.passed) {
          const hasHit = result.roll.hitCount >= 1;
          const hasCrit = result.roll.critCount >= 1;
          const hasFocus = result.roll.focusCount >= 1;
          expect(hasHit || hasCrit || hasFocus).toBe(true);
        }
      }
    });

    it('Highly Skilled (2+) almost always passes', () => {
      let passedCount = 0;
      for (let i = 0; i < 50; i++) {
        if (CombatResolver.resolveSkillTest(2).passed) passedCount++;
      }
      // Only BLANK+BLANK fails (2/8 * 2/8 = 6.25% fail rate)
      expect(passedCount).toBeGreaterThan(35);
    });

    it('Unskilled mostly fails', () => {
      let passedCount = 0;
      for (let i = 0; i < 50; i++) {
        if (CombatResolver.resolveSkillTest(0).passed) passedCount++;
      }
      // CRIT is 1/8 per die → ~23.4% pass rate for 2 dice
      expect(passedCount).toBeLessThan(30);
    });
  });
});
