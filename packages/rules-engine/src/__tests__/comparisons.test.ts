import { passesComparison } from '../comparisons.js';

describe('passesComparison', () => {
  describe('lte — actual must be less than or equal to threshold', () => {
    it('returns true when actual is below threshold', () => {
      expect(passesComparison(29.99, 'lte', 30, null, null)).toBe(true);
    });
    it('returns true when actual equals threshold', () => {
      expect(passesComparison(30, 'lte', 30, null, null)).toBe(true);
    });
    it('returns false when actual exceeds threshold', () => {
      expect(passesComparison(30.01, 'lte', 30, null, null)).toBe(false);
    });
  });

  describe('gte — actual must be greater than or equal to threshold', () => {
    it('returns true when actual is above threshold', () => {
      expect(passesComparison(10.01, 'gte', 10, null, null)).toBe(true);
    });
    it('returns true when actual equals threshold', () => {
      expect(passesComparison(10, 'gte', 10, null, null)).toBe(true);
    });
    it('returns false when actual is below threshold', () => {
      expect(passesComparison(9.99, 'gte', 10, null, null)).toBe(false);
    });
  });

  describe('lt — actual must be strictly less than threshold', () => {
    it('returns true when actual is below threshold', () => {
      expect(passesComparison(29.99, 'lt', 30, null, null)).toBe(true);
    });
    it('returns false when actual equals threshold', () => {
      expect(passesComparison(30, 'lt', 30, null, null)).toBe(false);
    });
  });

  describe('gt — actual must be strictly greater than threshold', () => {
    it('returns true when actual is above threshold', () => {
      expect(passesComparison(30.01, 'gt', 30, null, null)).toBe(true);
    });
    it('returns false when actual equals threshold', () => {
      expect(passesComparison(30, 'gt', 30, null, null)).toBe(false);
    });
  });

  describe('eq — actual must exactly equal threshold', () => {
    it('returns true when actual equals threshold', () => {
      expect(passesComparison(30, 'eq', 30, null, null)).toBe(true);
    });
    it('returns false when actual does not equal threshold', () => {
      expect(passesComparison(30.01, 'eq', 30, null, null)).toBe(false);
    });
  });

  describe('between — actual must be within [min, max] inclusive', () => {
    it('returns true when actual is within range', () => {
      expect(passesComparison(15, 'between', null, 10, 20)).toBe(true);
    });
    it('returns true when actual equals the minimum bound', () => {
      expect(passesComparison(10, 'between', null, 10, 20)).toBe(true);
    });
    it('returns true when actual equals the maximum bound', () => {
      expect(passesComparison(20, 'between', null, 10, 20)).toBe(true);
    });
    it('returns false when actual is below the minimum bound', () => {
      expect(passesComparison(9.99, 'between', null, 10, 20)).toBe(false);
    });
    it('returns false when actual is above the maximum bound', () => {
      expect(passesComparison(20.01, 'between', null, 10, 20)).toBe(false);
    });
  });
});
