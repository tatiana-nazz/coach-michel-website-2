import { describe, expect, it } from 'vitest';

import { governedScreenModules } from '@/features/screen-contract-registry';

describe('governed screen placeholder registry', () => {
  it('contains exactly 31 unique governed screen IDs', () => {
    const ids = governedScreenModules.map(({ screenId }) => screenId);
    expect(ids).toHaveLength(31);
    expect(new Set(ids).size).toBe(31);
  });

  it('preserves required family counts', () => {
    const counts = governedScreenModules.reduce<Record<string, number>>((result, item) => {
      result[item.family] = (result[item.family] ?? 0) + 1;
      return result;
    }, {});

    expect(counts).toEqual({
      public: 5,
      access: 4,
      trainee: 8,
      coach: 10,
      operations: 4,
    });
  });

  it('marks every feature module as an authority-bound placeholder', () => {
    for (const item of governedScreenModules) {
      expect(item.screenId).toMatch(/^SCR-(PUB|ACC|TRN|COA|OPS)-\d{3}$/);
      expect(item.modulePath).toContain('/screens/scr-');
    }
  });
});
