import { getDealValueForParameter, filterApplicableRules, evaluateRules, buildComplianceResult } from '../engine.js';
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

describe('evaluateRules', () => {
  it('returns empty array when deal complies with all rules', () => {
    const rules = [makeRule({ thresholdValue: 36 })];
    const deal = makeDeal({ apr: 24.99 });
    expect(evaluateRules(rules, deal)).toHaveLength(0);
  });

  it('returns a violation with correct details when APR exceeds the cap', () => {
    const statute = { id: 's1', title: 'IL Consumer Finance Act', section: '815 ILCS 205', url: null, excerpt: null };
    const rule = makeRule({ id: 'rule-apr-il', thresholdValue: 36, statuteReferences: [statute] });
    const deal = makeDeal({ apr: 40 });

    const violations = evaluateRules([rule], deal);
    expect(violations).toHaveLength(1);
    expect(violations[0]!.ruleId).toBe('rule-apr-il');
    expect(violations[0]!.actualValue).toBe(40);
    expect(violations[0]!.thresholdValue).toBe(36);
    expect(violations[0]!.comparisonOp).toBe('lte');
    expect(violations[0]!.statuteReferences).toHaveLength(1);
  });

  it('captures all violations when multiple rules are broken', () => {
    const rules = [
      makeRule({ id: 'r1', ruleParameter: 'max_apr', thresholdValue: 36 }),
      makeRule({ id: 'r2', ruleParameter: 'max_loan_amount', thresholdValue: 10000 }),
    ];
    const deal = makeDeal({ apr: 40, loanAmount: 15000 });
    const violations = evaluateRules(rules, deal);
    expect(violations).toHaveLength(2);
    expect(violations.map(v => v.ruleId)).toContain('r1');
    expect(violations.map(v => v.ruleId)).toContain('r2');
  });

  it('includes warning-severity rules in results with correct severity tag', () => {
    const rule = makeRule({ severity: 'warning', thresholdValue: 30 });
    const deal = makeDeal({ apr: 32 });
    const violations = evaluateRules([rule], deal);
    expect(violations).toHaveLength(1);
    expect(violations[0]!.severity).toBe('warning');
  });
});

describe('buildComplianceResult', () => {
  it('returns pass with empty violations and warnings when deal is compliant', () => {
    const deal = makeDeal();
    const result = buildComplianceResult(deal, [], []);
    expect(result.result).toBe('pass');
    expect(result.violations).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('returns fail when any violation-severity issue exists', () => {
    const deal = makeDeal();
    const violation = {
      ruleId: 'r1', ruleParameter: 'max_apr' as const, displayDescription: 'APR too high',
      severity: 'violation' as const, actualValue: 40, thresholdValue: 36,
      comparisonOp: 'lte' as const, statuteReferences: [],
    };
    const result = buildComplianceResult(deal, [], [violation]);
    expect(result.result).toBe('fail');
    expect(result.violations).toHaveLength(1);
  });

  it('returns pass when only warnings exist (no hard violations)', () => {
    const deal = makeDeal();
    const warning = {
      ruleId: 'r1', ruleParameter: 'max_apr' as const, displayDescription: 'APR approaching limit',
      severity: 'warning' as const, actualValue: 33, thresholdValue: 30,
      comparisonOp: 'lte' as const, statuteReferences: [],
    };
    const result = buildComplianceResult(deal, [], [warning]);
    expect(result.result).toBe('pass');
    expect(result.warnings).toHaveLength(1);
    expect(result.violations).toHaveLength(0);
  });

  it('separates violations and warnings correctly when both are present', () => {
    const deal = makeDeal();
    const violation = {
      ruleId: 'r1', ruleParameter: 'max_apr' as const, displayDescription: 'APR too high',
      severity: 'violation' as const, actualValue: 40, thresholdValue: 36,
      comparisonOp: 'lte' as const, statuteReferences: [],
    };
    const warning = {
      ruleId: 'r2', ruleParameter: 'max_loan_amount' as const, displayDescription: 'Loan amount high',
      severity: 'warning' as const, actualValue: 15000, thresholdValue: 12000,
      comparisonOp: 'lte' as const, statuteReferences: [],
    };
    const result = buildComplianceResult(deal, [], [violation, warning]);
    expect(result.result).toBe('fail');
    expect(result.violations).toHaveLength(1);
    expect(result.warnings).toHaveLength(1);
  });

  it('includes a valid ISO timestamp in checkedAt', () => {
    const result = buildComplianceResult(makeDeal(), [], []);
    expect(() => new Date(result.checkedAt)).not.toThrow();
    expect(new Date(result.checkedAt).toISOString()).toBe(result.checkedAt);
  });

  it('includes applicable rules in result', () => {
    const rules = [makeRule({ id: 'r1' }), makeRule({ id: 'r2' })];
    const result = buildComplianceResult(makeDeal(), rules, []);
    expect(result.applicableRules).toHaveLength(2);
  });
});
