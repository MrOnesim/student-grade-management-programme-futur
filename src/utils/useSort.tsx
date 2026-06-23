import { useState, useMemo } from 'react';

export type SortDir = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  dir: SortDir;
}

export function useSort<T extends Record<string, any>>(data: T[], defaultKey?: string) {
  const [sort, setSort] = useState<SortConfig>({ key: defaultKey || '', dir: 'asc' });

  const sorted = useMemo(() => {
    if (!sort.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal, 'fr', { sensitivity: 'base' });
      } else {
        cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data, sort]);

  const toggleSort = (key: string) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const SortHeader = ({ label, sortKey, className }: { label: string; sortKey: string; className?: string }) => (
    <button onClick={() => toggleSort(sortKey)} className={`inline-flex items-center gap-1 hover:text-gray-900 transition-colors ${className || ''}`}>
      {label}
      {sort.key === sortKey ? (
        <span className="text-indigo-500 text-xs">{sort.dir === 'asc' ? '▲' : '▼'}</span>
      ) : (
        <span className="text-gray-300 text-xs">⇅</span>
      )}
    </button>
  );

  return { sorted, sort, toggleSort, SortHeader };
}
