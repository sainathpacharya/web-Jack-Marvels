import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../auth/session';

export default function AddStudentPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const schoolId = user?.schoolId ?? user?.school_id ?? 'default-school';
  const [studentForm, setStudentForm] = useState({
    name: '',
    className: '',
    section: '',
    rollNumber: '',
  });
  const [toast, setToast] = useState('');
  const [students, setStudents] = useState(() => {
    try {
      const raw = localStorage.getItem('schoolStudentsBySchool');
      const map = raw ? JSON.parse(raw) : {};
      return Array.isArray(map[schoolId]) ? map[schoolId] : [];
    } catch {
      return [];
    }
  });

  const storedStudentsBySchool = useMemo(() => {
    try {
      const raw = localStorage.getItem('schoolStudentsBySchool');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const handleAddStudent = () => {
    const name = studentForm.name.trim();
    const className = studentForm.className.trim();

    if (!name || !className) {
      setToast('Student name and class are required.');
      window.setTimeout(() => setToast(''), 2500);
      return;
    }

    const newStudent = {
      id: Date.now(),
      name,
      className,
      section: studentForm.section.trim(),
      rollNumber: studentForm.rollNumber.trim(),
    };
    const nextStudents = [newStudent, ...students];
    setStudents(nextStudents);
    const next = { ...storedStudentsBySchool, [schoolId]: nextStudents };
    localStorage.setItem('schoolStudentsBySchool', JSON.stringify(next));
    setStudentForm({ name: '', className: '', section: '', rollNumber: '' });
    setToast('Student added successfully');
    window.setTimeout(() => setToast(''), 2500);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sky-900">Add Students</h1>
          <p className="mt-1 text-sm text-gray-600">Add single student or continue with bulk Excel upload.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/school/add-students/bulk-upload')}
          className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          Bulk Upload
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-sky-100 bg-[#e6f6ff] p-4">
        <h2 className="text-sm font-semibold text-sky-900">Add Student</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={studentForm.name}
            onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Student name *"
            className="w-full rounded-lg border border-sky-200 p-3"
          />
          <input
            value={studentForm.className}
            onChange={(e) => setStudentForm((prev) => ({ ...prev, className: e.target.value }))}
            placeholder="Class *"
            className="w-full rounded-lg border border-sky-200 p-3"
          />
          <input
            value={studentForm.section}
            onChange={(e) => setStudentForm((prev) => ({ ...prev, section: e.target.value }))}
            placeholder="Section"
            className="w-full rounded-lg border border-sky-200 p-3"
          />
          <input
            value={studentForm.rollNumber}
            onChange={(e) => setStudentForm((prev) => ({ ...prev, rollNumber: e.target.value }))}
            placeholder="Roll number"
            className="w-full rounded-lg border border-sky-200 p-3"
          />
        </div>
        <button
          type="button"
          onClick={handleAddStudent}
          className="mt-3 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          Create Student
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-sky-100 bg-white p-4">
        <h2 className="text-sm font-semibold text-sky-900">Recent Students</h2>
        {students.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">No students uploaded yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-sky-100 rounded-lg border border-sky-100">
            {students.slice(0, 8).map((student) => (
              <div key={student.id} className="p-3">
                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                <p className="text-xs text-gray-600">
                  Class: {student.className || '-'} | Section: {student.section || '-'} | Roll: {student.rollNumber || '-'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 rounded-lg bg-sky-700 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
      ) : null}
    </div>
  );
}
