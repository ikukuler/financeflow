import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-400">
          Amounts (one per line)
        </Label>
        <div className="relative">
          <Textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            className="min-h-[120px] rounded-xl border-slate-200 bg-white px-4 py-3 font-mono text-slate-800"
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
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-400">Target Allocation</Label>
        <SearchableSelect 
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
          placeholder="Unallocated Pool"
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-slate-800 font-bold text-white hover:bg-slate-900"
      >
        Subtract Amounts
      </Button>
    </form>
  );
};

export default NewTransactionForm;
