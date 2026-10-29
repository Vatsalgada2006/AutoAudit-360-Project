import React, { useState } from 'react';

interface TooltipProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ term, definition, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="term-tooltip font-medium text-[#1B1B1F] dark:text-[#F6F1E7] border-b-2 border-dotted border-[#FF6B2C] hover:text-[#FF6B2C] transition-colors"
        title={definition}
      >
        {children || term}
      </span>
      {isOpen && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-[#1B1B1F] text-[#F6F1E7] dark:bg-[#F6F1E7] dark:text-[#1B1B1F] text-xs rounded shadow-xl border border-[#FF6B2C]/40 pointer-events-none transition-opacity duration-200">
          <span className="font-bold block text-[#FF6B2C] mb-1">{term}</span>
          <span>{definition}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1B1B1F] dark:border-t-[#F6F1E7]" />
        </span>
      )}
    </span>
  );
};
