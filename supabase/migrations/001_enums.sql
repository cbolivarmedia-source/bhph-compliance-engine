-- Migration: 001_enums
-- Create all application-level enum types

CREATE TYPE rule_parameter AS ENUM (
  'max_apr',
  'max_finance_charge_rate',
  'max_total_interest',
  'max_loan_amount',
  'min_down_payment_pct'
);

CREATE TYPE comparison_op AS ENUM (
  'lte',
  'gte',
  'lt',
  'gt',
  'eq',
  'between'
);

CREATE TYPE condition_field AS ENUM (
  'loan_amount',
  'vehicle_age_years',
  'term_months',
  'sale_price'
);

CREATE TYPE user_role AS ENUM (
  'owner',
  'compliance_manager',
  'staff',
  'readonly'
);

CREATE TYPE check_result AS ENUM (
  'pass',
  'fail'
);

CREATE TYPE restructuring_strategy AS ENUM (
  'reduce_apr',
  'extend_term',
  'increase_down_payment',
  'reduce_sale_price',
  'combined'
);
