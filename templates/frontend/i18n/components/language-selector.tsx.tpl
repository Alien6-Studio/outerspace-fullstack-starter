"use client";

import { Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next-intl/client';

const LANGUAGES = {
  ${LANGUAGE_MAPPING}
};

export function LanguageSelector() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        type="button"
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <select 
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-xs font-medium"
        >
          {Object.entries(LANGUAGES).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </button>
    </div>
  );
}