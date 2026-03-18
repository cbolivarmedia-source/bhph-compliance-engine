export interface DealInput {
  stateCode: string;
  salePrice: number;
  downPayment: number;
  loanAmount: number;
  apr: number;
  termMonths: number;
  vehicleYear: number;
}

export type RuleParameter =
  | 'max_apr'
  | 'max_finance_charge_rate'
  | 'max_total_interest'
  | 'max_loan_amount'
  | 'min_down_payment_pct';

export type ComparisonOp = 'lte' | 'gte' | 'lt' | 'gt' | 'eq' | 'between';

export type ConditionField = 'loan_amount' | 'vehicle_age_years' | 'term_months' | 'sale_price';

export interface Rule {
  id: string;
  jurisdictionId: string;
  stateCode: string;
  domainSlug: string;
  ruleParameter: RuleParameter;
  comparisonOp: ComparisonOp;
  thresholdValue: number | null;
  thresholdMin: number | null;
  thresholdMax: number | null;
  conditionField: ConditionField | null;
  conditionOp: ComparisonOp | null;
  conditionValue: number | null;
  conditionMin: number | null;
  conditionMax: number | null;
  validFrom: string;
  validUntil: string | null;
  displayDescription: string;
  severity: 'violation' | 'warning';
  statuteReferences: StatuteReference[];
}

export interface StatuteReference {
  id: string;
  title: string;
  section: string | null;
  url: string | null;
  excerpt: string | null;
}

export interface Violation {
  ruleId: string;
  ruleParameter: RuleParameter;
  displayDescription: string;
  severity: 'violation' | 'warning';
  actualValue: number;
  thresholdValue: number;
  comparisonOp: ComparisonOp;
  statuteReferences: StatuteReference[];
}

export interface ComplianceResult {
  dealInput: DealInput;
  result: 'pass' | 'fail';
  violations: Violation[];
  warnings: Violation[];
  applicableRules: Rule[];
  checkedAt: string;
}

export type RestructuringStrategy =
  | 'reduce_apr'
  | 'extend_term'
  | 'increase_down_payment'
  | 'reduce_sale_price'
  | 'combined';

export interface RestructuringSuggestion {
  strategy: RestructuringStrategy;
  suggestedApr: number | null;
  suggestedTermMonths: number | null;
  suggestedDownPayment: number | null;
  suggestedSalePrice: number | null;
  suggestedLoanAmount: number | null;
  originalMonthlyPayment: number;
  suggestedMonthlyPayment: number;
  explanation: string | null;
}

export interface RuleLoader {
  loadRules(stateCode: string, domainSlug: string, asOfDate: Date): Promise<Rule[]>;
}
