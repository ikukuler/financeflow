import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Category } from '../../types';
import NewTransactionForm from '../NewTransactionForm';

interface AddExpenseModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onAdd: (amount: number, categoryId: string | null, name: string) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  categories,
  onClose,
  onAdd,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl p-8 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800">New Expense</DialogTitle>
        </DialogHeader>
        <NewTransactionForm categories={categories} onAdd={onAdd} />
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
