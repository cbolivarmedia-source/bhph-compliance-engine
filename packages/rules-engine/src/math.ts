import type { DealInput, Violation } from './types.js';

export function calculateMonthlyPayment(
  loanAmount: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) {
    return Math.round((loanAmount / termMonths) * 100) / 100;
  }
  const r = annualRate / 100 / 12;
  const payment = (loanAmount * r) / (1 - Math.pow(1 + r, -termMonths));
  return Math.round(payment * 100) / 100;
}

export function calculateTotalInterest(input: DealInput): number {
  if (input.apr === 0) return 0;
  const monthly = calculateMonthlyPayment(input.loanAmount, input.apr, input.termMonths);
  const total = monthly * input.termMonths - input.loanAmount;
  return Math.round(total * 100) / 100;
}

export function findMaxAllowedApr(violations: Violation[]): number | null {
  const aprViolations = violations.filter(v => v.ruleParameter === 'max_apr');
  if (aprViolations.length === 0) return null;
  return Math.min(...aprViolations.map(v => v.thresholdValue));
}
