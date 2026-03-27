import React from 'react';

export default function PaginationControls({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
}) {
  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min(totalElements, (page + 1) * size);

  const currentBlock = Math.floor(page / 5);
  const blockStart = currentBlock * 5;
  const pages = Array.from({ length: Math.min(5, Math.max(0, totalPages - blockStart)) }, (_, i) => blockStart + i);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600">
        Showing {start}-{end} of {totalElements} students
      </p>

      <div className="flex items-center gap-2">
        <label htmlFor="page-size" className="text-sm text-gray-700">
          Rows:
        </label>
        <select
          id="page-size"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="rounded-lg border border-sky-200 px-2 py-1 text-sm"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-sky-200 px-3 py-1 text-sm disabled:opacity-50"
        >
          Previous
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`rounded-lg px-3 py-1 text-sm ${
              p === page ? 'bg-sky-700 text-white' : 'border border-sky-200 text-sky-900'
            }`}
          >
            {p + 1}
          </button>
        ))}

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-sky-200 px-3 py-1 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
