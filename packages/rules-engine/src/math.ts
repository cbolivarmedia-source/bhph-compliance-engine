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
