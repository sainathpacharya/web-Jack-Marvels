import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List } from 'react-window';
import AppHeader from '../components/AppHeader';
import {
  STATIC_SCHOOLS,
  STATIC_PROMOTERS,
  STATIC_WEEKLY_QUIZ_TITLES,
} from '../data/staticData';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutThunk } from '../store/slices/authSlice';
import { selectRoleId } from '../store/selectors/authSelectors';
import { useSchoolsQuery } from '../features/schools/hooks/useSchoolsQuery';
import { selectAllPromoters } from '../store/selectors/promoterSelectors';
import { addPromoterLocal } from '../store/slices/promoterSlice';
import {
  addPromoCodeLocal,
  addSponsorLocal,
  addVideoByteLocal,
} from '../store/slices/superAdminSlice';
import { selectPromoCodes, selectSponsors, selectVideoBytes } from '../store/selectors/superAdminSelectors';
import { validateSuperAdminPromoterForm } from '../lib/validation';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: 'dashboard' },
  { label: 'Schools', path: 'schools' },
  { label: 'Promoters', path: 'promoters' },
  { label: 'Sponsors', path: 'sponsors' },
  { label: 'Video Bytes', path: 'video-bytes' },
  { label: 'Promo Codes', path: 'promo-codes' },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userRoleId = useAppSelector(selectRoleId);

  useEffect(() => {
    // RoleId 4 == Student: no access to the web application.
    if (userRoleId === 4) {
      dispatch(logoutThunk());
      navigate('/');
    }
  }, [dispatch, userRoleId, navigate]);

  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const schoolsQuery = { scope: 'superadmin', page: 1, limit: 500 };
  const schoolsFromApi = useSchoolsQuery({ ...schoolsQuery, fallbackToStatic: true });
  const schoolsFromStore = schoolsFromApi.data?.items || [];
  const schools = schoolsFromStore.length ? schoolsFromStore : [...STATIC_SCHOOLS];
  const promotersFromStore = useAppSelector(selectAllPromoters);
  const promoters = promotersFromStore.length ? promotersFromStore : [...STATIC_PROMOTERS];
  const sponsors = useAppSelector(selectSponsors);
  const videoBytes = useAppSelector(selectVideoBytes);
  const promoCodes = useAppSelector(selectPromoCodes);

  const SCHOOLS_PAGE_SIZE = 10;
  const [schoolsPage, setSchoolsPage] = useState(1);
  const schoolsTotalPages = Math.max(1, Math.ceil(schools.length / SCHOOLS_PAGE_SIZE));
  const schoolsStartIndex = (schoolsPage - 1) * SCHOOLS_PAGE_SIZE;
  const pagedSchools = schools.slice(schoolsStartIndex, schoolsStartIndex + SCHOOLS_PAGE_SIZE);
  const useVirtualizedSchools = schools.length > 50;

  const PROMOTERS_PAGE_SIZE = 10;
  const [promotersPage, setPromotersPage] = useState(1);
  const promotersTotalPages = Math.max(1, Math.ceil(promoters.length / PROMOTERS_PAGE_SIZE));
  const promotersStartIndex = (promotersPage - 1) * PROMOTERS_PAGE_SIZE;
  const pagedPromoters = promoters.slice(
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
    setSchoolsPage((p) => Math.min(p, Math.max(1, Math.ceil(schools.length / SCHOOLS_PAGE_SIZE))));
  }, [schools.length]);

  useEffect(() => {
    setPromotersPage((p) =>
      Math.min(p, Math.max(1, Math.ceil(promoters.length / PROMOTERS_PAGE_SIZE)))
    );
  }, [promoters.length]);

  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showAddPromoter, setShowAddPromoter] = useState(false);
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [showAddVideoByte, setShowAddVideoByte] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [promoterFormErrors, setPromoterFormErrors] = useState({});
  const [promoterForm, setPromoterForm] = useState({
    name: '',
    email: '',
    mobile: '',
    photo: null,
    instagramProfileLink: '',
    youtubeProfileLink: '',
    referralCode: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
    promoCode: '',
    discountPercent: '',
  });
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newVideoByteTitle, setNewVideoByteTitle] = useState('');
  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/');
  };

  const handleAddSchool = () => {
    if (newSchoolName.trim()) {
      alert('School creation is managed in Admin/Promoter workflows.');
      setNewSchoolName('');
      setShowAddSchool(false);
    }
  };
  const handlePromoterFormChange = (field, value) => {
    setPromoterForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePromoterPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPromoterForm((prev) => ({ ...prev, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const resetPromoterForm = () => {
    setPromoterFormErrors({});
    setPromoterForm({
      name: '',
      email: '',
      mobile: '',
      photo: null,
      instagramProfileLink: '',
      youtubeProfileLink: '',
      referralCode: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      notes: '',
      promoCode: '',
      discountPercent: '',
    });
  };

  const handleAddPromoter = () => {
    const fieldErrors = validateSuperAdminPromoterForm(promoterForm);
    if (Object.keys(fieldErrors).length > 0) {
      setPromoterFormErrors(fieldErrors);
      return;
    }
    setPromoterFormErrors({});
    const { name, email, mobile, address } = promoterForm;
    const discountVal = promoterForm.discountPercent?.trim();
    const discountNum = parseInt(discountVal, 10);
    const promoterId = Date.now();
    const promoter = {
      id: promoterId,
      ...promoterForm,
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim().replace(/\s/g, ''),
      address: address.trim(),
      city: promoterForm.city?.trim() || '',
      state: promoterForm.state?.trim() || '',
      pincode: promoterForm.pincode?.trim() || '',
      referralCode: promoterForm.referralCode?.trim() || '',
      notes: promoterForm.notes?.trim() || '',
    };
    dispatch(addPromoterLocal(promoter));
    // Create promo code for this promoter — discount applies to schools added by this promoter
    const codeRaw = promoterForm.promoCode?.trim();
    const promoCode = codeRaw || `PROMO_${String(promoterId).slice(-6)}`;
    dispatch(addPromoCodeLocal({ code: promoCode, discount: `${discountNum}%`, promoterId, promoterName: promoter.name }));
    // Persist so admin payment can apply promoter discount for schools added by this promoter
    try {
      const stored = JSON.parse(localStorage.getItem('promoterPromoCodes') || '{}');
      stored[promoterId] = { code: promoCode, discount: `${discountNum}%` };
      localStorage.setItem('promoterPromoCodes', JSON.stringify(stored));
    } catch (_) {}
    resetPromoterForm();
    setShowAddPromoter(false);
  };
  const handleAddSponsor = () => {
    if (newSponsorName.trim()) {
      dispatch(addSponsorLocal({ id: Date.now(), name: newSponsorName.trim() }));
      setNewSponsorName('');
      setShowAddSponsor(false);
    }
  };
  const handleAddVideoByte = () => {
    if (newVideoByteTitle.trim()) {
      dispatch(addVideoByteLocal({ id: Date.now(), title: newVideoByteTitle.trim() }));
      setNewVideoByteTitle('');
      setShowAddVideoByte(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col">
      <AppHeader onLogout={handleLogout} />
      <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 shadow-sm flex-col">
        <div className="p-5 border-b border-gray-100">
          <span className="text-2xl font-bold text-indigo-700">Aluer.</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveNav(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeNav === item.path
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100" />
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
        <div className="p-5 border-b border-gray-100">
          <span className="text-2xl font-bold text-indigo-700">Aluer.</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setActiveNav(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeNav === item.path
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          {/* Logout is handled from the top header for consistent UX */}
        </div>
      </aside>

      {/* Main */}
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
            {activeNav === 'dashboard' && 'SUPER ADMIN'}
            {activeNav === 'schools' && 'SCHOOLS'}
            {activeNav === 'promoters' && 'PROMOTERS'}
            {activeNav === 'sponsors' && 'SPONSORS'}
            {activeNav === 'video-bytes' && 'VIDEO BYTES'}
            {activeNav === 'promo-codes' && 'PROMO CODES'}
          </div>
          <div />
        </div>

        <h1 className="hidden md:block text-2xl font-bold text-gray-800 mb-6">
          {activeNav === 'dashboard' && 'SUPER ADMIN DASHBOARD'}
          {activeNav === 'schools' && 'Schools'}
          {activeNav === 'promoters' && 'Promoters'}
          {activeNav === 'sponsors' && 'Sponsors'}
          {activeNav === 'video-bytes' && 'Video Bytes'}
          {activeNav === 'promo-codes' && 'Promo Codes'}
        </h1>

        {activeNav === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <p className="text-3xl font-bold text-indigo-600">{schools.length}</p>
                <p className="text-gray-600 mt-1">Schools</p>
              </div>
              <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <p className="text-3xl font-bold text-indigo-600">{promoters.length}</p>
                <p className="text-gray-600 mt-1">Promoters</p>
              </div>
              <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
                <p className="text-3xl font-bold text-indigo-600">{sponsors.length}</p>
                <p className="text-gray-600 mt-1">Sponsors</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mb-8">
              <button onClick={() => setShowAddSchool(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Add School</button>
              <button onClick={() => setShowAddPromoter(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Add Promoter</button>
              <button onClick={() => setShowAddSponsor(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Add Sponsor</button>
              <button onClick={() => setShowAddVideoByte(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Add Video Byte</button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Quiz</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STATIC_WEEKLY_QUIZ_TITLES.map((title, i) => (
                  <div key={i} className="bg-white rounded-xl shadow p-4 border border-gray-100 text-center text-sm font-medium text-gray-700">{title}</div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeNav === 'schools' && (
          <>
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {useVirtualizedSchools ? (
                <>
                  <div className="grid grid-cols-2 bg-gray-50 text-gray-700 text-sm font-semibold">
                    <div className="px-5 py-3">S No</div>
                    <div className="px-5 py-3">School Name</div>
                  </div>
                  <List
                    className="w-full"
                    rowComponent={({ index, style, schools: rowSchools, startIndex }) => {
                      const s = rowSchools[index];
                      if (!s) return null;
                      return (
                        <div style={style} className="grid grid-cols-2 border-b border-gray-100 hover:bg-gray-50 text-sm">
                          <div className="px-5 py-4 whitespace-nowrap">{startIndex + index + 1}</div>
                          <div className="px-5 py-4">
                            <span style={twoLineEllipsisStyle} className="font-medium text-gray-800">
                              {s.name}
                            </span>
                          </div>
                        </div>
                      );
                    }}
                    rowCount={pagedSchools.length}
                    rowHeight={56}
                    rowProps={{ schools: pagedSchools, startIndex: schoolsStartIndex }}
                    style={{ height: 420 }}
                  >
                    {null}
                  </List>
                </>
              ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">S No</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">School Name</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-5 py-8 text-gray-500">
                        No schools added yet.
                      </td>
                    </tr>
                  ) : (
                    pagedSchools.map((s, idx) => (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-4 whitespace-nowrap">{schoolsStartIndex + idx + 1}</td>
                        <td className="px-5 py-4">
                          <span style={twoLineEllipsisStyle} className="font-medium text-gray-800">
                            {s.name}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              )}
            </div>
          </div>

          {schools.length > SCHOOLS_PAGE_SIZE && (
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
          </>
        )}
        {activeNav === 'promoters' && (
          <>
            <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {promoters.length === 0 ? (
              <p className="px-5 py-8 text-gray-500">No promoters yet. Use &quot;Add Promoter&quot; on Dashboard.</p>
            ) : (
              pagedPromoters.map((p) => {
                const linkedPromo = promoCodes.find((c) => c.promoterId === p.id);
                return (
                  <div key={p.id} className="px-5 py-4 hover:bg-gray-50 flex items-start gap-4">
                    {p.photo && (
                      <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p style={twoLineEllipsisStyle} className="font-medium text-gray-800">
                        {p.name}
                      </p>
                      <p style={twoLineEllipsisStyle} className="text-sm text-gray-600">
                        {p.email}
                      </p>
                      {p.mobile && (
                        <p style={twoLineEllipsisStyle} className="text-sm text-gray-600">
                          Mobile: {p.mobile}
                        </p>
                      )}
                      {p.address && (
                        <p
                          style={twoLineEllipsisStyle}
                          className="text-sm text-gray-500"
                          title={p.address}
                        >
                          {p.address}
                        </p>
                      )}
                      {p.referralCode && <p className="text-xs text-gray-500 mt-1">Referral: {p.referralCode}</p>}
                      {linkedPromo && (
                        <p className="text-xs text-indigo-600 mt-1 font-medium">
                          Promo: {linkedPromo.code} — {linkedPromo.discount} for schools they add
                        </p>
                      )}
                    </div>
                    <span className="text-gray-400 flex-shrink-0">→</span>
                  </div>
                );
              })
            )}
            </div>

            {promoters.length > PROMOTERS_PAGE_SIZE && (
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
                  onClick={() => setPromotersPage((p) => Math.min(promotersTotalPages, p + 1))}
                  disabled={promotersPage >= promotersTotalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
        {activeNav === 'sponsors' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {sponsors.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <span className="text-gray-700">{s.name}</span>
                <span className="text-gray-400">→</span>
              </div>
            ))}
          </div>
        )}
        {activeNav === 'video-bytes' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {videoBytes.length === 0 ? (
              <p className="px-5 py-8 text-gray-500">No video bytes yet. Use &quot;Add Video Byte&quot; on Dashboard.</p>
            ) : (
              videoBytes.map((v) => (
                <div key={v.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <span className="text-gray-700">{v.title}</span>
                  <span className="text-gray-400">→</span>
                </div>
              ))
            )}
          </div>
        )}
        {activeNav === 'promo-codes' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {promoCodes.map((c, i) => (
              <div key={c.promoterId ? c.promoterId : i} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 hover:bg-gray-50">
                <span className="text-gray-800 font-mono font-medium">{c.code}</span>
                <span className="text-indigo-600 font-medium">{c.discount}</span>
                {c.promoterName ? (
                  <span className="text-sm text-gray-600 w-full sm:w-auto">Promoter: {c.promoterName} — discount for schools they add</span>
                ) : (
                  <span className="text-sm text-gray-400">General promo</span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add School</h3>
            <input
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              placeholder="School name"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddSchool(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleAddSchool} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}
      {showAddPromoter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Promoter</h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <input
                value={promoterForm.name}
                onChange={(e) => {
                  handlePromoterFormChange('name', e.target.value);
                  setPromoterFormErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="Full name *"
                className={`w-full p-3 border rounded-lg ${promoterFormErrors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {promoterFormErrors.name ? (
                <p className="text-xs text-red-600 -mt-2 mb-1">{promoterFormErrors.name}</p>
              ) : null}
              <input
                value={promoterForm.email}
                onChange={(e) => {
                  handlePromoterFormChange('email', e.target.value);
                  setPromoterFormErrors((p) => ({ ...p, email: undefined }));
                }}
                placeholder="Email ID *"
                type="email"
                className={`w-full p-3 border rounded-lg ${promoterFormErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {promoterFormErrors.email ? (
                <p className="text-xs text-red-600 -mt-2 mb-1">{promoterFormErrors.email}</p>
              ) : null}
              <input
                value={promoterForm.mobile}
                onChange={(e) =>
                  handlePromoterFormChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                placeholder="Mobile number * (10 digits)"
                type="tel"
                maxLength={10}
                inputMode="numeric"
                className={`w-full p-3 border rounded-lg ${promoterFormErrors.mobile ? 'border-red-500' : 'border-gray-300'}`}
              />
              {promoterFormErrors.mobile ? (
                <p className="text-xs text-red-600 -mt-2 mb-1">{promoterFormErrors.mobile}</p>
              ) : null}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePromoterPhotoChange}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700"
                />
                {promoterForm.photo && (
                  <img src={promoterForm.photo} alt="Preview" className="mt-2 h-16 w-16 object-cover rounded border" />
                )}
              </div>
              <input
                value={promoterForm.referralCode}
                onChange={(e) =>
                  handlePromoterFormChange('referralCode', e.target.value.replace(/[^a-zA-Z0-9]/g, ''))
                }
                placeholder="Referral code (if any)"
                className={`w-full p-3 border rounded-lg ${promoterFormErrors.referralCode ? 'border-red-500' : 'border-gray-300'}`}
              />
              {promoterFormErrors.referralCode ? (
                <p className="text-xs text-red-600 -mt-2 mb-1">{promoterFormErrors.referralCode}</p>
              ) : null}

              <input
                value={promoterForm.instagramProfileLink}
                onChange={(e) => {
                  handlePromoterFormChange('instagramProfileLink', e.target.value);
                  setPromoterFormErrors((p) => ({ ...p, instagramProfileLink: undefined }));
                }}
                placeholder="Instagram profile link (optional)"
                className={`w-full p-3 border rounded-lg ${promoterFormErrors.instagramProfileLink ? 'border-red-500' : 'border-gray-300'}`}
              />
              {promoterFormErrors.instagramProfileLink ? (
                <p className="text-xs text-red-600 -mt-2 mb-1">{promoterFormErrors.instagramProfileLink}</p>
              ) : null}

              <input
                value={promoterForm.youtubeProfileLink}
                onChange={(e) => {
                  handlePromoterFormChange('youtubeProfileLink', e.target.value);
                  setPromoterFormErrors((p) => ({ ...p, youtubeProfileLink: undefined }));
                }}
                placeholder="YouTube profile link (optional)"
                className={`w-full p-3 border rounded-lg ${promoterFormErrors.youtubeProfileLink ? 'border-red-500' : 'border-gray-300'}`}
              />
              {promoterFormErrors.youtubeProfileLink ? (
                <p className="text-xs text-red-600 -mt-2 mb-1">{promoterFormErrors.youtubeProfileLink}</p>
              ) : null}
              <textarea
                value={promoterForm.address}
                onChange={(e) => {
                  handlePromoterFormChange('address', e.target.value);
                  setPromoterFormErrors((p) => ({ ...p, address: undefined }));
                }}
                placeholder="Address *"
                rows={2}
                className={`w-full p-3 border rounded-lg resize-none ${promoterFormErrors.address ? 'border-red-500' : 'border-gray-300'}`}
              />
              {promoterFormErrors.address ? (
                <p className="text-xs text-red-600 -mt-2 mb-1">{promoterFormErrors.address}</p>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={promoterForm.city}
                  onChange={(e) => handlePromoterFormChange('city', e.target.value)}
                  placeholder="City"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  value={promoterForm.state}
                  onChange={(e) => handlePromoterFormChange('state', e.target.value)}
                  placeholder="State"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <input
                value={promoterForm.pincode}
                onChange={(e) =>
                  handlePromoterFormChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="Pincode"
                inputMode="numeric"
                maxLength={6}
                className={`w-full p-3 border rounded-lg ${promoterFormErrors.pincode ? 'border-red-500' : 'border-gray-300'}`}
              />
              {promoterFormErrors.pincode ? (
                <p className="text-xs text-red-600 -mt-2 mb-1">{promoterFormErrors.pincode}</p>
              ) : null}
              <textarea
                value={promoterForm.notes}
                onChange={(e) => handlePromoterFormChange('notes', e.target.value)}
                placeholder="Additional details / notes (optional)"
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              />
              <div className="pt-2 border-t border-gray-200 mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Promo code for this promoter</p>
                <p className="text-xs text-gray-500 mb-2">Discount applies to schools added by this promoter.</p>
                <input
                  value={promoterForm.promoCode}
                  onChange={(e) =>
                    handlePromoterFormChange('promoCode', e.target.value.replace(/[^a-zA-Z0-9]/g, ''))
                  }
                  placeholder="Promo code (optional — auto-generated if blank)"
                  className={`w-full p-3 border rounded-lg mb-3 ${promoterFormErrors.promoCode ? 'border-red-500' : 'border-gray-300'}`}
                />
                {promoterFormErrors.promoCode ? (
                  <p className="text-xs text-red-600 mb-2">{promoterFormErrors.promoCode}</p>
                ) : null}
                <input
                  value={promoterForm.discountPercent}
                  onChange={(e) => {
                    handlePromoterFormChange('discountPercent', e.target.value);
                    setPromoterFormErrors((p) => ({ ...p, discountPercent: undefined }));
                  }}
                  placeholder="Discount % * (1–100)"
                  type="number"
                  min={1}
                  max={100}
                  className={`w-full p-3 border rounded-lg ${promoterFormErrors.discountPercent ? 'border-red-500' : 'border-gray-300'}`}
                />
                {promoterFormErrors.discountPercent ? (
                  <p className="text-xs text-red-600 mt-1">{promoterFormErrors.discountPercent}</p>
                ) : null}
              </div>
            </div>
            <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => { setShowAddPromoter(false); resetPromoterForm(); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleAddPromoter} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Add Promoter
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddSponsor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Sponsor</h3>
            <input
              value={newSponsorName}
              onChange={(e) => setNewSponsorName(e.target.value)}
              placeholder="Sponsor name"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddSponsor(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleAddSponsor} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}
      {showAddVideoByte && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Video Byte</h3>
            <input
              value={newVideoByteTitle}
              onChange={(e) => setNewVideoByteTitle(e.target.value)}
              placeholder="Video title"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddVideoByte(false)} className="flex-1 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleAddVideoByte} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
