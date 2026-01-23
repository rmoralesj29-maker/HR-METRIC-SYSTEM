import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';

interface LanguageInputProps {
  value: string[];
  onChange: (languages: string[]) => void;
}

export const LanguageInput: React.FC<LanguageInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const addTags = (input: string) => {
    const newTags = input
      .split(/[,]+/) // Split by comma
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()); // Normalize casing

    // Deduplicate and merge
    const uniqueTags = new Set([...value, ...newTags]);
    onChange(Array.from(uniqueTags));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTags(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag
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
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100"
        >
          {tag}
          <button
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
  );
};
