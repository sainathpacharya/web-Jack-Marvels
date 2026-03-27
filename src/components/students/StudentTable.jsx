import React from 'react';
import { List } from 'react-window';
import StatusToggle from './StatusToggle';

const SORTABLE_HEADERS = [
  { key: 'name', label: 'Name' },
  { key: 'mobileNumber', label: 'Mobile Number' },
  { key: 'emailId', label: 'Email' },
  { key: 'className', label: 'Class' },
  { key: 'section', label: 'Section' },
  { key: 'status', label: 'Status' },
];

const VIRTUALIZATION_THRESHOLD = 50;
const ROW_HEIGHT = 56;
const MAX_VIEWPORT_HEIGHT = 560;

function StudentTable({
  students = [],
  sortBy,
  sortDir,
  onSortChange,
  onStatusToggle,
  updatingStudentId,
  emptyMessage = 'No students uploaded yet. Upload Excel to get started.',
  loading = false,
}) {
  const shouldVirtualize = students.length > VIRTUALIZATION_THRESHOLD && !loading;

  const renderRow = ({ index, style, students: items, onStatusToggle: onToggle, updatingStudentId: updatingId }) => {
    const student = items[index];
    if (!student) return null;
    return (
      <div
        key={student.id}
        style={style}
        className="grid grid-cols-6 items-center border-t border-sky-100 px-4 text-sm text-slate-800"
      >
        <div className="truncate pr-3">{student.name}</div>
        <div className="truncate pr-3">{student.mobileNumber || '-'}</div>
        <div className="truncate pr-3">{student.emailId || '-'}</div>
        <div className="truncate pr-3">{student.className || '-'}</div>
        <div className="truncate pr-3">{student.section || '-'}</div>
        <div>
          <StatusToggle
            active={String(student.status || '').toLowerCase() === 'active'}
            disabled={updatingId === student.id}
            onChange={() => onToggle(student)}
          />
        </div>
      </div>
    );
  };

  if (shouldVirtualize) {
    return (
      <div className="mt-4 overflow-hidden rounded-xl border border-sky-100 bg-white">
        <div className="grid grid-cols-6 bg-sky-50 px-4 py-3 text-left text-sm font-semibold text-sky-900">
          {SORTABLE_HEADERS.map((header) => (
            <button
              key={header.key}
              type="button"
              onClick={() => onSortChange(header.key)}
              className="inline-flex items-center gap-1 text-left"
            >
              {header.label}
              {sortBy === header.key ? <span>{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
            </button>
          ))}
        </div>
        <List
          className="w-full"
          rowComponent={renderRow}
          rowCount={students.length}
          rowHeight={ROW_HEIGHT}
          rowProps={{ students, onStatusToggle, updatingStudentId }}
          style={{ height: Math.min(MAX_VIEWPORT_HEIGHT, students.length * ROW_HEIGHT) }}
        >
          {null}
        </List>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-sky-100 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-sky-50 text-left text-sky-900">
          <tr>
            {SORTABLE_HEADERS.map((header) => (
              <th key={header.key} className="px-4 py-3 font-semibold">
                <button
                  type="button"
                  onClick={() => onSortChange(header.key)}
                  className="inline-flex items-center gap-1"
                >
                  {header.label}
                  {sortBy === header.key ? <span>{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="border-t border-sky-100">
                  {Array.from({ length: 6 }).map((__, cIdx) => (
                    <td key={cIdx} className="px-4 py-3">
                      <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                    </td>
                  ))}
                </tr>
              ))
            : students.length === 0
              ? (
                <tr className="border-t border-sky-100">
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-sky-800">
                    {emptyMessage}
                  </td>
                </tr>
                )
              : shouldVirtualize
                ? (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <List
                        className="w-full"
                        height={Math.min(MAX_VIEWPORT_HEIGHT, students.length * ROW_HEIGHT)}
                        itemCount={students.length}
                        itemSize={ROW_HEIGHT}
                        width="100%"
                      >
                        {renderRow}
                      </List>
                    </td>
                  </tr>
                  )
                : students.map((student) => (
                  <tr key={student.id} className="border-t border-sky-100">
                    <td className="px-4 py-3">{student.name}</td>
                    <td className="px-4 py-3">{student.mobileNumber || '-'}</td>
                    <td className="px-4 py-3">{student.emailId || '-'}</td>
                    <td className="px-4 py-3">{student.className || '-'}</td>
                    <td className="px-4 py-3">{student.section || '-'}</td>
                    <td className="px-4 py-3">
                      <StatusToggle
                        active={String(student.status || '').toLowerCase() === 'active'}
                        disabled={updatingStudentId === student.id}
                        onChange={() => onStatusToggle(student)}
                      />
                    </td>
                  </tr>
                ))}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(StudentTable);
