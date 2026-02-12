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
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">FinanceFlow</h1>
        <p className="text-slate-500 font-medium">Planning Tool (MDL)</p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenInitialBalanceModal}
            className="text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Set Initial Sum
          </button>

          {userEmail && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {userEmail}
            </span>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 hover:border-slate-300"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-start">
        <div className="text-left md:text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Initial Sum</p>
          <p className="text-lg font-bold text-slate-700">
            {initialBalance.toLocaleString()} <span className="text-[10px]">MDL</span>
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Spent</p>
          <p className="text-lg font-bold text-emerald-600">
            {totalSpent.toLocaleString()} <span className="text-[10px]">MDL</span>
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Allocated</p>
          <p className="text-lg font-bold text-slate-700">
            {totalAllocated.toLocaleString()} <span className="text-[10px]">MDL</span>
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
          <p className={`text-2xl font-black transition-colors ${remainingBalance < 0 ? 'text-rose-500' : 'text-indigo-600'}`}>
            {remainingBalance.toLocaleString()} <span className="text-xs">MDL</span>
          </p>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
