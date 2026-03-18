import { calculateMonthlyPayment, calculateTotalInterest, findMaxAllowedApr } from '../math.js';

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

describe('calculateTotalInterest', () => {
  it('returns 0 for 0% APR', () => {
    const input = { stateCode: 'IL', salePrice: 15000, downPayment: 5000, loanAmount: 10000, apr: 0, termMonths: 48, vehicleYear: 2020 };
    expect(calculateTotalInterest(input)).toBe(0);
  });

  it('computes correct total interest for $10,000 at 10% for 48 months', () => {
    const input = { stateCode: 'IL', salePrice: 15000, downPayment: 5000, loanAmount: 10000, apr: 10, termMonths: 48, vehicleYear: 2020 };
    // monthly ≈ 253.63, total interest ≈ 253.63 * 48 - 10000 = 2174.24
    expect(calculateTotalInterest(input)).toBeCloseTo(2174, 0);
  });

  it('satisfies total_interest = (monthly * term) - loanAmount', () => {
    const input = { stateCode: 'IL', salePrice: 20000, downPayment: 5000, loanAmount: 15000, apr: 18, termMonths: 36, vehicleYear: 2019 };
    const monthly = calculateMonthlyPayment(input.loanAmount, input.apr, input.termMonths);
    const expected = Math.round((monthly * input.termMonths - input.loanAmount) * 100) / 100;
    expect(calculateTotalInterest(input)).toBe(expected);
  });
});

describe('findMaxAllowedApr', () => {
  const makeViolation = (ruleParameter: string, thresholdValue: number) => ({
    ruleId: 'r1',
    ruleParameter: ruleParameter as any,
    displayDescription: 'test',
    severity: 'violation' as const,
    actualValue: 40,
    thresholdValue,
    comparisonOp: 'lte' as const,
    statuteReferences: [],
  });

  it('returns threshold from a single APR violation', () => {
    const violations = [makeViolation('max_apr', 30)];
    expect(findMaxAllowedApr(violations)).toBe(30);
  });

  it('returns the most restrictive (lowest) threshold when multiple APR violations exist', () => {
    const violations = [
      makeViolation('max_apr', 30),
      makeViolation('max_apr', 25),
      makeViolation('max_apr', 28),
    ];
    expect(findMaxAllowedApr(violations)).toBe(25);
  });

  it('returns null when there are only non-APR violations', () => {
    const violations = [makeViolation('max_loan_amount', 10000)];
    expect(findMaxAllowedApr(violations)).toBeNull();
  });

  it('returns null for an empty violations array', () => {
    expect(findMaxAllowedApr([])).toBeNull();
  });
});
