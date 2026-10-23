import React, { useState, useEffect, useRef } from 'react';
import { Phone, ChevronDown, Search, Check } from 'lucide-react';
import { COUNTRY_CODES, CountryCode, DEFAULT_COUNTRY, parsePhoneNumber } from '../data/countryCodes';

interface PhoneInputWithCountryProps {
  value: string;
  onChange: (fullFormattedPhone: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
}

export const PhoneInputWithCountry: React.FC<PhoneInputWithCountryProps> = ({
  value,
  onChange,
  placeholder = '98765 43210',
  required = false,
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Parse existing phone value into country and national number
  const parsed = parsePhoneNumber(value);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
    return COUNTRY_CODES.find((c) => c.dialCode === parsed.dialCode) || DEFAULT_COUNTRY;
  });
  const [nationalNumber, setNationalNumber] = useState(parsed.nationalNumber);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    const p = parsePhoneNumber(value);
    const country = COUNTRY_CODES.find((c) => c.dialCode === p.dialCode) || DEFAULT_COUNTRY;
    setSelectedCountry(country);
    setNationalNumber(p.nationalNumber);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');
    const fullPhone = `${country.dialCode} ${nationalNumber.trim()}`;
    onChange(fullPhone);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/[^\d\s-]/g, '');
    setNationalNumber(rawDigits);
    const fullPhone = `${selectedCountry.dialCode} ${rawDigits.trim()}`;
    onChange(fullPhone);
  };

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Country Picker Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-neutral-100 dark:bg-[#121c17] border border-neutral-300 dark:border-[#273a30] border-r-0 rounded-l-xl text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-[#1a2821] transition-colors cursor-pointer shrink-0 text-sm font-medium"
          title="Select Country Calling Code"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold text-xs">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
        </button>

        {/* Input Field */}
        <div className="relative flex-1">
          <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-500 absolute left-3 top-3 pointer-events-none" />
          <input
            type="tel"
            value={nationalNumber}
            onChange={handleNumberChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-neutral-50 dark:bg-[#0a0f0d] border border-neutral-300 dark:border-[#273a30] rounded-r-xl pl-9 pr-3.5 py-2.5 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500 font-mono-numbers transition-colors"
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-72 max-h-72 bg-white dark:bg-[#101814] border border-neutral-200 dark:border-[#23352c] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fadeIn">
            {/* Search Box */}
            <div className="p-2 border-b border-neutral-200 dark:border-[#203028] bg-neutral-50 dark:bg-[#0c120e]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code..."
                  autoFocus
                  className="w-full bg-white dark:bg-[#14201a] text-xs text-neutral-900 dark:text-white placeholder-neutral-400 pl-8 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-[#283c32] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Country List */}
            <div className="overflow-y-auto max-h-56 divide-y divide-neutral-100 dark:divide-[#18241e]">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-xs text-neutral-500 dark:text-neutral-400 text-center">No matching countries found</div>
              ) : (
                filteredCountries.map((c) => {
                  const isSelected = c.code === selectedCountry.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left hover:bg-neutral-100 dark:hover:bg-[#1a2821] ${
                        isSelected ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold' : 'text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <span className="text-base">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{c.dialCode}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
