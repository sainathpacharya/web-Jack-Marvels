import React, { useRef, useState } from 'react';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export default function UploadToolbar({
  onDownloadTemplate,
  onUpload,
  onUploadIntent,
  isUploading,
  uploadProgress,
}) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const validateAndSetFile = (nextFile) => {
    setError('');
    if (!nextFile) return;

    const name = nextFile.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.csv')) {
      setError('Only .xlsx and .csv files are allowed.');
      return;
    }
    if (nextFile.size > MAX_SIZE_BYTES) {
      setError('Max allowed file size is 5MB.');
      return;
    }
    setFile(nextFile);
  };

  return (
    <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
        >
          Download Excel Template
        </button>

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
          disabled={isUploading}
          className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-60"
        >
          Choose File
        </button>
        <button
          type="button"
          onClick={() => onUpload(file)}
          onMouseEnter={onUploadIntent}
          onFocus={onUploadIntent}
          disabled={!file || isUploading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? 'Uploading...' : 'Upload Students'}
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-700">
        Selected file: <span className="font-medium">{file?.name || 'None'}</span>
      </p>
      {error ? <p className="mt-1 text-sm text-rose-700">{error}</p> : null}

      {isUploading ? (
        <div className="mt-3">
          <div className="h-2 w-full rounded bg-slate-200">
            <div className="h-2 rounded bg-sky-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-600">{uploadProgress}%</p>
        </div>
      ) : null}
    </div>
  );
}
