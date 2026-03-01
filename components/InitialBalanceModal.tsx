import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface InitialBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: number) => void;
  currentBalance: number;
}

const InitialBalanceModal: React.FC<InitialBalanceModalProps> = ({ isOpen, onClose, onSave, currentBalance }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue(currentBalance.toString());
    }
  }, [isOpen, currentBalance]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      onSave(parsed);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-8 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800">Set Initial Sum</DialogTitle>
          <DialogDescription className="text-slate-500">
            Enter your starting budget in MDL. Expenses will be subtracted from this amount.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Input
              autoFocus
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-16 rounded-2xl border-2 border-slate-100 bg-slate-50 pr-16 text-2xl font-bold text-slate-800"
              placeholder="0.00"
            />
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-lg font-bold text-slate-400">MDL</span>
          </div>

          <DialogFooter className="flex gap-3 sm:justify-stretch">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InitialBalanceModal;
