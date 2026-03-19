import { calculateMonthlyPayment } from '../math.js';
import { generateRestructuringSuggestions } from '../restructuring.js';
import { evaluateRules } from '../engine.js';
import type { DealInput, RestructuringSuggestion, Rule, Violation } from '../types.js';
import { makeDeal, makeRule } from './fixtures.js';

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

function verifySuggestionProducesCompliantDeal(
  original: DealInput,
  suggestion: RestructuringSuggestion,
  rules: Rule[]
): boolean {
  const suggested: DealInput = {
    ...original,
    apr: suggestion.suggestedApr ?? original.apr,
    termMonths: suggestion.suggestedTermMonths ?? original.termMonths,
    loanAmount: suggestion.suggestedLoanAmount ?? original.loanAmount,
    downPayment: suggestion.suggestedDownPayment ?? original.downPayment,
    salePrice: suggestion.suggestedSalePrice ?? original.salePrice,
  };
  const violations = evaluateRules(rules, suggested);
  return violations.filter(v => v.severity === 'violation').length === 0;
}

describe('Task 41: Suggestion math verification', () => {
  const aprCapRule = makeRule({
    id: 'r-apr-36',
    ruleParameter: 'max_apr',
    comparisonOp: 'lte',
    thresholdValue: 36,
    displayDescription: 'APR must not exceed 36%',
  });

  const deal = makeDeal({ apr: 40, termMonths: 36, salePrice: 15000, downPayment: 2000, loanAmount: 13000 });

  it('every suggestion from generateRestructuringSuggestions produces 0 violations when re-evaluated', () => {
    const violations = [makeAprViolation(36, 40)];
    const suggestions = generateRestructuringSuggestions(deal, violations);
    expect(suggestions.length).toBeGreaterThan(0);

    for (const suggestion of suggestions) {
      const compliant = verifySuggestionProducesCompliantDeal(deal, suggestion, [aprCapRule]);
      expect(compliant).toBe(true);
    }
  });

  it('suggestedMonthlyPayment matches recalculation from suggested params for reduce_apr', () => {
    const violations = [makeAprViolation(36, 40)];
    const suggestions = generateRestructuringSuggestions(deal, violations);
    const s = suggestions.find(x => x.strategy === 'reduce_apr')!;
    expect(s).toBeDefined();
    expect(s.suggestedMonthlyPayment).toBe(
      calculateMonthlyPayment(s.suggestedLoanAmount!, s.suggestedApr!, s.suggestedTermMonths!)
    );
  });

  it('suggestedMonthlyPayment matches recalculation from suggested params for extend_term', () => {
    const deal2 = makeDeal({ apr: 40, termMonths: 48, salePrice: 15000, downPayment: 3000, loanAmount: 12000 });
    const violations = [makeAprViolation(36, 40)];
    const suggestions = generateRestructuringSuggestions(deal2, violations);
    const s = suggestions.find(x => x.strategy === 'extend_term')!;
    expect(s).toBeDefined();
    expect(s.suggestedMonthlyPayment).toBe(
      calculateMonthlyPayment(s.suggestedLoanAmount!, s.suggestedApr!, s.suggestedTermMonths!)
    );
  });

  it('suggestedMonthlyPayment matches recalculation from suggested params for increase_down_payment', () => {
    const violations = [makeAprViolation(36, 40)];
    const suggestions = generateRestructuringSuggestions(deal, violations);
    const s = suggestions.find(x => x.strategy === 'increase_down_payment')!;
    expect(s).toBeDefined();
    expect(s.suggestedMonthlyPayment).toBe(
      calculateMonthlyPayment(s.suggestedLoanAmount!, s.suggestedApr!, s.suggestedTermMonths!)
    );
  });

  it('suggestedMonthlyPayment <= originalMonthlyPayment for reduce_apr', () => {
    const violations = [makeAprViolation(36, 40)];
    const suggestions = generateRestructuringSuggestions(deal, violations);
    const s = suggestions.find(x => x.strategy === 'reduce_apr')!;
    expect(s.suggestedMonthlyPayment).toBeLessThanOrEqual(s.originalMonthlyPayment);
  });

  it('suggestedMonthlyPayment <= originalMonthlyPayment for extend_term', () => {
    const deal2 = makeDeal({ apr: 40, termMonths: 48, salePrice: 15000, downPayment: 3000, loanAmount: 12000 });
    const violations = [makeAprViolation(36, 40)];
    const suggestions = generateRestructuringSuggestions(deal2, violations);
    const s = suggestions.find(x => x.strategy === 'extend_term')!;
    expect(s.suggestedMonthlyPayment).toBeLessThanOrEqual(s.originalMonthlyPayment);
  });

  it('verifySuggestionProducesCompliantDeal returns false for a non-compliant suggestion', () => {
    // Manually construct a suggestion that does NOT fix the APR violation
    const badSuggestion: RestructuringSuggestion = {
      strategy: 'reduce_apr',
      suggestedApr: 50, // still above 36% cap
      suggestedTermMonths: deal.termMonths,
      suggestedDownPayment: null,
      suggestedSalePrice: null,
      suggestedLoanAmount: deal.loanAmount,
      originalMonthlyPayment: calculateMonthlyPayment(deal.loanAmount, deal.apr, deal.termMonths),
      suggestedMonthlyPayment: calculateMonthlyPayment(deal.loanAmount, 50, deal.termMonths),
      explanation: null,
    };
    expect(verifySuggestionProducesCompliantDeal(deal, badSuggestion, [aprCapRule])).toBe(false);
  });
});
