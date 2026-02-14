
import React, { useEffect, useMemo, useState } from 'react';
import Select, { components, type OptionProps, type StylesConfig } from 'react-select';
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

const CustomOption = (props: OptionProps<CategoryOption, false>) => {
  const { data } = props;

  return (
    <components.Option {...props}>
      {data.isUnallocated ? (
        <span className="text-[10px] font-bold uppercase tracking-widest">Unallocated Pool</span>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${data.color ?? 'bg-slate-300'}`} />
          <span className="truncate">{data.label}</span>
        </div>
      )}
    </components.Option>
  );
};

const selectStyles: StylesConfig<CategoryOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 38,
    borderRadius: 12,
    borderColor: state.isFocused ? '#818cf8' : '#e2e8f0',
    backgroundColor: '#f8fafc',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.12)' : 'none',
    cursor: 'pointer',
    '&:hover': {
      borderColor: state.isFocused ? '#818cf8' : '#cbd5e1',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 10px',
  }),
  input: (base) => ({
    ...base,
    color: '#0f172a',
    margin: 0,
    padding: 0,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#334155',
    fontSize: 14,
    fontWeight: 500,
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontSize: 14,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: '#94a3b8',
    padding: 6,
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
    transition: 'transform 150ms ease',
    '&:hover': {
      color: '#64748b',
    },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base) => ({
    ...base,
    marginTop: 6,
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
    overflow: 'hidden',
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: 220,
    padding: 4,
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: state.data.isUnallocated ? 10 : 14,
    fontWeight: state.data.isUnallocated ? 700 : 500,
    textTransform: state.data.isUnallocated ? 'uppercase' : 'none',
    letterSpacing: state.data.isUnallocated ? '0.08em' : 'normal',
    backgroundColor: state.isFocused ? '#eef2ff' : state.isSelected ? '#e0e7ff' : '#ffffff',
    color: state.data.isUnallocated ? '#475569' : '#334155',
    padding: state.data.isUnallocated ? '9px 12px' : '8px 12px',
    borderBottom: state.data.isUnallocated ? '1px solid #f1f5f9' : undefined,
    '&:active': {
      backgroundColor: '#e0e7ff',
    },
  }),
};

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  categories,
  value,
  onChange,
  placeholder = 'Select category...',
  className = '',
}) => {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

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
      <Select<CategoryOption, false>
        options={options}
        value={selectedOption}
        onChange={(next) => onChange(next?.value ?? null)}
        placeholder={placeholder}
        isSearchable
        styles={selectStyles}
        components={{ Option: CustomOption }}
        menuPortalTarget={portalTarget}
        menuPosition={portalTarget ? 'fixed' : 'absolute'}
        noOptionsMessage={({ inputValue }) => `No matches for "${inputValue}"`}
      />
    </div>
  );
};

export default SearchableSelect;
