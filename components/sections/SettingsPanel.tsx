import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { Category } from '@/types';

interface SettingsPanelProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ categories, onAddCategory, onDeleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setNewCategoryName('');
  };

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="text-xl font-black text-slate-800">Settings</CardTitle>
        <CardDescription>Manage board categories.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Create category</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="h-11 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-800"
              />
              <Button type="submit" className="h-11 rounded-xl bg-slate-800 text-sm font-bold text-white hover:bg-slate-900">
                Add category
              </Button>
            </form>
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Existing categories</h3>
          {categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-400">
              No categories yet
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${category.color}`} />
                    <span className="truncate text-sm font-semibold text-slate-700">{category.name}</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDeleteCategory(category.id)}
                    className="text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    title="Delete category"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
