'use client';
import { useState, useMemo } from 'react';
import { StateSelector } from './StateSelector';

export interface DealFormData {
  stateCode: string;
  salePrice: number;
  downPayment: number;
  apr: number;
  termMonths: number;
  vehicleYear: number;
}

interface DealFormProps {
  onSubmit: (data: DealFormData) => void;
  loading: boolean;
}

interface FormErrors {
  stateCode?: string;
  salePrice?: string;
  downPayment?: string;
  apr?: string;
  termMonths?: string;
  vehicleYear?: string;
}

const TERM_OPTIONS = [24, 36, 48, 60, 72];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => currentYear - i);

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function calculateMonthlyPayment(principal: number, aprPct: number, termMonths: number): number {
  if (aprPct === 0) return principal / termMonths;
  const monthlyRate = aprPct / 100 / 12;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths));
}

function CurrencyInput({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
        <input
          id={id}
          type="number"
          min="0"
          step="100"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full rounded-lg border px-3 py-2.5 pl-7 text-slate-900 shadow-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="0"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function DealForm({ onSubmit, loading }: DealFormProps) {
  const [stateCode, setStateCode] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [apr, setApr] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const loanAmount = useMemo(() => {
    const sp = parseFloat(salePrice);
    const dp = parseFloat(downPayment);
    if (!isNaN(sp) && !isNaN(dp) && sp > dp) return sp - dp;
    return null;
  }, [salePrice, downPayment]);

  const monthlyPayment = useMemo(() => {
    if (loanAmount === null) return null;
    const aprNum = parseFloat(apr);
    const termNum = parseInt(termMonths, 10);
    if (!isNaN(aprNum) && !isNaN(termNum) && termNum > 0) {
      return calculateMonthlyPayment(loanAmount, aprNum, termNum);
    }
    return null;
  }, [loanAmount, apr, termMonths]);

  function validate(): boolean {
    const errs: FormErrors = {};
    const sp = parseFloat(salePrice);
    const dp = parseFloat(downPayment);
    const aprNum = parseFloat(apr);

    if (!stateCode) errs.stateCode = 'Select a state';
    if (!salePrice || isNaN(sp) || sp <= 0) errs.salePrice = 'Enter a valid sale price';
    if (downPayment === '' || isNaN(dp) || dp < 0) errs.downPayment = 'Enter a valid down payment';
    if (!isNaN(sp) && !isNaN(dp) && dp >= sp) errs.downPayment = 'Down payment must be less than sale price';
    if (!apr || isNaN(aprNum) || aprNum < 0 || aprNum > 100) errs.apr = 'Enter a valid APR (0–100)';
    if (!termMonths) errs.termMonths = 'Select a term';
    if (!vehicleYear) errs.vehicleYear = 'Select a vehicle year';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      stateCode,
      salePrice: parseFloat(salePrice),
      downPayment: parseFloat(downPayment),
      apr: parseFloat(apr),
      termMonths: parseInt(termMonths, 10),
      vehicleYear: parseInt(vehicleYear, 10),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <StateSelector value={stateCode} onChange={setStateCode} disabled={loading} />
        {errors.stateCode && <p className="mt-1 text-xs text-red-600">{errors.stateCode}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput
          id="salePrice"
          label="Sale Price"
          value={salePrice}
          onChange={setSalePrice}
          disabled={loading}
          error={errors.salePrice}
        />
        <CurrencyInput
          id="downPayment"
          label="Down Payment"
          value={downPayment}
          onChange={setDownPayment}
          disabled={loading}
          error={errors.downPayment}
        />
      </div>

      {/* Calculated loan amount */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-slate-600">Loan Amount</span>
        <span className="text-sm font-semibold text-slate-900">
          {loanAmount !== null ? fmt.format(loanAmount) : '—'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* APR */}
        <div>
          <label htmlFor="apr" className="block text-sm font-medium text-slate-700 mb-1">
            APR
          </label>
          <div className="relative">
            <input
              id="apr"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={apr}
              onChange={e => setApr(e.target.value)}
              disabled={loading}
              className={`w-full rounded-lg border px-3 py-2.5 pr-8 text-slate-900 shadow-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400 ${
                errors.apr
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
          </div>
          {errors.apr && <p className="mt-1 text-xs text-red-600">{errors.apr}</p>}
        </div>

        {/* Term */}
        <div>
          <label htmlFor="termMonths" className="block text-sm font-medium text-slate-700 mb-1">
            Term (months)
          </label>
          <select
            id="termMonths"
            value={termMonths}
            onChange={e => setTermMonths(e.target.value)}
            disabled={loading}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400 ${
              errors.termMonths
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
          >
            <option value="">Select term...</option>
            {TERM_OPTIONS.map(t => (
              <option key={t} value={t}>{t} months</option>
            ))}
          </select>
          {errors.termMonths && <p className="mt-1 text-xs text-red-600">{errors.termMonths}</p>}
        </div>
      </div>

      {/* Vehicle year */}
      <div>
        <label htmlFor="vehicleYear" className="block text-sm font-medium text-slate-700 mb-1">
          Vehicle Year
        </label>
        <select
          id="vehicleYear"
          value={vehicleYear}
          onChange={e => setVehicleYear(e.target.value)}
          disabled={loading}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-400 ${
            errors.vehicleYear
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
        >
          <option value="">Select year...</option>
          {YEAR_OPTIONS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {errors.vehicleYear && <p className="mt-1 text-xs text-red-600">{errors.vehicleYear}</p>}
      </div>

      {/* Estimated monthly payment */}
      {monthlyPayment !== null && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-blue-700">Est. Monthly Payment</span>
          <span className="text-sm font-semibold text-blue-900">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyPayment)}
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Checking...
          </span>
        ) : (
          'Check Compliance'
        )}
      </button>
    </form>
  );
}
