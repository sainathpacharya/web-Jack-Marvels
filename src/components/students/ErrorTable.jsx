import React from 'react';

export default function ErrorTable({ failures = [], onDownloadReport }) {
  if (!failures.length) return null;

  return (
    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-rose-800">Upload Errors ({failures.length})</h3>
        {onDownloadReport ? (
          <button
            type="button"
            onClick={onDownloadReport}
            className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            Download Failure Report
          </button>
        ) : null}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-rose-800">
              <th className="px-3 py-2">Row Number</th>
              <th className="px-3 py-2">Reason</th>
              <th className="px-3 py-2">Mobile Number</th>
              <th className="px-3 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {failures.map((record, index) => (
              <tr key={`${record?.rowNumber ?? 'row'}-${index}`} className="border-t border-rose-200 align-top">
                <td className="px-3 py-2">{record?.rowNumber ?? '-'}</td>
                <td className="px-3 py-2 text-rose-900">{record?.reason ?? 'Validation failed'}</td>
                <td className="px-3 py-2">{record?.mobileNumber || '-'}</td>
                <td className="px-3 py-2">{record?.emailId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
