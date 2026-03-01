import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/shared/config/routes';

interface AppHeaderProps {
  initialBalance: number;
  totalSpent: number;
  totalAllocated: number;
  remainingBalance: number;
  onOpenInitialBalanceModal: () => void;
  activeTab: 'board' | 'settings';
  userEmail?: string | null;
  onSignOut?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  initialBalance,
  totalSpent,
  totalAllocated,
  remainingBalance,
  onOpenInitialBalanceModal,
  activeTab,
  userEmail,
  onSignOut,
}) => {
  const overBudgetAmount = remainingBalance < 0 ? Math.abs(remainingBalance) : 0;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  return (
    <header className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black uppercase tracking-[0.18em] text-white">
                  FF
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">FinanceFlow</h1>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Planner</p>
                </div>
              </div>

              <nav className="hidden items-center gap-1 md:flex">
                <Link
                  href={APP_ROUTES.board}
                  className={cn(
                    'inline-flex h-10 items-center justify-center rounded-xl px-4 text-xs font-black uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    activeTab === 'board' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  Board
                </Link>
                <Link
                  href={APP_ROUTES.settings}
                  className={cn(
                    'inline-flex h-10 items-center justify-center rounded-xl px-4 text-xs font-black uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  Settings
                </Link>
              </nav>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {userEmail && (
                <span className="max-w-[260px] truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {userEmail}
                </span>
              )}
              {onSignOut && (
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  className="text-xs font-black uppercase tracking-[0.16em] text-slate-600 hover:text-slate-800"
                >
                  Logout
                </Button>
              )}
            </div>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-2xl text-slate-700 md:hidden"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Open menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
                  </svg>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[88vw] max-w-sm border-l border-slate-200 px-0">
                <SheetHeader className="border-b border-slate-200 px-5 py-4 text-left">
                  <SheetTitle className="text-base font-black uppercase tracking-[0.16em] text-slate-900">Menu</SheetTitle>
                  <SheetDescription className="text-sm text-slate-500">Navigate between planner sections.</SheetDescription>
                </SheetHeader>

                <div className="px-4 py-4">
                  <nav className="flex flex-col gap-2">
                    <Link
                      href={APP_ROUTES.board}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex h-11 items-center rounded-xl px-4 text-left text-xs font-black uppercase tracking-[0.16em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                        activeTab === 'board' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'
                      )}
                    >
                      Board
                    </Link>
                    <Link
                      href={APP_ROUTES.settings}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex h-11 items-center rounded-xl px-4 text-left text-xs font-black uppercase tracking-[0.16em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                        activeTab === 'settings' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'
                      )}
                    >
                      Settings
                    </Link>
                    {userEmail && (
                      <Badge variant="outline" className="justify-start rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {userEmail}
                      </Badge>
                    )}
                    {onSignOut && (
                      <Button
                        onClick={onSignOut}
                        variant="outline"
                        className="h-11 justify-start rounded-xl px-4 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-700"
                      >
                        Logout
                      </Button>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">All amounts are shown in MDL.</p>
            </div>

            <Button
              onClick={onOpenInitialBalanceModal}
              className="min-h-11 rounded-2xl text-xs font-black uppercase tracking-[0.16em]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Set Initial Sum
            </Button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Initial Sum</p>
              <p className="mt-2 text-lg font-bold leading-tight text-slate-800 tabular-nums">
                {initialBalance.toLocaleString()} <span className="text-[11px]">MDL</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Total Spent</p>
              <p className="mt-2 text-lg font-bold leading-tight text-slate-800 tabular-nums">
                {totalSpent.toLocaleString()} <span className="text-[11px]">MDL</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Allocated</p>
              <p className="mt-2 text-lg font-bold leading-tight text-slate-800 tabular-nums">
                {totalAllocated.toLocaleString()} <span className="text-[11px]">MDL</span>
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-white lg:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">Remaining</p>
              <p className={`mt-2 text-3xl font-black leading-tight tabular-nums ${remainingBalance < 0 ? 'text-rose-300' : 'text-white'}`}>
                {remainingBalance.toLocaleString()} <span className="text-sm">MDL</span>
              </p>
              {remainingBalance < 0 && (
                <p className="mt-1 text-[11px] font-semibold text-rose-200 tabular-nums">
                  Over budget by {overBudgetAmount.toLocaleString()} MDL
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </header>
  );
};

export default React.memo(AppHeader);
