import React, { useMemo } from 'react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from '@/components/ui/combobox';
import { Category } from '../types';

interface SearchableSelectProps {
  categories: Category[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

type CategoryOption = {
  value: string | null;
  label: string;
  color?: string;
  isUnallocated?: boolean;
};

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  categories,
  value,
  onChange,
  placeholder = 'Select category...',
  className = '',
}) => {
  const options = useMemo<CategoryOption[]>(
    () => [
      { value: null, label: 'Unallocated Pool', isUnallocated: true },
      ...categories.map((category) => ({
        value: category.id,
        label: category.name,
        color: category.color,
      })),
    ],
    [categories],
  );

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  return (
    <div className={className}>
      <Combobox<CategoryOption>
        value={selectedOption}
        onValueChange={(next) => onChange(next?.value ?? null)}
        items={options}
        itemToStringLabel={(item) => item.label}
        itemToStringValue={(item) => item.label}
        isItemEqualToValue={(item, current) => item.value === current.value}
        autoHighlight
      >
        <ComboboxInput
          className="w-full"
          placeholder={placeholder}
          showClear={value !== null}
        />
        <ComboboxContent className="z-[9999] rounded-xl border border-slate-200 shadow-xl">
          <ComboboxEmpty>No matches found.</ComboboxEmpty>
          <ComboboxList>
            {(option, index) => (
              <React.Fragment key={option.value ?? 'unallocated'}>
                {index === 1 && <ComboboxSeparator className="mx-1 my-1" />}
                <ComboboxItem
                  value={option}
                  className={option.isUnallocated ? 'text-[10px] font-bold uppercase tracking-widest text-slate-500' : ''}
                >
                  {option.isUnallocated ? (
                    <span className="truncate">Unallocated Pool</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${option.color ?? 'bg-slate-300'}`} />
                      <span className="truncate">{option.label}</span>
                    </div>
                  )}
                </ComboboxItem>
              </React.Fragment>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export default SearchableSelect;
