import React, { useMemo } from 'react';

export default function FilterBar({ filters, onFilterChange, classOptions = [], sectionOptions = [] }) {
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.className) count += 1;
    if (filters.section) count += 1;
    if (filters.search) count += 1;
    if (filters.status) count += 1;
    return count;
  }, [filters]);

  return (
    <div className="mt-6 rounded-xl border border-sky-100 bg-[#f6fbff] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sky-900">Filters</h2>
        {activeCount > 0 ? (
          <span className="rounded-full bg-sky-700 px-2 py-0.5 text-xs font-medium text-white">{activeCount} active</span>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <select
          value={filters.className}
          onChange={(e) => onFilterChange('className', e.target.value)}
          className="rounded-lg border border-sky-200 p-2 text-sm"
        >
          <option value="">All Classes</option>
          {classOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={filters.section}
          onChange={(e) => onFilterChange('section', e.target.value)}
          disabled={!filters.className && sectionOptions.length === 0}
          className="rounded-lg border border-sky-200 p-2 text-sm disabled:opacity-50"
        >
          <option value="">All Sections</option>
          {sectionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={filters.search}
          placeholder="Search name / mobile"
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="rounded-lg border border-sky-200 p-2 text-sm"
        />

        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="rounded-lg border border-sky-200 p-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}
