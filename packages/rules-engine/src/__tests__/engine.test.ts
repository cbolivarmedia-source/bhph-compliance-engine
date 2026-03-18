import { getDealValueForParameter, filterApplicableRules } from '../engine.js';
import { makeDeal, makeRule } from './fixtures.js';

describe('getDealValueForParameter', () => {
  it('returns apr for max_apr', () => {
    const deal = makeDeal({ apr: 29.99 });
    expect(getDealValueForParameter('max_apr', deal)).toBe(29.99);
  });

  it('returns apr for max_finance_charge_rate (MVP simplification)', () => {
    const deal = makeDeal({ apr: 24 });
    expect(getDealValueForParameter('max_finance_charge_rate', deal)).toBe(24);
  });

  it('returns loanAmount for max_loan_amount', () => {
    const deal = makeDeal({ loanAmount: 8500 });
    expect(getDealValueForParameter('max_loan_amount', deal)).toBe(8500);
  });

  it('returns down payment as percentage of sale price for min_down_payment_pct', () => {
    const deal = makeDeal({ downPayment: 3000, salePrice: 15000 });
    expect(getDealValueForParameter('min_down_payment_pct', deal)).toBeCloseTo(20, 5);
  });

  it('returns calculated total interest for max_total_interest', () => {
    const deal = makeDeal({ loanAmount: 10000, apr: 10, termMonths: 48 });
    const result = getDealValueForParameter('max_total_interest', deal);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
    expect(result!).toBeCloseTo(2174, 0);
  });
});

describe('filterApplicableRules', () => {
  it('returns unconditional rules and conditionally matching rules, excludes non-matching conditionals', () => {
    const unconditional1 = makeRule({ id: 'r1', conditionField: null });
    const unconditional2 = makeRule({ id: 'r2', conditionField: null, ruleParameter: 'max_loan_amount', thresholdValue: 50000 });
    const matchingConditional = makeRule({
      id: 'r3',
      conditionField: 'loan_amount',
      conditionOp: 'lte',
      conditionValue: 10000,
      conditionMin: null,
      conditionMax: null,
    });
    const nonMatchingConditional1 = makeRule({
      id: 'r4',
      conditionField: 'loan_amount',
      conditionOp: 'gt',
      conditionValue: 10000,
      conditionMin: null,
      conditionMax: null,
    });
    const nonMatchingConditional2 = makeRule({
      id: 'r5',
      conditionField: 'term_months',
      conditionOp: 'gt',
      conditionValue: 60,
      conditionMin: null,
      conditionMax: null,
    });

    const rules = [unconditional1, unconditional2, matchingConditional, nonMatchingConditional1, nonMatchingConditional2];
    const deal = makeDeal({ loanAmount: 8000, termMonths: 48 });
    const result = filterApplicableRules(rules, deal);

    expect(result).toHaveLength(3);
    expect(result.map(r => r.id)).toContain('r1');
    expect(result.map(r => r.id)).toContain('r2');
    expect(result.map(r => r.id)).toContain('r3');
  });

  it('returns all rules when all conditions match', () => {
    const rules = [
      makeRule({ id: 'r1', conditionField: null }),
      makeRule({ id: 'r2', conditionField: null }),
    ];
    const deal = makeDeal();
    expect(filterApplicableRules(rules, deal)).toHaveLength(2);
  });

  it('returns empty array when no rules match', () => {
    const rules = [
      makeRule({
        id: 'r1',
        conditionField: 'loan_amount',
        conditionOp: 'gt',
        conditionValue: 100000,
        conditionMin: null,
        conditionMax: null,
      }),
    ];
    const deal = makeDeal({ loanAmount: 12000 });
    expect(filterApplicableRules(rules, deal)).toHaveLength(0);
  });
});
