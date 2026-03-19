import { calculateMonthlyPayment } from '../math.js';
import {
  suggestReduceApr,
  suggestExtendTerm,
  suggestIncreaseDownPayment,
  generateRestructuringSuggestions,
} from '../restructuring.js';
import type { Violation } from '../types.js';
import { makeDeal } from './fixtures.js';

function makeAprViolation(thresholdValue: number, actualValue: number): Violation {
  return {
    ruleId: 'r-apr',
    ruleParameter: 'max_apr',
    displayDescription: `APR must not exceed ${thresholdValue}%`,
    severity: 'violation',
    actualValue,
    thresholdValue,
    comparisonOp: 'lte',
    statuteReferences: [],
  };
}

function makeLoanViolation(thresholdValue: number, actualValue: number): Violation {
  return {
    ruleId: 'r-loan',
    ruleParameter: 'max_loan_amount',
    displayDescription: `Loan amount must not exceed $${thresholdValue}`,
    severity: 'violation',
    actualValue,
    thresholdValue,
    comparisonOp: 'lte',
    statuteReferences: [],
  };
}

describe('Task 42: Restructuring edge cases', () => {
  // --- Edge case 1: Multiple simultaneous violations ---
  describe('multiple simultaneous violations (APR + loan amount)', () => {
    const deal = makeDeal({ apr: 40, termMonths: 48, salePrice: 15000, downPayment: 3000, loanAmount: 12000 });
    const violations: Violation[] = [
      makeAprViolation(36, 40),
      makeLoanViolation(10000, 12000),
    ];

    it('still generates APR-based suggestions when both APR and loan_amount violations exist', () => {
      const suggestions = generateRestructuringSuggestions(deal, violations);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('all returned suggestions target the APR violation (suggestedApr = 36)', () => {
      const suggestions = generateRestructuringSuggestions(deal, violations);
      for (const s of suggestions) {
        expect(s.suggestedApr).toBe(36);
      }
    });

    it('reduce_apr suggestion is still first when APR violation is present alongside other violations', () => {
      const suggestions = generateRestructuringSuggestions(deal, violations);
      expect(suggestions[0].strategy).toBe('reduce_apr');
    });
  });

  // --- Edge case 2: Only non-APR violations (e.g., max_loan_amount) — 0% APR won't help ---
  describe('max_loan_amount violation only — APR reduction cannot fix an oversized loan', () => {
    const deal = makeDeal({ apr: 25, termMonths: 48, salePrice: 20000, downPayment: 2000, loanAmount: 18000 });
    const violations: Violation[] = [makeLoanViolation(10000, 18000)];

    it('generateRestructuringSuggestions returns empty array when only loan_amount is violated', () => {
      expect(generateRestructuringSuggestions(deal, violations)).toEqual([]);
    });

    it('suggestReduceApr returns null — no APR violation to target', () => {
      expect(suggestReduceApr(deal, violations)).toBeNull();
    });

    it('suggestExtendTerm returns null — no APR violation to target', () => {
      expect(suggestExtendTerm(deal, violations)).toBeNull();
    });

    it('suggestIncreaseDownPayment returns null — no APR violation to target', () => {
      expect(suggestIncreaseDownPayment(deal, violations)).toBeNull();
    });
  });

  // --- Edge case 3: All three strategies viable — verify ranking order ---
  describe('all three strategies viable — ordering is reduce_apr, extend_term, increase_down_payment', () => {
    // 36-month term (extendable), manageable down payment (increase_down_payment not blocked by 50% cap)
    const deal = makeDeal({ apr: 40, termMonths: 36, salePrice: 15000, downPayment: 2000, loanAmount: 13000 });
    const violations: Violation[] = [makeAprViolation(36, 40)];

    it('returns exactly 3 suggestions', () => {
      const suggestions = generateRestructuringSuggestions(deal, violations);
      expect(suggestions).toHaveLength(3);
    });

    it('first suggestion is reduce_apr', () => {
      const suggestions = generateRestructuringSuggestions(deal, violations);
      expect(suggestions[0].strategy).toBe('reduce_apr');
    });

    it('second suggestion is extend_term', () => {
      const suggestions = generateRestructuringSuggestions(deal, violations);
      expect(suggestions[1].strategy).toBe('extend_term');
    });

    it('third suggestion is increase_down_payment', () => {
      const suggestions = generateRestructuringSuggestions(deal, violations);
      expect(suggestions[2].strategy).toBe('increase_down_payment');
    });
  });

  // --- Edge case 4: No violations (state with no usury cap, or fully compliant deal) ---
  describe('no violations (e.g., state with no usury cap) → empty array', () => {
    it('compliant AZ deal with no rules triggered returns empty array', () => {
      const deal = makeDeal({ stateCode: 'AZ', apr: 99, termMonths: 48, salePrice: 15000, downPayment: 3000, loanAmount: 12000 });
      expect(generateRestructuringSuggestions(deal, [])).toEqual([]);
    });

    it('all individual strategies also return null with no violations', () => {
      const deal = makeDeal({ stateCode: 'AZ', apr: 99, termMonths: 36 });
      expect(suggestReduceApr(deal, [])).toBeNull();
      expect(suggestExtendTerm(deal, [])).toBeNull();
      expect(suggestIncreaseDownPayment(deal, [])).toBeNull();
    });
  });

  // --- Edge case 5: Very small deal ($1000 sale, $100 down) ---
  describe('very small deal ($1000 sale, $100 down) — math does not break', () => {
    const deal = makeDeal({ apr: 40, termMonths: 36, salePrice: 1000, downPayment: 100, loanAmount: 900 });
    const violations: Violation[] = [makeAprViolation(36, 40)];

    it('generateRestructuringSuggestions does not throw', () => {
      expect(() => generateRestructuringSuggestions(deal, violations)).not.toThrow();
    });

    it('reduce_apr suggestion has finite, positive monthly payments', () => {
      const s = suggestReduceApr(deal, violations)!;
      expect(s).not.toBeNull();
      expect(Number.isFinite(s.originalMonthlyPayment)).toBe(true);
      expect(Number.isFinite(s.suggestedMonthlyPayment)).toBe(true);
      expect(s.originalMonthlyPayment).toBeGreaterThan(0);
      expect(s.suggestedMonthlyPayment).toBeGreaterThan(0);
    });

    it('reduce_apr suggestedMonthlyPayment matches calculateMonthlyPayment at suggested params', () => {
      const s = suggestReduceApr(deal, violations)!;
      expect(s.suggestedMonthlyPayment).toBe(calculateMonthlyPayment(900, 36, 36));
    });

    it('suggestedMonthlyPayment is less than originalMonthlyPayment for reduce_apr', () => {
      const s = suggestReduceApr(deal, violations)!;
      expect(s.suggestedMonthlyPayment).toBeLessThan(s.originalMonthlyPayment);
    });
  });

  // --- Edge case 6: Very large deal ($50000 sale, $5000 down) ---
  describe('very large deal ($50000 sale, $5000 down) — math does not break', () => {
    const deal = makeDeal({ apr: 40, termMonths: 60, salePrice: 50000, downPayment: 5000, loanAmount: 45000 });
    const violations: Violation[] = [makeAprViolation(36, 40)];

    it('generateRestructuringSuggestions does not throw', () => {
      expect(() => generateRestructuringSuggestions(deal, violations)).not.toThrow();
    });

    it('reduce_apr suggestion has finite, positive monthly payments', () => {
      const s = suggestReduceApr(deal, violations)!;
      expect(s).not.toBeNull();
      expect(Number.isFinite(s.originalMonthlyPayment)).toBe(true);
      expect(Number.isFinite(s.suggestedMonthlyPayment)).toBe(true);
      expect(s.originalMonthlyPayment).toBeGreaterThan(0);
      expect(s.suggestedMonthlyPayment).toBeGreaterThan(0);
    });

    it('reduce_apr suggestedMonthlyPayment matches calculateMonthlyPayment at suggested params', () => {
      const s = suggestReduceApr(deal, violations)!;
      expect(s.suggestedMonthlyPayment).toBe(calculateMonthlyPayment(45000, 36, 60));
    });

    it('suggestedLoanAmount is unchanged for reduce_apr', () => {
      const s = suggestReduceApr(deal, violations)!;
      expect(s.suggestedLoanAmount).toBe(45000);
    });

    it('increase_down_payment suggestedDownPayment is within valid range when returned', () => {
      const s = suggestIncreaseDownPayment(deal, violations);
      if (s !== null) {
        expect(s.suggestedDownPayment).toBeGreaterThanOrEqual(0);
        expect(s.suggestedDownPayment!).toBeLessThanOrEqual(50000 * 0.5);
        expect(s.suggestedLoanAmount).toBeGreaterThan(0);
      }
    });
  });

  // --- Edge case 7: Max allowed APR equals current APR — no APR violation, no suggestions ---
  describe('deal APR exactly at the cap — not a violation, no suggestions needed', () => {
    it('returns empty array when deal is compliant with no violations', () => {
      const deal = makeDeal({ apr: 36, termMonths: 48, loanAmount: 12000 });
      // No violations — the deal is at exactly the cap but still compliant
      expect(generateRestructuringSuggestions(deal, [])).toEqual([]);
    });

    it('suggestReduceApr returns null when deal APR equals the threshold (not a reduction needed)', () => {
      const deal = makeDeal({ apr: 36, termMonths: 48, loanAmount: 12000 });
      // Violation recorded with actualValue === thresholdValue (edge: boundary recorded as violation)
      const violation = makeAprViolation(36, 36);
      expect(suggestReduceApr(deal, [violation])).toBeNull();
    });

    it('suggestReduceApr returns null when deal APR is below the cap', () => {
      const deal = makeDeal({ apr: 24, termMonths: 48, loanAmount: 12000 });
      const violation = makeAprViolation(36, 24);
      expect(suggestReduceApr(deal, [violation])).toBeNull();
    });
  });
});
