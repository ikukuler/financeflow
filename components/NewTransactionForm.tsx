
import React, { useState } from 'react';
import { Category } from '../types';
import SearchableSelect from './SearchableSelect';

interface NewTransactionFormProps {
  categories: Category[];
  onAdd: (amount: number, categoryId: string | null, name: string) => void;
}

// Exchange rates for MDL
const RATES = {
  USD: 17,
  EUR: 20,
};

const NewTransactionForm: React.FC<NewTransactionFormProps> = ({ categories, onAdd }) => {
  const [inputContent, setInputContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const parseLineToMDL = (text: string): number | null => {
    const raw = text.toLowerCase().trim();
    if (!raw) return null;

    // Detect currency markers anywhere in the line
    const isUSD = /\$|usd|доллар|долл|дол/.test(raw);
    const isEUR = /€|eur|euro|евро|евр/.test(raw);

    // Extract only numbers and decimals
    const numPart = raw.replace(/[^\d.,]/g, '').replace(',', '.');
    const value = parseFloat(numPart);

    if (isNaN(value)) return null;

    if (isUSD) return value * RATES.USD;
    if (isEUR) return value * RATES.EUR;
    
    // Default to MDL
    return value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const lines = inputContent.split('\n');
    
    let addedCount = 0;
    lines.forEach(line => {
      const amountMDL = parseLineToMDL(line);
      if (amountMDL !== null && amountMDL > 0) {
        onAdd(amountMDL, categoryId, '');
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setInputContent('');
      setCategoryId(null); // Reset category after adding
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
          Amounts (one per line)
        </label>
        <div className="relative">
          <textarea 
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[120px] font-mono text-slate-800"
            placeholder={"100\n50$\n20 euro"}
            required
          />
        </div>
        <p className="mt-2 text-[10px] text-slate-400 font-medium leading-relaxed">
          Enter amounts. Description can be added after creation by clicking the block.<br/>
          $ = 17 MDL, € = 20 MDL.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Allocation</label>
        <SearchableSelect 
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Unallocated Pool"
        />
      </div>

      <button 
        type="submit"
        className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 active:scale-[0.98] transition-all shadow-lg"
      >
        Subtract Amounts
      </button>
    </form>
  );
};

export default NewTransactionForm;
