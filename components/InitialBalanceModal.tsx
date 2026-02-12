
import React, { useState, useEffect } from 'react';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      onSave(parsed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 transform transition-all animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-black text-slate-800 mb-2">Set Initial Sum</h2>
        <p className="text-slate-500 mb-6">Enter your starting budget in MDL. Expenses will be subtracted from this amount.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              autoFocus
              type="number" 
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-bold text-slate-800 focus:border-indigo-500 focus:ring-0 outline-none transition-all pr-16"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold">MDL</span>
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InitialBalanceModal;
