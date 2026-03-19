'use client';

interface DealInput {
  stateCode: string;
  salePrice: number;
  downPayment: number;
  loanAmount: number;
  apr: number;
  termMonths: number;
  vehicleYear: number;
}

interface ComplianceResultProps {
  result: 'pass' | 'fail';
  dealInput: DealInput;
  checkedAt: string;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function ComplianceResult({ result, dealInput, checkedAt }: ComplianceResultProps) {
  const pass = result === 'pass';

  return (
    <div className="space-y-4">
      {/* Pass/fail banner */}
      {pass ? (
        <div className="rounded-xl bg-green-50 border border-green-200 px-6 py-5 flex items-center gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-green-800">PASS</p>
            <p className="text-sm text-green-700">This deal is compliant</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-5 flex items-center gap-4">
          <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
            <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-red-800">FAIL</p>
            <p className="text-sm text-red-700">This deal has compliance issues</p>
          </div>
        </div>
      )}

      {/* Deal summary */}
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Deal Summary</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
          <div>
            <dt className="text-xs text-slate-500">State</dt>
            <dd className="text-sm font-semibold text-slate-900">{dealInput.stateCode}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">APR</dt>
            <dd className="text-sm font-semibold text-slate-900">{dealInput.apr.toFixed(2)}%</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Loan Amount</dt>
            <dd className="text-sm font-semibold text-slate-900">{currency.format(dealInput.loanAmount)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Sale Price</dt>
            <dd className="text-sm font-semibold text-slate-900">{currency.format(dealInput.salePrice)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Down Payment</dt>
            <dd className="text-sm font-semibold text-slate-900">{currency.format(dealInput.downPayment)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Term</dt>
            <dd className="text-sm font-semibold text-slate-900">{dealInput.termMonths} months</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Vehicle Year</dt>
            <dd className="text-sm font-semibold text-slate-900">{dealInput.vehicleYear}</dd>
          </div>
          <div className="col-span-2 sm:col-span-2">
            <dt className="text-xs text-slate-500">Checked At</dt>
            <dd className="text-sm text-slate-600">{new Date(checkedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
