import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { downloadStudentsTemplate, prefetchXlsx } from '../../api/students';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import {
  useBulkUploadStudentsMutation,
  useInfiniteStudentsQuery,
  useUpdateStudentStatusMutation,
} from '../../features/students/hooks/useStudentsQuery';
import { useNotifications } from '../../components/notifications/NotificationProvider';

const UploadToolbar = lazy(() => import('../../components/students/UploadToolbar'));
const FilterBar = lazy(() => import('../../components/students/FilterBar'));
const StudentTable = lazy(() => import('../../components/students/StudentTable'));
const ErrorTable = lazy(() => import('../../components/students/ErrorTable'));

const DEFAULT_FILTERS = { className: '', section: '', search: '', status: '' };
const DEFAULT_PAGINATION = { size: 20, sortBy: '', sortDir: 'asc' };

export default function StudentsPage() {
  const { success, error: notifyError } = useNotifications();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState(() => ({
    size: DEFAULT_PAGINATION.size,
    sortBy: DEFAULT_PAGINATION.sortBy,
    sortDir: DEFAULT_PAGINATION.sortDir,
  }));
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [updatingStudentId, setUpdatingStudentId] = useState(null);
  const loadMoreSentinelRef = useRef(null);

  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const queryParams = useMemo(
    () => ({
      size: pagination.size,
      className: filters.className,
      section: filters.section,
      search: debouncedSearch,
      status: filters.status,
      sortBy: pagination.sortBy,
      sortDir: pagination.sortDir,
    }),
    [debouncedSearch, filters.className, filters.section, filters.status, pagination.size, pagination.sortBy, pagination.sortDir]
  );

  const studentsQuery = useInfiniteStudentsQuery(queryParams);
  const uploadMutation = useBulkUploadStudentsMutation();
  const updateStatusMutation = useUpdateStudentStatusMutation();

  const pages = studentsQuery.data?.pages || [];
  const students = useMemo(() => pages.flatMap((page) => page.items || []), [pages]);
  const totalElements = pages[0]?.totalElements || students.length;
  const hasMore = Boolean(studentsQuery.hasNextPage);

  const classOptions = useMemo(
    () => [...new Set(students.map((student) => student.className).filter(Boolean))].sort(),
    [students]
  );
  const sectionOptions = useMemo(() => {
    const byClass = filters.className
      ? students.filter((student) => student.className === filters.className)
      : students;
    return [...new Set(byClass.map((student) => student.section).filter(Boolean))].sort();
  }, [filters.className, students]);

  useEffect(() => {
    if (!loadMoreSentinelRef.current || !hasMore) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && !studentsQuery.isFetchingNextPage) {
          studentsQuery.fetchNextPage();
        }
      },
      { root: null, rootMargin: '200px 0px', threshold: 0.05 }
    );
    observer.observe(loadMoreSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, studentsQuery]);

  const downloadFailureReport = () => {
    const rows = uploadResult?.failures || [];
    if (!rows.length) return;
    const csvRows = [
      ['Row Number', 'Reason', 'Mobile Number', 'Email'].join(','),
      ...rows.map((row) =>
        [
          row?.rowNumber ?? '',
          `"${String(row?.reason ?? '').replace(/"/g, '""')}"`,
          row?.mobileNumber ?? '',
          row?.emailId ?? '',
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'student-upload-failures.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-sky-900">Students</h1>
      <p className="mt-1 text-sm text-gray-700">Bulk upload, list, and access-control students.</p>

      <Suspense fallback={<div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-200" />}>
        <UploadToolbar
          onDownloadTemplate={downloadStudentsTemplate}
          onUploadIntent={prefetchXlsx}
          onUpload={async (file) => {
            setUploadResult(null);
            setUploadProgress(0);
            try {
              const result = await uploadMutation.mutateAsync({
                file,
                onProgress: (progress) => setUploadProgress(progress),
              });
              setUploadResult(result);
              success(`${result.successCount} students uploaded successfully`);
              setUploadProgress(0);
            } catch (error) {
              setUploadProgress(0);
              notifyError(error?.message || 'Upload failed');
            }
          }}
          isUploading={uploadMutation.isPending}
          uploadProgress={uploadProgress}
        />
      </Suspense>

      {uploadResult ? (
        <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-sky-100 bg-white p-4 sm:grid-cols-3">
          <div className="rounded-lg bg-sky-50 p-3">
            <p className="text-xs text-gray-600">Total Rows</p>
            <p className="text-lg font-semibold text-sky-900">{uploadResult.totalRows ?? 0}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs text-gray-600">Success Count</p>
            <p className="text-lg font-semibold text-emerald-700">{uploadResult.successCount ?? 0}</p>
          </div>
          <div className="rounded-lg bg-rose-50 p-3">
            <p className="text-xs text-gray-600">Failure Count</p>
            <p className="text-lg font-semibold text-rose-700">{uploadResult.failureCount ?? 0}</p>
          </div>
        </div>
      ) : null}

      <Suspense fallback={<div className="mt-4 h-16 animate-pulse rounded-xl bg-slate-100" />}>
        <FilterBar
          filters={filters}
          classOptions={classOptions}
          sectionOptions={sectionOptions}
          onFilterChange={(field, value) => {
            setFilters((previous) => ({ ...previous, [field]: value, ...(field === 'className' ? { section: '' } : {}) }));
          }}
        />
      </Suspense>

      <Suspense fallback={<div className="mt-4 h-[420px] animate-pulse rounded-xl bg-slate-100" />}>
        <StudentTable
          students={students}
          sortBy={pagination.sortBy}
          sortDir={pagination.sortDir}
          loading={studentsQuery.isLoading || studentsQuery.isFetching}
          emptyMessage={
            filters.className || filters.section || filters.search || filters.status
              ? 'No students found for selected filters.'
              : 'No students uploaded yet. Upload Excel to get started.'
          }
          updatingStudentId={updatingStudentId}
          onSortChange={(key) =>
            setPagination((previous) => ({
              ...previous,
              sortBy: key,
              sortDir: previous.sortBy === key && previous.sortDir === 'asc' ? 'desc' : 'asc',
            }))
          }
          onStatusToggle={(student) =>
            {
              const active = String(student.status || '').toLowerCase() !== 'active';
              setUpdatingStudentId(String(student.id));
              updateStatusMutation
                .mutateAsync({ studentId: student.id, active })
                .then(() => success('Student status updated successfully'))
                .catch((error) => {
                  notifyError(error?.message || 'Status update failed');
                })
                .finally(() => setUpdatingStudentId(null));
            }
          }
        />
      </Suspense>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm text-slate-600">{students.length} of {totalElements} loaded</p>
        <p className="text-sm text-slate-700">
          {studentsQuery.isFetchingNextPage ? 'Loading more...' : hasMore ? 'Auto-loading on scroll' : 'End of list'}
        </p>
      </div>
      <div ref={loadMoreSentinelRef} className="h-2 w-full" aria-hidden />
      {studentsQuery.isFetchingNextPage ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="mb-2 h-8 animate-pulse rounded bg-slate-100 last:mb-0" />
          ))}
        </div>
      ) : null}

      <Suspense fallback={<div className="mt-4 h-40 animate-pulse rounded-xl bg-slate-100" />}>
        <ErrorTable failures={uploadResult?.failures || []} onDownloadReport={downloadFailureReport} />
      </Suspense>
    </div>
  );
}
