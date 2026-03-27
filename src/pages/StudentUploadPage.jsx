import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import UploadSection from '../components/students/UploadSection';
import FilterBar from '../components/students/FilterBar';
import StudentTable from '../components/students/StudentTable';
import PaginationControls from '../components/students/PaginationControls';
import ClassSectionAccordion from '../components/students/ClassSectionAccordion';
import {
  bulkUploadStudents,
  downloadStudentsTemplate,
  getStudents,
  getStudentsTemplateUrl,
  prefetchXlsx,
} from '../api/students';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { queryKeys } from '../lib/queryKeys';

const FILTER_STORAGE_KEY = 'school.students.filters';
const PAGINATION_STORAGE_KEY = 'school.students.pagination';

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function StudentUploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(() =>
    readStored(FILTER_STORAGE_KEY, {
      className: '',
      section: '',
      search: '',
      status: '',
    })
  );
  const [pagination, setPagination] = useState(() =>
    readStored(PAGINATION_STORAGE_KEY, {
      page: 0,
      size: 20,
      sortBy: '',
      sortDir: 'asc',
    })
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const queryParams = useMemo(
    () => ({
      page: pagination.page,
      size: pagination.size,
      className: filters.className,
      section: filters.section,
      search: debouncedSearch,
      status: filters.status,
      sortBy: pagination.sortBy,
      sortDir: pagination.sortDir,
    }),
    [debouncedSearch, filters.className, filters.section, filters.status, pagination.page, pagination.size, pagination.sortBy, pagination.sortDir]
  );

  const studentsQuery = useQuery({
    queryKey: queryKeys.students.list(queryParams),
    queryFn: () => getStudents(queryParams),
    placeholderData: (prev) => prev,
    retry: 1,
  });

  const uploadMutation = useMutation({
    mutationFn: (file) =>
      bulkUploadStudents(file, (progress) => {
        setUploadProgress(progress);
      }),
    onSuccess: (result) => {
      setUploadResult(result);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
    onError: () => setUploadProgress(0),
  });

  const handleTemplateDownload = async () => {
    try {
      const { blob, fileName } = await downloadStudentsTemplate();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback if endpoint does not support CORS blob in current environment.
      window.open(getStudentsTemplateUrl(), '_blank', 'noopener,noreferrer');
      alert(error?.message || 'Template download failed. Opened direct link instead.');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'className') next.section = '';
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setPagination((prev) => {
      const next = { ...prev, page: 0 };
      localStorage.setItem(PAGINATION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handlePageChange = (nextPage) => {
    setPagination((prev) => {
      const next = { ...prev, page: Math.max(0, nextPage) };
      localStorage.setItem(PAGINATION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSizeChange = (size) => {
    setPagination((prev) => {
      const next = { ...prev, size, page: 0 };
      localStorage.setItem(PAGINATION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleSortChange = (key) => {
    setPagination((prev) => {
      const nextDir = prev.sortBy === key && prev.sortDir === 'asc' ? 'desc' : 'asc';
      const next = { ...prev, sortBy: key, sortDir: nextDir, page: 0 };
      localStorage.setItem(PAGINATION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const students = studentsQuery.data?.items || [];
  const totalElements = studentsQuery.data?.totalElements || 0;
  const totalPages = studentsQuery.data?.totalPages || 1;

  const classOptions = useMemo(
    () => [...new Set(students.map((s) => s.className).filter(Boolean))].sort(),
    [students]
  );
  const sectionOptions = useMemo(() => {
    const filtered = filters.className ? students.filter((s) => s.className === filters.className) : students;
    return [...new Set(filtered.map((s) => s.section).filter(Boolean))].sort();
  }, [filters.className, students]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Add Students</h1>
          <p className="mt-1 text-sm text-gray-700">Upload students in bulk using Excel template</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/school/add-students')}
          className="rounded-lg border border-sky-200 px-3 py-2 text-sm text-sky-900"
        >
          Back to Add Student
        </button>
      </div>

      <UploadSection
        onDownloadTemplate={handleTemplateDownload}
        onUploadIntent={prefetchXlsx}
        onUpload={(file) => {
          setUploadResult(null);
          uploadMutation.mutate(file);
        }}
        isUploading={uploadMutation.isPending}
        uploadProgress={uploadProgress}
        lastResult={uploadResult}
      />

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        classOptions={classOptions}
        sectionOptions={sectionOptions}
      />

      {studentsQuery.isError ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-800">
            {studentsQuery.error?.message || 'Unable to fetch students right now.'}
          </p>
          <button
            type="button"
            onClick={() => studentsQuery.refetch()}
            className="mt-2 rounded-lg border border-rose-300 px-3 py-1 text-sm text-rose-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      {students.length === 0 && !studentsQuery.isLoading ? (
        <p className="mt-4 rounded-lg bg-sky-50 p-4 text-sm text-sky-800">
          {filters.className || filters.section || filters.search || filters.status
            ? 'No students found'
            : 'No students uploaded yet'}
        </p>
      ) : (
        <>
          <StudentTable
            students={students}
            sortBy={pagination.sortBy}
            sortDir={pagination.sortDir}
            onSortChange={handleSortChange}
            loading={studentsQuery.isLoading || studentsQuery.isFetching}
          />
          <PaginationControls
            page={pagination.page}
            size={pagination.size}
            totalElements={totalElements}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onSizeChange={handleSizeChange}
          />
          <ClassSectionAccordion students={students} />
        </>
      )}
    </div>
  );
}
