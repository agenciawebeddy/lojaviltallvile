import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selected, onChange, placeholder = "Selecione..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const removeOption = (value: string) => {
    onChange(selected.filter(item => item !== value));
  };

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full bg-white border border-gray-300 rounded-md text-gray-900 p-2 flex justify-between items-center cursor-pointer min-h-[42px]">
        <div className="flex flex-wrap gap-1">
          {selected.length > 0 ? (
            selected.map(value => (
              <span key={value} className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                {options.find(o => o.value === value)?.label || value}
                <button type="button" onClick={(e) => { e.stopPropagation(); removeOption(value); }} className="hover:text-gray-200">
                  <X size={12} />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500 ml-2">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={20} className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 z-10 max-h-60 overflow-y-auto">
          {options.map(option => (
            <label key={option.value} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => handleSelect(option.value)}
                className="h-4 w-4 rounded bg-gray-100 border-gray-300 text-red-500 focus:ring-red-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;