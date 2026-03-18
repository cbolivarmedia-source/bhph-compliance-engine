import { getDealValueForParameter } from '../engine.js';
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
