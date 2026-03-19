import { calculateMonthlyPayment } from '../math.js';
import { suggestReduceApr, suggestExtendTerm, suggestIncreaseDownPayment } from '../restructuring.js';
import type { Violation } from '../types.js';
import { makeDeal } from './fixtures.js';

function makeAprViolation(thresholdValue: number, actualValue: number = 40): Violation {
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

describe('suggestReduceApr', () => {
  it('IL deal at 40% APR with 36% cap suggests 36% APR with correct monthly payments', () => {
    const deal = makeDeal({ apr: 40, termMonths: 36 });
    const violations = [makeAprViolation(36, 40)];

    const suggestion = suggestReduceApr(deal, violations);

    expect(suggestion).not.toBeNull();
    expect(suggestion!.strategy).toBe('reduce_apr');
    expect(suggestion!.suggestedApr).toBe(36);
    expect(suggestion!.originalMonthlyPayment).toBe(
      calculateMonthlyPayment(deal.loanAmount, 40, 36)
    );
    expect(suggestion!.suggestedMonthlyPayment).toBe(
      calculateMonthlyPayment(deal.loanAmount, 36, 36)
    );
    expect(suggestion!.suggestedMonthlyPayment).toBeLessThan(suggestion!.originalMonthlyPayment);
  });

  it('TX deal at 35% APR with 30% cap suggests 30% APR', () => {
    const deal = makeDeal({ stateCode: 'TX', apr: 35, loanAmount: 8000, termMonths: 48 });
    const violations = [makeAprViolation(30, 35)];

    const suggestion = suggestReduceApr(deal, violations);

    expect(suggestion).not.toBeNull();
    expect(suggestion!.suggestedApr).toBe(30);
    expect(suggestion!.suggestedMonthlyPayment).toBe(
      calculateMonthlyPayment(8000, 30, 48)
    );
  });

  it('returns null when there are no APR violations (only loan_amount violation)', () => {
    const deal = makeDeal({ apr: 25 });
    const violations = [makeLoanViolation(10000, 12000)];
    expect(suggestReduceApr(deal, violations)).toBeNull();
  });

  it('returns null when deal APR is already at or below max allowed', () => {
    const deal = makeDeal({ apr: 36 });
    const violations = [makeAprViolation(36, 36)];
    expect(suggestReduceApr(deal, violations)).toBeNull();
  });

  it('returns null for empty violations array', () => {
    expect(suggestReduceApr(makeDeal({ apr: 40 }), [])).toBeNull();
  });

  it('uses the most restrictive cap when multiple APR violations exist', () => {
    const deal = makeDeal({ apr: 40 });
    const violations = [makeAprViolation(36, 40), makeAprViolation(30, 40)];

    const suggestion = suggestReduceApr(deal, violations);

    expect(suggestion!.suggestedApr).toBe(30);
    expect(suggestion!.suggestedMonthlyPayment).toBe(
      calculateMonthlyPayment(deal.loanAmount, 30, deal.termMonths)
    );
  });

  it('explanation field is null', () => {
    const deal = makeDeal({ apr: 40 });
    expect(suggestReduceApr(deal, [makeAprViolation(36, 40)])!.explanation).toBeNull();
  });

  it('preserves original loan amount and term in suggestion', () => {
    const deal = makeDeal({ apr: 40, loanAmount: 10000, termMonths: 60 });
    const suggestion = suggestReduceApr(deal, [makeAprViolation(36, 40)])!;
    expect(suggestion.suggestedLoanAmount).toBe(10000);
    expect(suggestion.suggestedTermMonths).toBe(60);
  });
});

describe('suggestExtendTerm', () => {
  it('deal at 40% APR with 36% cap and 48-month term suggests shortest viable extension', () => {
    const deal = makeDeal({ apr: 40, termMonths: 48, loanAmount: 12000 });
    const violations = [makeAprViolation(36, 40)];

    const suggestion = suggestExtendTerm(deal, violations);

    expect(suggestion).not.toBeNull();
    expect(suggestion!.strategy).toBe('extend_term');
    expect(suggestion!.suggestedApr).toBe(36);
    expect(suggestion!.suggestedTermMonths).toBeGreaterThan(48);
    expect(suggestion!.suggestedTermMonths).toBeLessThanOrEqual(72);
    expect(suggestion!.suggestedTermMonths).toBe(54);
  });

  it('suggested monthly payment is lower than the original', () => {
    const deal = makeDeal({ apr: 40, termMonths: 48, loanAmount: 12000 });
    const suggestion = suggestExtendTerm(deal, [makeAprViolation(36, 40)])!;
    expect(suggestion.suggestedMonthlyPayment).toBeLessThan(suggestion.originalMonthlyPayment);
  });

  it('original monthly payment is calculated at the original APR and term', () => {
    const deal = makeDeal({ apr: 40, termMonths: 48, loanAmount: 12000 });
    const suggestion = suggestExtendTerm(deal, [makeAprViolation(36, 40)])!;
    expect(suggestion.originalMonthlyPayment).toBe(calculateMonthlyPayment(12000, 40, 48));
  });

  it('suggested monthly payment matches calculateMonthlyPayment at suggested params', () => {
    const deal = makeDeal({ apr: 40, termMonths: 48, loanAmount: 12000 });
    const suggestion = suggestExtendTerm(deal, [makeAprViolation(36, 40)])!;
    expect(suggestion.suggestedMonthlyPayment).toBe(
      calculateMonthlyPayment(12000, 36, suggestion.suggestedTermMonths!)
    );
  });

  it('returns null when deal is already at max term (72 months)', () => {
    const deal = makeDeal({ apr: 40, termMonths: 72 });
    expect(suggestExtendTerm(deal, [makeAprViolation(36, 40)])).toBeNull();
  });

  it('returns null when already at a custom max term', () => {
    const deal = makeDeal({ apr: 40, termMonths: 60 });
    expect(suggestExtendTerm(deal, [makeAprViolation(36, 40)], 60)).toBeNull();
  });

  it('returns null when there are no APR violations', () => {
    const deal = makeDeal({ apr: 25, termMonths: 48 });
    expect(suggestExtendTerm(deal, [makeLoanViolation(10000, 12000)])).toBeNull();
  });

  it('explanation field is null', () => {
    const deal = makeDeal({ apr: 40, termMonths: 48 });
    expect(suggestExtendTerm(deal, [makeAprViolation(36, 40)])!.explanation).toBeNull();
  });

  it('preserves original loan amount in suggestion', () => {
    const deal = makeDeal({ apr: 40, termMonths: 48, loanAmount: 8000 });
    const suggestion = suggestExtendTerm(deal, [makeAprViolation(36, 40)])!;
    expect(suggestion.suggestedLoanAmount).toBe(8000);
  });
});

describe('suggestIncreaseDownPayment', () => {
  it('deal at 40% with 36% cap, $2K down on $15K → suggests higher down payment', () => {
    const deal = makeDeal({ apr: 40, termMonths: 36, salePrice: 15000, downPayment: 2000, loanAmount: 13000 });
    const violations = [makeAprViolation(36, 40)];

    const suggestion = suggestIncreaseDownPayment(deal, violations);

    expect(suggestion).not.toBeNull();
    expect(suggestion!.strategy).toBe('increase_down_payment');
    expect(suggestion!.suggestedApr).toBe(36);
    expect(suggestion!.suggestedDownPayment).toBeGreaterThan(2000);
    expect(suggestion!.suggestedLoanAmount).toBe(15000 - suggestion!.suggestedDownPayment!);
  });

  it('suggestedLoanAmount = salePrice - suggestedDownPayment', () => {
    const deal = makeDeal({ apr: 40, termMonths: 36, salePrice: 15000, downPayment: 2000, loanAmount: 13000 });
    const suggestion = suggestIncreaseDownPayment(deal, [makeAprViolation(36, 40)])!;
    expect(suggestion.suggestedLoanAmount).toBe(
      Math.round((15000 - suggestion.suggestedDownPayment!) * 100) / 100
    );
  });

  it('monthly payment comparison is accurate', () => {
    const deal = makeDeal({ apr: 40, termMonths: 36, salePrice: 15000, downPayment: 2000, loanAmount: 13000 });
    const suggestion = suggestIncreaseDownPayment(deal, [makeAprViolation(36, 40)])!;
    expect(suggestion.suggestedMonthlyPayment).toBe(
      calculateMonthlyPayment(suggestion.suggestedLoanAmount!, 36, 36)
    );
  });

  it('explanation field is null', () => {
    const deal = makeDeal({ apr: 40, termMonths: 36, salePrice: 15000, downPayment: 2000, loanAmount: 13000 });
    expect(suggestIncreaseDownPayment(deal, [makeAprViolation(36, 40)])!.explanation).toBeNull();
  });

  it('returns null when there are no APR violations', () => {
    const deal = makeDeal({ apr: 25, salePrice: 15000, downPayment: 2000, loanAmount: 13000 });
    expect(suggestIncreaseDownPayment(deal, [makeLoanViolation(10000, 13000)])).toBeNull();
  });

  it('returns null when required down payment exceeds 50% of sale price', () => {
    // Very high original APR (99%) with a very low cap (1%) on a 24-month term.
    // referenceMonthly at 1% on $9000, 24mo is ~$376 (tiny vs. original at 99%).
    // At 99% APR, loan amount for $376/mo over 24mo ≈ $3880 → down = $10000-$3880 = $6120 > 50% ($5000).
    const deal = makeDeal({ apr: 99, termMonths: 24, salePrice: 10000, downPayment: 1000, loanAmount: 9000 });
    const violations = [makeAprViolation(1, 99)];
    expect(suggestIncreaseDownPayment(deal, violations, 50)).toBeNull();
  });

  it('suggestedDownPayment is always non-negative when a suggestion is returned', () => {
    const deal = makeDeal({ apr: 40, termMonths: 36, salePrice: 15000, downPayment: 2000, loanAmount: 13000 });
    const result = suggestIncreaseDownPayment(deal, [makeAprViolation(36, 40)])!;
    expect(result.suggestedDownPayment).toBeGreaterThanOrEqual(0);
    expect(result.suggestedLoanAmount).toBeGreaterThan(0);
  });
});
