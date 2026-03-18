import { calculateMonthlyPayment } from '../math.js';

describe('calculateMonthlyPayment', () => {
  it('computes $10,000 at 10% for 48 months to ~$253.63', () => {
    expect(calculateMonthlyPayment(10000, 10, 48)).toBeCloseTo(253.63, 1);
  });

  it('returns exact division for 0% APR loan', () => {
    expect(calculateMonthlyPayment(10000, 0, 48)).toBe(208.33);
  });

  it('computes $15,000 at 24.99% for 60 months to approximately $440', () => {
    const payment = calculateMonthlyPayment(15000, 24.99, 60);
    expect(payment).toBeGreaterThan(439);
    expect(payment).toBeLessThan(442);
  });

  it('handles 1-month term correctly — total repayment is principal plus one month of interest', () => {
    // For 1 month: PMT = P * r / (1 - 1/(1+r)) = P * (1+r)
    const payment = calculateMonthlyPayment(10000, 12, 1);
    expect(payment).toBe(10100);
  });

  it('handles very small loan amount ($100)', () => {
    const payment = calculateMonthlyPayment(100, 10, 12);
    expect(payment).toBeCloseTo(8.79, 1);
  });

  it('rounds result to 2 decimal places', () => {
    const payment = calculateMonthlyPayment(10000, 10, 48);
    const decimals = payment.toString().split('.')[1]?.length ?? 0;
    expect(decimals).toBeLessThanOrEqual(2);
  });
});
