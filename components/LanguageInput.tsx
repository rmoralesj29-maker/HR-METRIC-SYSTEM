import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';

interface LanguageInputProps {
  value: string[];
  onChange: (languages: string[]) => void;
  quickAddOptions?: string[];
}

export const LanguageInput: React.FC<LanguageInputProps> = ({ value = [], onChange, quickAddOptions = [] }) => {
  const [inputValue, setInputValue] = useState('');

  const normalizeTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };

  const addTags = (input: string) => {
    const existingLower = new Set(value.map(v => v.toLowerCase()));

    const newTags = input
      .split(/[,]+/) // Split by comma
      .map(normalizeTag)
      .filter((tag) => tag.length > 0 && !existingLower.has(tag.toLowerCase()));

    if (newTags.length > 0) {
      onChange([...value, ...newTags]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTags(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    addTags(pastedData);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleQuickAdd = (e: ChangeEvent<HTMLSelectElement>) => {
      const selected = e.target.value;
      if (selected) {
          addTags(selected);
      }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-indigo-900 rounded-full focus:outline-none"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={value.length === 0 ? "Type languages (e.g. English, Spanish)..." : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-slate-900 placeholder-slate-400"
        />
      </div>

      {quickAddOptions.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
             <span className="whitespace-nowrap">Quick Add:</span>
             <select
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                onChange={handleQuickAdd}
                value=""
             >
                 <option value="" disabled>Select Language...</option>
                 {quickAddOptions.map(opt => (
                     <option key={opt} value={opt} disabled={value.some(v => v.toLowerCase() === opt.toLowerCase())}>
                         {opt}
                     </option>
                 ))}
             </select>
          </div>
      )}
    </div>
  );
};
