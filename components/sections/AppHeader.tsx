import React from 'react';

interface AppHeaderProps {
  initialBalance: number;
  totalSpent: number;
  totalAllocated: number;
  remainingBalance: number;
  onOpenInitialBalanceModal: () => void;
  userEmail?: string | null;
  onSignOut?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  initialBalance,
  totalSpent,
  totalAllocated,
  remainingBalance,
  onOpenInitialBalanceModal,
  userEmail,
  onSignOut,
}) => {
  const overBudgetAmount = remainingBalance < 0 ? Math.abs(remainingBalance) : 0;

  return (
    <header className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="space-y-2.5 sm:space-y-3">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">FinanceFlow</h1>
        <p className="text-slate-500 font-medium">Planning Tool (MDL)</p>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenInitialBalanceModal}
            className="w-full sm:w-auto text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center justify-center sm:justify-start gap-1 min-h-11 px-3 sm:px-0 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Set Initial Sum
          </button>

          {(userEmail || onSignOut) && (
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              {userEmail && (
                <span className="truncate max-w-[210px] text-[11px] font-semibold tracking-wide text-slate-500">
                  {userEmail}
                </span>
              )}
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 hover:border-slate-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-end">
        <div className="text-left">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Initial Sum</p>
          <p className="text-base sm:text-lg font-semibold text-slate-700 leading-tight tabular-nums">
            {initialBalance.toLocaleString()} <span className="text-[11px]">MDL</span>
          </p>
        </div>
        <div className="text-left">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-base sm:text-lg font-semibold text-slate-700 leading-tight tabular-nums">
            {totalSpent.toLocaleString()} <span className="text-[11px]">MDL</span>
          </p>
        </div>
        <div className="text-left">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Allocated</p>
          <p className="text-base sm:text-lg font-semibold text-slate-700 leading-tight tabular-nums">
            {totalAllocated.toLocaleString()} <span className="text-[11px]">MDL</span>
          </p>
        </div>
        <div className="text-left rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:py-2.5 col-span-2 lg:col-span-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Remaining</p>
          <p className={`text-2xl sm:text-3xl font-black leading-tight transition-colors tabular-nums ${remainingBalance < 0 ? 'text-rose-500' : 'text-indigo-600'}`}>
            {remainingBalance.toLocaleString()} <span className="text-sm">MDL</span>
          </p>
          {remainingBalance < 0 && (
            <p className="mt-1 text-[11px] font-semibold text-rose-600 tabular-nums">
              Over budget by {overBudgetAmount.toLocaleString()} MDL
            </p>
          )}
        </div>
      </div>
    </header>
  );
};

export default React.memo(AppHeader);
