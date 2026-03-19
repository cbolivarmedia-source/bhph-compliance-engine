'use client';
import { useState } from 'react';
import { DealForm, type DealFormData } from '../components/DealForm';
import { ComplianceResult } from '../components/ComplianceResult';
import { ViolationsList } from '../components/ViolationsList';
import { SuggestionCards } from '../components/SuggestionCard';
import { ApplicableRules } from '../components/ApplicableRules';

interface CheckResponse {
  dealInput: {
    stateCode: string;
    salePrice: number;
    downPayment: number;
    loanAmount: number;
    apr: number;
    termMonths: number;
    vehicleYear: number;
  };
  result: 'pass' | 'fail';
  violations: any[];
  warnings: any[];
  applicableRules: any[];
  checkedAt: string;
  suggestions: any[];
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResponse | null>(null);

  async function handleSubmit(data: DealFormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/compliance/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const json = await res.json();
      setCheckResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const deal = checkResult;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-slate-900">BHPH Compliance Engine</h1>
          <p className="text-sm text-slate-500 mt-0.5">Instant buy-here-pay-here regulatory compliance checks</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="lg:grid lg:grid-cols-[380px_1fr] lg:gap-8 lg:items-start">
          {/* Form panel — sticky on desktop */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-5">Deal Details</h2>
              <DealForm onSubmit={handleSubmit} loading={loading} />
            </div>
          </div>

          {/* Results panel */}
          <div className="mt-6 lg:mt-0 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!deal && !error && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <p className="text-sm text-slate-400">Fill in the deal details and click Check Compliance</p>
              </div>
            )}

            {deal && (
              <>
                <ComplianceResult
                  result={deal.result}
                  dealInput={deal.dealInput}
                  checkedAt={deal.checkedAt}
                />

                {((deal.violations?.length ?? 0) > 0 || (deal.warnings?.length ?? 0) > 0) && (
                  <ViolationsList violations={deal.violations ?? []} warnings={deal.warnings ?? []} />
                )}

                {(deal.suggestions?.length ?? 0) > 0 && (
                  <SuggestionCards
                    suggestions={deal.suggestions}
                    originalDeal={{
                      apr: deal.dealInput.apr,
                      termMonths: deal.dealInput.termMonths,
                      downPayment: deal.dealInput.downPayment,
                      salePrice: deal.dealInput.salePrice,
                    }}
                  />
                )}

                <ApplicableRules rules={deal.applicableRules ?? []} />
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 mt-4">
        <p className="text-xs text-slate-400 text-center">
          This tool provides regulatory information, not legal advice. Consult an attorney for specific situations.
        </p>
      </footer>
    </div>
  );
}
