'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const GROUPS = [
  {
    name: 'Analysts',
    color: '#88619A',
    types: [
      { type: 'INTJ', label: 'Architect' },
      { type: 'INTP', label: 'Logician' },
      { type: 'ENTJ', label: 'Commander' },
      { type: 'ENTP', label: 'Debater' },
    ],
  },
  {
    name: 'Diplomats',
    color: '#33A474',
    types: [
      { type: 'INFJ', label: 'Advocate' },
      { type: 'INFP', label: 'Mediator' },
      { type: 'ENFJ', label: 'Protagonist' },
      { type: 'ENFP', label: 'Campaigner' },
    ],
  },
  {
    name: 'Sentinels',
    color: '#4298B4',
    types: [
      { type: 'ISTJ', label: 'Logistician' },
      { type: 'ISFJ', label: 'Defender' },
      { type: 'ESTJ', label: 'Executive' },
      { type: 'ESFJ', label: 'Consul' },
    ],
  },
  {
    name: 'Explorers',
    color: '#E4AE3A',
    types: [
      { type: 'ISTP', label: 'Virtuoso' },
      { type: 'ISFP', label: 'Adventurer' },
      { type: 'ESTP', label: 'Entrepreneur' },
      { type: 'ESFP', label: 'Entertainer' },
    ],
  },
];

export default function TypesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(!open)}
        className="hover:text-body transition-colors flex items-center gap-1"
      >
        Types
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-surface-300 shadow-lg p-4 z-50">
          <div className="grid grid-cols-2 gap-4">
            {GROUPS.map((group) => (
              <div key={group.name}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: group.color }}
                  >
                    {group.name}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {group.types.map(({ type, label }) => (
                    <Link
                      key={type}
                      href={`/types/${type}`}
                      onClick={() => setOpen(false)}
                      className="block px-2 py-1.5 rounded-lg text-sm text-body-light hover:bg-surface-100 hover:text-body transition-colors whitespace-nowrap"
                    >
                      <span className="font-semibold">{type}</span>{' '}
                      <span className="text-xs">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
