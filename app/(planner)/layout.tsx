import type { ReactNode } from 'react';
import PlannerApp from '@/components/PlannerApp';

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PlannerApp />
      {children}
    </>
  );
}
