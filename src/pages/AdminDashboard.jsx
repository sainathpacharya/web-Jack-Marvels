import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearSession } from '../auth/session';
import { createSchool, listSchools } from '../api/schools';
import {
  STATIC_TOTAL_STUDENTS,
  STATIC_RECENT_UPLOADS,
  STATIC_QUIZ_ATTEMPTS,
  STATIC_STUDENTS_LIST,
  STATIC_SCHOOLS_ADDED,
} from '../data/staticData';

const PROMOTER_SCHOOLS_KEY = 'promoterSchools';
const PROMOTERS_KEY = 'adminPromoters';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: '🕐', path: 'dashboard' },
  { label: 'Students', icon: '✉️', path: 'students' },
  { label: 'Events', icon: '🎉', path: 'events' },
  { label: 'QUIZ', icon: '🧠', path: 'quiz' },
  { label: 'Promotors', icon: '🧑‍💼', path: 'promotors' },
  { label: 'Schools', icon: '🏫', path: 'schools' },
];

const getSchoolsAdded = () => {
  try {
    const raw = localStorage.getItem(PROMOTER_SCHOOLS_KEY);
    const baseList = !raw ? [...STATIC_SCHOOLS_ADDED] : JSON.parse(raw);
    const list = Array.isArray(baseList) ? baseList : [...STATIC_SCHOOLS_ADDED];
    // Normalize so UI can rely on these fields.
    return list.map((s) => ({
      ...s,
      email: s.email || '',
      contactPhone: s.contactPhone || s.phone || '',
      status: s.status === 'inactive' ? 'inactive' : 'active',
      branchCode: s.branchCode || '',
      studentsCount: s.studentsCount != null && s.studentsCount !== '' ? parseInt(s.studentsCount, 10) || 0 : 0,
    }));
  } catch {
    return [...STATIC_SCHOOLS_ADDED].map((s) => ({
      ...s,
      email: s.email || '',
      contactPhone: s.contactPhone || s.phone || '',
      status: s.status === 'inactive' ? 'inactive' : 'active',
      branchCode: s.branchCode || '',
      studentsCount: s.studentsCount != null && s.studentsCount !== '' ? parseInt(s.studentsCount, 10) || 0 : 0,
    }));
  }
};

const getPromotersAdded = () => {
  try {
    const raw = localStorage.getItem(PROMOTERS_KEY);
    const baseList = !raw ? [] : JSON.parse(raw);
    const list = Array.isArray(baseList) ? baseList : [];
    // Normalize so UI can rely on these fields.
    return list.map((p) => ({
      ...p,
      email: p.email || '',
      phone: p.phone || p.mobile || '',
      instagramProfileLink: p.instagramProfileLink || p.instagram || '',
      youtubeProfileLink: p.youtubeProfileLink || p.youtube || '',
      status: p.status === 'inactive' ? 'inactive' : 'active',
      promoCode: p.promoCode || '',
      referralCode: p.referralCode || '',
      address: p.address || '',
      city: p.city || '',
      state: p.state || '',
      pincode: p.pincode || '',
      addedAt: p.addedAt || '',
    }));
  } catch {
    return [];
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState(
    () => location.state?.defaultNav || 'dashboard'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schoolsAdded, setSchoolsAdded] = useState([]);
  const [schoolsListMeta, setSchoolsListMeta] = useState(null);
  const [schoolsListLoading, setSchoolsListLoading] = useState(false);
  const [schoolsListError, setSchoolsListError] = useState(null);
  const schoolsAddedCount = schoolsListMeta?.total ?? schoolsAdded.length;
  const SCHOOLS_PAGE_SIZE = 10;
  const [schoolsPage, setSchoolsPage] = useState(1);
  const schoolsTotalPages = Math.max(1, schoolsListMeta?.totalPages ?? 1);
  const listOffset =
    schoolsListMeta != null
      ? Math.max(0, (schoolsListMeta.page - 1) * schoolsListMeta.limit)
      : (schoolsPage - 1) * SCHOOLS_PAGE_SIZE;
  const pagedSchoolsAdded = schoolsAdded;

  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showEditSchool, setShowEditSchool] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [editSchoolForm, setEditSchoolForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactName: '',
    contactPhone: '',
    studentsCount: '',
    hasBranches: false,
    branchCode: '',
  });
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactName: '',
    contactPhone: '',
    studentsCount: '',
    hasBranches: false,
    branchCode: '',
  });

  useEffect(() => {
    let cancelled = false;
    const page = activeNav === 'schools' ? schoolsPage : 1;
    setSchoolsListLoading(true);
    setSchoolsListError(null);
    listSchools({ page, limit: SCHOOLS_PAGE_SIZE })
      .then((r) => {
        if (cancelled) return;
        setSchoolsListMeta({
          total: r.total,
          page: r.page,
          limit: r.limit,
          totalPages: r.totalPages,
        });
        if (activeNav === 'schools') {
          setSchoolsAdded(r.items);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setSchoolsListError(e?.message || 'Failed to load schools');
        if (activeNav === 'schools') {
          setSchoolsAdded(getSchoolsAdded());
        }
      })
      .finally(() => {
        if (!cancelled) setSchoolsListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeNav, schoolsPage]);

  useEffect(() => {
    // If navigation passes a default tab, switch to it on mount / state change.
    const nextNav = location.state?.defaultNav;
    if (nextNav) setActiveNav(nextNav);
  }, [location.state]);

  useEffect(() => {
    if (!schoolsListMeta?.totalPages) return;
    setSchoolsPage((p) => Math.min(p, Math.max(1, schoolsListMeta.totalPages)));
  }, [schoolsListMeta?.totalPages]);

  const [promotersAdded, setPromotersAdded] = useState(getPromotersAdded());
  const PROMOTERS_PAGE_SIZE = 10;
  const [promotersPage, setPromotersPage] = useState(1);
  const promotersTotalPages = Math.max(1, Math.ceil(promotersAdded.length / PROMOTERS_PAGE_SIZE));
  const promotersStartIndex = (promotersPage - 1) * PROMOTERS_PAGE_SIZE;
  const pagedPromotersAdded = promotersAdded.slice(
    promotersStartIndex,
    promotersStartIndex + PROMOTERS_PAGE_SIZE
  );

  const twoLineEllipsisStyle = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  useEffect(() => {
    setPromotersPage((p) => Math.min(p, Math.max(1, Math.ceil(promotersAdded.length / PROMOTERS_PAGE_SIZE))));
  }, [promotersAdded.length]);

  const [showAddPromoter, setShowAddPromoter] = useState(false);
  const [promoterForm, setPromoterForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    referralCode: '',
    promoCode: '',
    instagramProfileLink: '',
    youtubeProfileLink: '',
  });

  const persistPromotersAdded = (list) => {
    setPromotersAdded(list);
    localStorage.setItem(PROMOTERS_KEY, JSON.stringify(list));
  };

  const updatePromoterStatus = (id, nextStatus) => {
    const updated = promotersAdded.map((p) =>
      String(p.id) === String(id)
        ? {
            ...p,
            status: nextStatus === 'inactive' ? 'inactive' : 'active',
          }
        : p
    );
    persistPromotersAdded(updated);
  };

  const handleAddPromoter = () => {
    const name = promoterForm.name?.trim();
    if (!name) {
      alert('Please enter promoter name.');
      return;
    }
    const email = promoterForm.email?.trim();
    if (!email) {
      alert('Please enter promoter email.');
      return;
    }
    // Basic email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid promoter email.');
      return;
    }

    const phoneRaw = promoterForm.phone?.trim().replace(/\s/g, '');
    if (!phoneRaw) {
      alert('Please enter promoter phone.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phoneRaw)) {
      alert('Please enter a valid 10-digit phone (starting with 6-9).');
      return;
    }

    const pincode = promoterForm.pincode?.trim();
    if (pincode && !/^\d{6}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode (or leave blank).');
      return;
    }

    const newPromoter = {
      id: Date.now(),
      name,
      email,
      phone: phoneRaw,
      address: promoterForm.address?.trim() || '',
      city: promoterForm.city?.trim() || '',
      state: promoterForm.state?.trim() || '',
      pincode: pincode || '',
      referralCode: promoterForm.referralCode?.trim() || '',
      promoCode: promoterForm.promoCode?.trim() || '',
      instagramProfileLink: promoterForm.instagramProfileLink?.trim() || '',
      youtubeProfileLink: promoterForm.youtubeProfileLink?.trim() || '',
      status: 'active',
      addedAt: new Date().toISOString().slice(0, 10),
    };

    persistPromotersAdded([newPromoter, ...promotersAdded]);
    setShowAddPromoter(false);
    setPromoterForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      referralCode: '',
      promoCode: '',
      instagramProfileLink: '',
      youtubeProfileLink: '',
    });
  };

  const getPromoterTotalAddress = (p) =>
    [p.address, p.city, p.state, p.pincode].filter(Boolean).join(', ');

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const persistSchoolsAdded = (list) => {
    setSchoolsAdded(list);
    localStorage.setItem(PROMOTER_SCHOOLS_KEY, JSON.stringify(list));
  };

  const handleAddSchool = async () => {
    const name = schoolForm.name?.trim();
    if (!name) {
      alert('Please enter school name.');
      return;
    }

    const studentsCountRaw = schoolForm.studentsCount?.toString().trim();
    let studentsCountValue = 0;
    if (studentsCountRaw) {
      const parsed = parseInt(studentsCountRaw, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        alert('Number of students must be a valid number (0 or greater).');
        return;
      }
      studentsCountValue = parsed;
    }

    const address = schoolForm.address?.trim();
    if (!address) {
      alert('Please enter school address.');
      return;
    }

    const city = schoolForm.city?.trim();
    if (!city) {
      alert('Please enter city.');
      return;
    }

    const state = schoolForm.state?.trim();
    if (!state) {
      alert('Please enter state.');
      return;
    }

    const pincode = schoolForm.pincode?.trim();
    if (!pincode) {
      alert('Please enter pincode.');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode.');
      return;
    }

    const contactName = schoolForm.contactName?.trim();
    if (!contactName) {
      alert('Please enter contact person name.');
      return;
    }

    if (schoolForm.hasBranches && !schoolForm.branchCode?.trim()) {
      alert('Branch code is required when the school has branches.');
      return;
    }

    const contactPhone = schoolForm.contactPhone?.trim().replace(/\s/g, '');
    if (!contactPhone) {
      alert('Please enter contact mobile number.');
       return;
    }
    if (!/^[6-9]\d{9}$/.test(contactPhone)) {
      alert('Please enter a valid 10-digit mobile number starting with 6-9.');
      return;
    }

    const requestPayload = {
      name,
      email: schoolForm.email?.trim() || '',
      branchCode: schoolForm.hasBranches ? (schoolForm.branchCode?.trim() || '') : '',
      address,
      city,
      state,
      pincode: pincode || '',
      contactName,
      contactPhone: contactPhone || '',
      status: 'active',
    };

    const newSchool = {
      id: Date.now(),
      ...requestPayload,
      addedAt: new Date().toISOString().slice(0, 10),
      studentsCount: studentsCountValue,
      // Admin-created schools are not associated with a promoter discount.
      addedByPromoterId: null,
    };

    let createOk = false;
    try {
      const created = await createSchool(requestPayload, { userId: 1, userRole: 'admin' });
      if (created && typeof created === 'object') {
        Object.assign(newSchool, created);
      }
      createOk = true;
    } catch (error) {
      console.warn('Create school API failed, keeping local data fallback.', error);
    }

    if (createOk) {
      try {
        setSchoolsPage(1);
        const refreshed = await listSchools({ page: 1, limit: SCHOOLS_PAGE_SIZE });
        setSchoolsListMeta({
          total: refreshed.total,
          page: refreshed.page,
          limit: refreshed.limit,
          totalPages: refreshed.totalPages,
        });
        if (activeNav === 'schools') {
          setSchoolsAdded(refreshed.items);
        }
      } catch (e) {
        persistSchoolsAdded([newSchool, ...schoolsAdded]);
      }
    } else {
      persistSchoolsAdded([newSchool, ...schoolsAdded]);
    }

    setShowAddSchool(false);
    setSchoolForm({
      name: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contactName: '',
      contactPhone: '',
      studentsCount: '',
      hasBranches: false,
      branchCode: '',
    });
  };

  const handleDeleteSchool = (id) => {
    const ok = window.confirm('Delete this school?');
    if (!ok) return;
    const updated = schoolsAdded.filter((s) => String(s.id) !== String(id));
    persistSchoolsAdded(updated);
  };

  const openEditSchool = (school) => {
    setEditingSchoolId(school.id);
    setEditSchoolForm({
      name: school.name || '',
      email: school.email || '',
      address: school.address || '',
      city: school.city || '',
      state: school.state || '',
      pincode: school.pincode || '',
      contactName: school.contactName || '',
      contactPhone: school.contactPhone || '',
      studentsCount: Number.isFinite(school.studentsCount) ? String(school.studentsCount) : '',
      hasBranches: Boolean(school.branchCode),
      branchCode: school.branchCode || '',
    });
    setShowEditSchool(true);
  };

  const handleUpdateSchool = () => {
    if (editingSchoolId === null) return;

    const name = editSchoolForm.name?.trim();
    if (!name) {
      alert('Please enter school name.');
      return;
    }

    const studentsCountRaw = editSchoolForm.studentsCount?.toString().trim();
    let studentsCountValue = 0;
    if (studentsCountRaw) {
      const parsed = parseInt(studentsCountRaw, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        alert('Number of students must be a valid number (0 or greater).');
        return;
      }
      studentsCountValue = parsed;
    }

    const address = editSchoolForm.address?.trim();
    if (!address) {
      alert('Please enter school address.');
      return;
    }

    const city = editSchoolForm.city?.trim();
    if (!city) {
      alert('Please enter city.');
      return;
    }

    const state = editSchoolForm.state?.trim();
    if (!state) {
      alert('Please enter state.');
      return;
    }

    const pincode = editSchoolForm.pincode?.trim();
    if (!pincode) {
      alert('Please enter pincode.');
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode.');
      return;
    }

    const contactName = editSchoolForm.contactName?.trim();
    if (!contactName) {
      alert('Please enter contact person name.');
      return;
    }

    if (editSchoolForm.hasBranches && !editSchoolForm.branchCode?.trim()) {
      alert('Branch code is required when the school has branches.');
      return;
    }

    const contactPhone = editSchoolForm.contactPhone?.trim().replace(/\s/g, '');
    if (!contactPhone) {
      alert('Please enter contact mobile number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(contactPhone)) {
      alert('Please enter a valid 10-digit mobile number starting with 6-9.');
      return;
    }

    const updated = schoolsAdded.map((s) =>
      String(s.id) === String(editingSchoolId)
        ? {
            ...s,
            name,
            email: editSchoolForm.email?.trim() || '',
            branchCode: editSchoolForm.hasBranches
              ? editSchoolForm.branchCode?.trim() || ''
              : '',
            address,
            city,
            state,
            pincode: pincode || '',
            contactName,
            contactPhone,
            studentsCount: studentsCountValue,
          }
        : s
    );

    persistSchoolsAdded(updated);
    setShowEditSchool(false);
    setEditingSchoolId(null);
  };

  const updateSchoolStatus = (id, nextStatus) => {
    const updated = schoolsAdded.map((s) =>
      String(s.id) === String(id)
        ? {
            ...s,
            status: nextStatus === 'inactive' ? 'inactive' : 'active',
          }
        : s
    );
    persistSchoolsAdded(updated);
  };

  const getTotalAddress = (s) =>
    [s.address, s.city, s.state, s.pincode].filter(Boolean).join(', ');

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 shadow-sm flex-col">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="p-5 border-b border-gray-100 flex flex-col items-center w-full cursor-pointer bg-white hover:bg-gray-50"
          aria-label="Go to Home"
        >
          <img
            src="/alpha-vlogs-logo.png"
            alt="Alpha Vlogs logo"
            className="w-16 h-16 object-contain mb-2"
          />
          <span className="text-xl font-bold text-blue-700">Alpha Vlogs</span>
        </button>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveNav(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeNav === item.path
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 shadow-sm flex flex-col transform transition-transform duration-200 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="p-5 border-b border-gray-100 flex flex-col items-center w-full cursor-pointer bg-white hover:bg-gray-50"
          aria-label="Go to Home"
        >
          <img
            src="/alpha-vlogs-logo.png"
            alt="Alpha Vlogs logo"
            className="w-16 h-16 object-contain mb-2"
          />
          <span className="text-xl font-bold text-blue-700">Alpha Vlogs</span>
        </button>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setActiveNav(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                activeNav === item.path
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => {
              setSidebarOpen(false);
              handleLogout();
            }}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main - static data for now; TODO: replace with API */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
        <div className="md:hidden flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg border border-gray-200 bg-white"
            aria-label="Open navigation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>
          <div className="text-lg font-bold text-gray-800">
            {activeNav === 'dashboard' && 'ADMIN'}
            {activeNav === 'students' && 'Students'}
            {activeNav === 'events' && 'Events'}
            {activeNav === 'quiz' && 'Quiz'}
            {activeNav === 'promotors' && 'Promoters'}
            {activeNav === 'schools' && 'Schools'}
          </div>
          <div />
        </div>

        <h1 className="hidden md:block text-2xl font-bold text-gray-800 mb-6">
          {activeNav === 'dashboard' && 'ADMIN DASHBOARD'}
          {activeNav === 'students' && 'Students'}
          {activeNav === 'events' && 'Events'}
          {activeNav === 'quiz' && 'QUIZ'}
          {activeNav === 'promotors' && 'Promotors'}
          {activeNav === 'schools' && 'Schools'}
        </h1>

        {activeNav === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <p className="text-3xl font-bold text-blue-600">{STATIC_TOTAL_STUDENTS}</p>
                <p className="text-gray-600 mt-1">Total Students</p>
              </div>
              <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <p className="text-3xl font-bold text-blue-600">{schoolsAddedCount}</p>
                <p className="text-gray-600 mt-1">Schools Added</p>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Uploads</h2>
              <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
                {STATIC_RECENT_UPLOADS.map((name, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <span className="text-gray-700">{name}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quiz Attempts</h2>
              <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
                {STATIC_QUIZ_ATTEMPTS.map((name, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <span className="text-gray-700">{name}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeNav === 'students' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {STATIC_STUDENTS_LIST.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <span className="text-gray-800 font-medium">{s.name}</span>
                  <span className="text-gray-500 text-sm ml-2">{s.email}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeNav === 'events' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 text-gray-500">
            No events created yet.
          </div>
        )}

        {activeNav === 'quiz' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 text-gray-500">
            No quiz records yet.
          </div>
        )}

        {activeNav === 'promotors' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Promoters</h2>
                <p className="text-sm text-gray-500">Add a promoter (admin) and it will appear below.</p>
              </div>
              <button
                onClick={() => setShowAddPromoter(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Add Promoter
              </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">S No</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Name</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Mobile number</th>
                      <th className="px-5 py-3 text-left font-semibold max-w-[180px] whitespace-normal">Email</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Promocode</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotersAdded.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-gray-500">
                          No promoters added yet.
                        </td>
                      </tr>
                    ) : (
                      pagedPromotersAdded.map((p, idx) => {
                        const isActive = (p.status || 'active') === 'active';
                        return (
                          <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-5 py-4 whitespace-nowrap">{promotersStartIndex + idx + 1}</td>
                            <td className="px-5 py-4">
                              <span style={twoLineEllipsisStyle} className="font-semibold text-gray-800">
                                {p.name || '-'}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                              {p.phone ? (
                                <span style={twoLineEllipsisStyle}>{p.phone}</span>
                              ) : (
                                <span style={twoLineEllipsisStyle} className="text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-gray-700 max-w-[180px] whitespace-normal">
                              {p.email ? (
                                <span style={twoLineEllipsisStyle}>{p.email}</span>
                              ) : (
                                <span style={twoLineEllipsisStyle} className="text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                              {p.promoCode ? (
                                <span style={twoLineEllipsisStyle}>{p.promoCode}</span>
                              ) : (
                                <span style={twoLineEllipsisStyle} className="text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={isActive}
                                  aria-label={`Set promoter ${p.name || ''} status to ${isActive ? 'inactive' : 'active'}`}
                                  onChange={(e) =>
                                    updatePromoterStatus(p.id, e.target.checked ? 'active' : 'inactive')
                                  }
                                />
                              </label>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {promotersAdded.length > PROMOTERS_PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPromotersPage((p) => Math.max(1, p - 1))}
                  disabled={promotersPage <= 1}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <div className="text-sm text-gray-600">
                  Page {promotersPage} of {promotersTotalPages}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPromotersPage((p) => Math.min(promotersTotalPages, p + 1))
                  }
                  disabled={promotersPage >= promotersTotalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {showAddPromoter && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Promoter (Admin)</h3>

                  <div className="space-y-3">
                    <input
                      value={promoterForm.name}
                      onChange={(e) => setPromoterForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Promoter name *"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                      value={promoterForm.email}
                      onChange={(e) => setPromoterForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email *"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                      value={promoterForm.phone}
                      onChange={(e) => setPromoterForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone (10 digits, 6-9 start) *"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      maxLength={10}
                    />
                    <textarea
                      value={promoterForm.address}
                      onChange={(e) => setPromoterForm((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Address"
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    />

                    <input
                      value={promoterForm.instagramProfileLink}
                      onChange={(e) =>
                        setPromoterForm((prev) => ({
                          ...prev,
                          instagramProfileLink: e.target.value,
                        }))
                      }
                      placeholder="Instagram profile link (optional)"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />

                    <input
                      value={promoterForm.youtubeProfileLink}
                      onChange={(e) =>
                        setPromoterForm((prev) => ({
                          ...prev,
                          youtubeProfileLink: e.target.value,
                        }))
                      }
                      placeholder="YouTube profile link (optional)"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={promoterForm.city}
                        onChange={(e) => setPromoterForm((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={promoterForm.state}
                        onChange={(e) => setPromoterForm((prev) => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <input
                      value={promoterForm.pincode}
                      onChange={(e) => setPromoterForm((prev) => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Pincode (6 digits)"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      maxLength={6}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={promoterForm.promoCode}
                        onChange={(e) => setPromoterForm((prev) => ({ ...prev, promoCode: e.target.value }))}
                        placeholder="Promo code (optional)"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={promoterForm.referralCode}
                        onChange={(e) => setPromoterForm((prev) => ({ ...prev, referralCode: e.target.value }))}
                        placeholder="Referral code (optional)"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowAddPromoter(false);
                        setPromoterForm({
                          name: '',
                          email: '',
                          phone: '',
                          address: '',
                          city: '',
                          state: '',
                          pincode: '',
                          referralCode: '',
                          promoCode: '',
                          instagramProfileLink: '',
                          youtubeProfileLink: '',
                        });
                      }}
                      className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button onClick={handleAddPromoter} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Add Promoter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeNav === 'schools' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Schools</h2>
                <p className="text-sm text-gray-500">Add a school (admin) and it will appear below.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddSchool(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Add School
                </button>
              </div>
            </div>

            {schoolsListError && schoolsAdded.length > 0 && (
              <p className="text-sm text-red-600" role="alert">
                {schoolsListError}
              </p>
            )}

            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">S No</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">School Name</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">branchCode</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Mobile Number</th>
                      <th className="px-5 py-3 text-left font-semibold max-w-[180px] whitespace-normal">Email</th>
                      <th className="px-5 py-3 text-left font-semibold">Address</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Total students</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Active</th>
                      <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schoolsListLoading && schoolsAdded.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-8 text-gray-500">
                          Loading schools…
                        </td>
                      </tr>
                    ) : schoolsListError && schoolsAdded.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-8 text-red-600">
                          {schoolsListError}
                        </td>
                      </tr>
                    ) : schoolsAdded.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-8 text-gray-500">
                          No schools added yet.
                        </td>
                      </tr>
                    ) : (
                      pagedSchoolsAdded.map((s, idx) => {
                        const isActive = (s.status || 'active') === 'active';
                        return (
                          <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-5 py-4 whitespace-nowrap">{listOffset + idx + 1}</td>
                            <td className="px-5 py-4">
                              <span style={twoLineEllipsisStyle} className="font-semibold text-gray-800">
                                {s.name}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                              {s.branchCode ? (
                                <span style={twoLineEllipsisStyle} className="font-medium">
                                  {s.branchCode}
                                </span>
                              ) : (
                                <span style={twoLineEllipsisStyle} className="text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                              {s.contactPhone ? (
                                <span style={twoLineEllipsisStyle}>{s.contactPhone}</span>
                              ) : (
                                <span style={twoLineEllipsisStyle} className="text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-gray-700 max-w-[180px] whitespace-normal">
                              {s.email ? (
                                <span style={twoLineEllipsisStyle}>{s.email}</span>
                              ) : (
                                <span style={twoLineEllipsisStyle} className="text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-gray-600">
                              {getTotalAddress(s) ? (
                                <span style={twoLineEllipsisStyle} className="whitespace-normal break-words">
                                  {getTotalAddress(s)}
                                </span>
                              ) : (
                                <span style={twoLineEllipsisStyle} className="text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                              <span style={twoLineEllipsisStyle}>
                                {Number.isFinite(s.studentsCount) ? s.studentsCount : 0}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={isActive}
                                  aria-label={`Set school ${s.name} status to ${isActive ? 'inactive' : 'active'}`}
                                  onChange={(e) => updateSchoolStatus(s.id, e.target.checked ? 'active' : 'inactive')}
                                />
                              </label>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => openEditSchool(s)}
                                  aria-label={`Edit school ${s.name || ''}`}
                                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-4 h-4 text-blue-700"
                                  >
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSchool(s.id)}
                                  aria-label={`Delete school ${s.name || ''}`}
                                  className="p-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-4 h-4 text-red-700"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="M19 6l-1 14H6L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {(schoolsListMeta?.totalPages ?? 1) > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSchoolsPage((p) => Math.max(1, p - 1))}
                  disabled={schoolsPage <= 1}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <div className="text-sm text-gray-600">
                  Page {schoolsPage} of {schoolsTotalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setSchoolsPage((p) => Math.min(schoolsTotalPages, p + 1))}
                  disabled={schoolsPage >= schoolsTotalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {showAddSchool && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Add School (Admin)</h3>

                  <div className="space-y-3">
                    <input
                      value={schoolForm.name}
                      onChange={(e) => setSchoolForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="School name *"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      value={schoolForm.email}
                      onChange={(e) => setSchoolForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email (optional)"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                    <textarea
                      value={schoolForm.address}
                      onChange={(e) => setSchoolForm((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Address"
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={schoolForm.city}
                        onChange={(e) => setSchoolForm((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                      <input
                        value={schoolForm.state}
                        onChange={(e) => setSchoolForm((prev) => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={schoolForm.pincode}
                        onChange={(e) => setSchoolForm((prev) => ({ ...prev, pincode: e.target.value }))}
                        placeholder="Pincode (6 digits)"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        maxLength={6}
                        required
                        inputMode="numeric"
                      />
                      <input
                        value={schoolForm.contactName}
                        onChange={(e) => setSchoolForm((prev) => ({ ...prev, contactName: e.target.value }))}
                        placeholder="Contact person name"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <input
                      value={schoolForm.contactPhone}
                      onChange={(e) => setSchoolForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="Contact mobile (mandatory) *"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      type="tel"
                      required
                      maxLength={10}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Does the school have branches?</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="hasBranches"
                            checked={schoolForm.hasBranches === true}
                            onChange={() => setSchoolForm((prev) => ({ ...prev, hasBranches: true }))}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="hasBranches"
                            checked={schoolForm.hasBranches === false}
                            onChange={() => setSchoolForm((prev) => ({ ...prev, hasBranches: false }))}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    {schoolForm.hasBranches && (
                      <input
                        value={schoolForm.branchCode}
                        onChange={(e) => setSchoolForm((prev) => ({ ...prev, branchCode: e.target.value }))}
                        placeholder="Branch code *"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    )}
                  </div>

                  <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowAddSchool(false);
                        setSchoolForm({
                          name: '',
                          email: '',
                          address: '',
                          city: '',
                          state: '',
                          pincode: '',
                          contactName: '',
                          contactPhone: '',
                          studentsCount: '',
                          hasBranches: false,
                          branchCode: '',
                        });
                      }}
                      className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button onClick={handleAddSchool} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Add School
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showEditSchool && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit School</h3>

                  <div className="space-y-3">
                    <input
                      value={editSchoolForm.name}
                      onChange={(e) => setEditSchoolForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="School name *"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />

                    <input
                      value={editSchoolForm.email}
                      onChange={(e) => setEditSchoolForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email (optional)"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />

                    <textarea
                      value={editSchoolForm.address}
                      onChange={(e) => setEditSchoolForm((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Address"
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={editSchoolForm.city}
                        onChange={(e) => setEditSchoolForm((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                      <input
                        value={editSchoolForm.state}
                        onChange={(e) => setEditSchoolForm((prev) => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={editSchoolForm.pincode}
                        onChange={(e) => setEditSchoolForm((prev) => ({ ...prev, pincode: e.target.value }))}
                        placeholder="Pincode (6 digits)"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        maxLength={6}
                        required
                        inputMode="numeric"
                      />
                      <input
                        value={editSchoolForm.contactName}
                        onChange={(e) =>
                          setEditSchoolForm((prev) => ({ ...prev, contactName: e.target.value }))
                        }
                        placeholder="Contact person name"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <input
                      value={editSchoolForm.contactPhone}
                      onChange={(e) =>
                        setEditSchoolForm((prev) => ({ ...prev, contactPhone: e.target.value }))
                      }
                      placeholder="Contact mobile (mandatory) *"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      type="tel"
                      required
                      maxLength={10}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Does the school have branches?
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="hasBranches"
                            checked={editSchoolForm.hasBranches === true}
                            onChange={() => setEditSchoolForm((prev) => ({ ...prev, hasBranches: true }))}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="hasBranches"
                            checked={editSchoolForm.hasBranches === false}
                            onChange={() =>
                              setEditSchoolForm((prev) => ({ ...prev, hasBranches: false }))
                            }
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>No</span>
                        </label>
                      </div>
                    </div>

                    {editSchoolForm.hasBranches && (
                      <input
                        value={editSchoolForm.branchCode}
                        onChange={(e) =>
                          setEditSchoolForm((prev) => ({ ...prev, branchCode: e.target.value }))
                        }
                        placeholder="Branch code *"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    )}
                  </div>

                  <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowEditSchool(false);
                        setEditingSchoolId(null);
                        setEditSchoolForm({
                          name: '',
                          email: '',
                          address: '',
                          city: '',
                          state: '',
                          pincode: '',
                          contactName: '',
                          contactPhone: '',
                          studentsCount: '',
                          hasBranches: false,
                          branchCode: '',
                        });
                      }}
                      className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateSchool}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
