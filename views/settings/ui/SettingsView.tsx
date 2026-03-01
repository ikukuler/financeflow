import SettingsPanel from '@/components/sections/SettingsPanel';
import type { Category } from '@/types';

interface SettingsViewProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export default function SettingsView({ categories, onAddCategory, onDeleteCategory }: SettingsViewProps) {
  return <SettingsPanel categories={categories} onAddCategory={onAddCategory} onDeleteCategory={onDeleteCategory} />;
}
