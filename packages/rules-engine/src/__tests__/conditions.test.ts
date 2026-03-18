import { getConditionValue, evaluateCondition } from '../conditions.js';
import { makeDeal, makeRule } from './fixtures.js';

describe('getConditionValue', () => {
  it('returns loanAmount for loan_amount field', () => {
    const deal = makeDeal({ loanAmount: 8000 });
    expect(getConditionValue('loan_amount', deal)).toBe(8000);
  });

  it('returns currentYear - vehicleYear for vehicle_age_years', () => {
    const currentYear = new Date().getFullYear();
    const vehicleYear = 2010;
    const deal = makeDeal({ vehicleYear });
    expect(getConditionValue('vehicle_age_years', deal)).toBe(currentYear - vehicleYear);
  });

  it('returns termMonths for term_months field', () => {
    const deal = makeDeal({ termMonths: 72 });
    expect(getConditionValue('term_months', deal)).toBe(72);
  });

  it('returns salePrice for sale_price field', () => {
    const deal = makeDeal({ salePrice: 22000 });
    expect(getConditionValue('sale_price', deal)).toBe(22000);
  });
});

describe('evaluateCondition', () => {
  it('always returns true when rule has no condition field (unconditional rule)', () => {
    const rule = makeRule({ conditionField: null });
    const deal = makeDeal({ loanAmount: 999999 });
    expect(evaluateCondition(rule, deal)).toBe(true);
  });

  it('returns true for loan_amount lte 10000 when loan is $8,000', () => {
    const rule = makeRule({
      conditionField: 'loan_amount',
      conditionOp: 'lte',
      conditionValue: 10000,
      conditionMin: null,
      conditionMax: null,
    });
    const deal = makeDeal({ loanAmount: 8000 });
    expect(evaluateCondition(rule, deal)).toBe(true);
  });

  it('returns false for loan_amount lte 10000 when loan is $12,000', () => {
    const rule = makeRule({
      conditionField: 'loan_amount',
      conditionOp: 'lte',
      conditionValue: 10000,
      conditionMin: null,
      conditionMax: null,
    });
    const deal = makeDeal({ loanAmount: 12000 });
    expect(evaluateCondition(rule, deal)).toBe(false);
  });

  it('returns true for vehicle_age_years gte 10 for a vehicle built 12 years ago', () => {
    const currentYear = new Date().getFullYear();
    const rule = makeRule({
      conditionField: 'vehicle_age_years',
      conditionOp: 'gte',
      conditionValue: 10,
      conditionMin: null,
      conditionMax: null,
    });
    const deal = makeDeal({ vehicleYear: currentYear - 12 });
    expect(evaluateCondition(rule, deal)).toBe(true);
  });

  it('returns false for vehicle_age_years gte 10 for a vehicle built 4 years ago', () => {
    const currentYear = new Date().getFullYear();
    const rule = makeRule({
      conditionField: 'vehicle_age_years',
      conditionOp: 'gte',
      conditionValue: 10,
      conditionMin: null,
      conditionMax: null,
    });
    const deal = makeDeal({ vehicleYear: currentYear - 4 });
    expect(evaluateCondition(rule, deal)).toBe(false);
  });

  it('evaluates between condition correctly', () => {
    const rule = makeRule({
      conditionField: 'term_months',
      conditionOp: 'between',
      conditionValue: null,
      conditionMin: 24,
      conditionMax: 60,
    });
    expect(evaluateCondition(rule, makeDeal({ termMonths: 36 }))).toBe(true);
    expect(evaluateCondition(rule, makeDeal({ termMonths: 72 }))).toBe(false);
  });
});
