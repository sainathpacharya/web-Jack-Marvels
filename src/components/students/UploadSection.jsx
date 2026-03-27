import React, { useMemo, useRef, useState } from 'react';
import ErrorTable from './ErrorTable';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPT_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'application/vnd.ms-excel',
];

export default function UploadSection({
  onDownloadTemplate,
  onUpload,
  onUploadIntent,
  isUploading,
  uploadProgress,
  lastResult,
}) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const isValidFile = useMemo(() => {
    if (!file) return false;
    if (file.size > MAX_SIZE_BYTES) return false;
    const lowerName = file.name.toLowerCase();
    const validExt = lowerName.endsWith('.xlsx') || lowerName.endsWith('.csv');
    const validMime = ACCEPT_TYPES.includes(file.type) || file.type === '';
    return validExt && validMime;
  }, [file]);

  const validateAndSetFile = (nextFile) => {
    setError('');
    if (!nextFile) return;
    const lowerName = nextFile.name.toLowerCase();
    const validExt = lowerName.endsWith('.xlsx') || lowerName.endsWith('.csv');
    if (!validExt) {
      setError('Invalid file type. Please upload .xlsx or .csv');
      return;
    }
    if (nextFile.size > MAX_SIZE_BYTES) {
      setError('File size must be less than 5MB');
      return;
    }
    setFile(nextFile);
  };

  return (
    <div className="mt-6 rounded-xl border border-sky-100 bg-[#f6fbff] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          Download Excel Template
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          validateAndSetFile(e.dataTransfer.files?.[0]);
        }}
        className={`mt-4 rounded-xl border-2 border-dashed p-6 text-center ${
          isDragging ? 'border-sky-500 bg-sky-50' : 'border-sky-200 bg-white'
        }`}
      >
        <p className="text-sm text-gray-700">Drag & drop .xlsx/.csv here or choose a file</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={(e) => validateAndSetFile(e.target.files?.[0])}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onMouseEnter={onUploadIntent}
          onFocus={onUploadIntent}
          className="mt-3 rounded-lg border border-sky-200 px-4 py-2 text-sm text-sky-900"
        >
          Upload File
        </button>
      </div>

      {file ? (
        <p className="mt-3 text-sm text-gray-700">
          Selected: <span className="font-medium">{file.name}</span>
        </p>
      ) : null}
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-4">
        <button
          type="button"
          disabled={!file || !isValidFile || isUploading}
          onClick={() => onUpload(file)}
          onMouseEnter={onUploadIntent}
          onFocus={onUploadIntent}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? 'Uploading...' : 'Upload Students'}
        </button>
      </div>

      {isUploading ? (
        <div className="mt-3">
          <div className="h-2 w-full rounded bg-slate-200">
            <div className="h-2 rounded bg-sky-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-600">{uploadProgress}%</p>
        </div>
      ) : null}

      {lastResult ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Uploaded successfully: {lastResult.successCount} records.
          {lastResult.failedRecords?.length ? ` Failed: ${lastResult.failedRecords.length}.` : ''}
        </div>
      ) : null}

      <ErrorTable failedRecords={lastResult?.failedRecords || []} />
    </div>
  );
}
