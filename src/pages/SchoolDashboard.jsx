import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserRoleId, getUserRoleName, ROLE_IDS } from '../auth/session';
import AppHeader from '../components/AppHeader';
import { logoutFromServer } from '../api/auth';

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const roleName = getUserRoleName();
  const schoolId = user?.schoolId ?? user?.school_id ?? 'default-school';
  const [activeTab, setActiveTab] = useState('add-student');
  const [studentForm, setStudentForm] = useState({
    name: '',
    className: '',
    section: '',
    rollNumber: '',
  });
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

  useEffect(() => {
    if (getUserRoleId() !== ROLE_IDS.SCHOOL) {
      navigate('/forbidden');
    }
  }, [navigate]);

  useEffect(() => {
    const next = { ...storedStudentsBySchool, [schoolId]: students };
    localStorage.setItem('schoolStudentsBySchool', JSON.stringify(next));
  }, [schoolId, students, storedStudentsBySchool]);

  const handleLogout = async () => {
    await logoutFromServer();
    navigate('/');
  };

  const handleAddStudent = () => {
    const name = studentForm.name.trim();
    const className = studentForm.className.trim();

    if (!name || !className) {
      alert('Student name and class are required.');
      return;
    }

    const newStudent = {
      id: Date.now(),
      name,
      className,
      section: studentForm.section.trim(),
      rollNumber: studentForm.rollNumber.trim(),
    };

    setStudents((prev) => [newStudent, ...prev]);
    setStudentForm({ name: '', className: '', section: '', rollNumber: '' });
  };

  return (
    <div className="min-h-screen bg-[#f3fbff] flex flex-col">
      <AppHeader onLogout={handleLogout} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
          <h1 className="text-2xl font-bold text-sky-900">School Home</h1>
          <p className="text-gray-700 mt-2">
            Logged in as <span className="font-semibold">{roleName || 'School'}</span>
            {schoolId !== '' ? (
              <>
                {' '}
                (School ID: <span className="font-semibold">{schoolId}</span>)
              </>
            ) : null}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Only school role can create students on web. Student self-registration is mobile app only.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate('/school/add-students')}
              className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
            >
              Go to Bulk Student Upload
            </button>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('add-student')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'add-student' ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-900'
              }`}
            >
              Add Student
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manage-students')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'manage-students' ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-900'
              }`}
            >
              Manage Students
            </button>
          </div>

          {activeTab === 'add-student' && (
            <div className="mt-6 rounded-xl border border-sky-100 bg-[#e6f6ff] p-4">
              <h2 className="text-sm font-semibold text-sky-900">Add Student</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <input
                  value={studentForm.name}
                  onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Student name *"
                  className="w-full p-3 border border-sky-200 rounded-lg"
                />
                <input
                  value={studentForm.className}
                  onChange={(e) => setStudentForm((prev) => ({ ...prev, className: e.target.value }))}
                  placeholder="Class *"
                  className="w-full p-3 border border-sky-200 rounded-lg"
                />
                <input
                  value={studentForm.section}
                  onChange={(e) => setStudentForm((prev) => ({ ...prev, section: e.target.value }))}
                  placeholder="Section"
                  className="w-full p-3 border border-sky-200 rounded-lg"
                />
                <input
                  value={studentForm.rollNumber}
                  onChange={(e) => setStudentForm((prev) => ({ ...prev, rollNumber: e.target.value }))}
                  placeholder="Roll number"
                  className="w-full p-3 border border-sky-200 rounded-lg"
                />
              </div>
              <button
                type="button"
                onClick={handleAddStudent}
                className="mt-3 px-4 py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-800 text-sm font-medium"
              >
                Create Student
              </button>
            </div>
          )}

          {activeTab === 'manage-students' && (
            <div className="mt-6 rounded-xl border border-sky-100 bg-[#e6f6ff] p-4">
              <h2 className="text-sm font-semibold text-sky-900">Manage Students</h2>
              {students.length === 0 ? (
                <p className="text-sm text-sky-800 mt-2">No students found for this school.</p>
              ) : (
                <div className="mt-3 divide-y divide-sky-100 border border-sky-100 bg-white rounded-lg">
                  {students.map((student) => (
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
          )}
        </div>
      </main>
    </div>
  );
}

