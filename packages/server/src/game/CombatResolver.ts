import type { DieFace, DiceResult } from '@outer-rim/shared';

const DIE_FACES: DieFace[] = [
  'HIT', 'HIT', 'HIT',   // 3 sides
  'CRIT',                  // 1 side
  'FOCUS', 'FOCUS',       // 2 sides
  'BLANK', 'BLANK'        // 2 sides
];

export class CombatResolver {
  static rollDice(numDice: number): DiceResult {
    const count = Math.max(1, numDice);
    const faces: DieFace[] = Array.from({ length: count }, () =>
      DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)]
    );

    return {
      faces,
      totalDamage: faces.reduce((sum, f) => sum + (f === 'HIT' ? 1 : f === 'CRIT' ? 2 : 0), 0),
      hitCount: faces.filter(f => f === 'HIT').length,
      critCount: faces.filter(f => f === 'CRIT').length,
      focusCount: faces.filter(f => f === 'FOCUS').length,
      blankCount: faces.filter(f => f === 'BLANK').length,
    };
  }

  // Skill test: ALWAYS 2 dice
  // skillCount: 0 = Unskilled, 1 = Skilled, 2+ = Highly Skilled
  static resolveSkillTest(skillCount: number): { passed: boolean; roll: DiceResult } {
    const roll = this.rollDice(2);
    const passed =
      skillCount === 0 ? roll.critCount >= 1 :
      skillCount === 1 ? roll.critCount >= 1 || roll.hitCount >= 1 :
      /* 2+ */           roll.critCount >= 1 || roll.hitCount >= 1 || roll.focusCount >= 1;
    return { passed, roll };
  }
}
