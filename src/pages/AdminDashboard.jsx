import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutThunk } from '../store/slices/authSlice';
import { selectRoleId } from '../store/selectors/authSelectors';
import { ROLE_IDS } from '../auth/session';
import {
  useCreateSchoolMutation,
  useDeleteSchoolMutation,
  useSchoolsQuery,
} from '../features/schools/hooks/useSchoolsQuery';
import { useEventsQuery, useUpdateEventStatusMutation } from '../features/events/hooks/useEventsQuery';
import {
  useCreateSuperAdminMutation,
  useResetSuperAdminPasswordMutation,
  useSuperAdminsListQuery,
  useUpdateSuperAdminStatusMutation,
} from '../features/superAdmins/hooks/useSuperAdminsQuery';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { addPromoterLocal, updatePromoterStatusLocal } from '../store/slices/promoterSlice';
import { selectAllPromoters } from '../store/selectors/promoterSelectors';
import {
  STATIC_TOTAL_STUDENTS,
  STATIC_RECENT_UPLOADS,
  STATIC_QUIZ_ATTEMPTS,
  STATIC_STUDENTS_LIST,
} from '../data/staticData';
import { useNotifications } from '../components/notifications/NotificationProvider';
import useNavigationPrefetch from '../hooks/useNavigationPrefetch';
import {
  IconBook,
  IconBrain,
  IconCalendar,
  IconDashboard,
  IconSchool,
  IconUser,
} from '../components/icons/AppIcons';
import FormInput from '../components/forms/common/FormInput';
import { PASSWORD_REQUIREMENTS_SUMMARY, validateStrongPassword } from '../lib/passwordPolicy';

const AdminPromoterFormModal = lazy(() => import('../components/forms/admin/AdminPromoterFormModal'));
const AdminSchoolFormModal = lazy(() => import('../components/forms/admin/AdminSchoolFormModal'));

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: IconDashboard, path: 'dashboard' },
  { label: 'View Students', icon: IconBook, path: 'students' },
  { label: 'Events', icon: IconCalendar, path: 'events' },
  { label: 'QUIZ', icon: IconBrain, path: 'quiz' },
  { label: 'Promotors', icon: IconUser, path: 'promotors' },
  { label: 'Influencers', icon: IconUser, path: 'influencers' },
  { label: 'Partners', icon: IconSchool, path: 'partners' },
  { label: 'Schools', icon: IconSchool, path: 'schools' },
  { label: 'Profile', icon: IconUser, path: 'profile' },
];

const INITIAL_SCHOOL_FORM = {
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
};

const INITIAL_PROMOTER_FORM = {
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
};

/** Partner accounts are super admins (same API as `/api/super-admins`). */
const INITIAL_PARTNER_FORM = {
  name: '',
  email: '',
  mobileNumber: '',
};


export default function AdminDashboard() {
  const navigate = useNavigate();
  const { success, error: notifyError, info } = useNotifications();
  const { prefetchByPath } = useNavigationPrefetch();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [activeNav, setActiveNav] = useState(
    () => location.state?.defaultNav || 'dashboard'
  );
  const userRoleId = useAppSelector(selectRoleId);
  const isAdmin = Number(userRoleId) === ROLE_IDS.ADMIN;
  /** Only ADMIN may add promoters, schools, influencers, partners, etc. Super admin is view-only here. */
  const canManageAdminData = isAdmin;

  useEffect(() => {
    // RoleId 4 == Student: no access to the web application.
    if (userRoleId === 4) {
      dispatch(logoutThunk());
      navigate('/');
    }
  }, [dispatch, userRoleId, navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const SCHOOLS_PAGE_SIZE = 10;
  const [schoolsPage, setSchoolsPage] = useState(1);
  const [localSchools, setLocalSchools] = useState([]);
  const schoolQuery = { scope: 'admin', page: activeNav === 'schools' ? schoolsPage : 1, limit: SCHOOLS_PAGE_SIZE };
  const schoolsQuery = useSchoolsQuery({ ...schoolQuery, fallbackToStatic: true });
  const createSchoolMutation = useCreateSchoolMutation();
  const deleteSchoolMutation = useDeleteSchoolMutation();
  const schoolsList = schoolsQuery.data || { items: [], total: 0, page: schoolsPage, limit: SCHOOLS_PAGE_SIZE, totalPages: 1 };
  const schoolsAdded = schoolsList.items;
  const mergedSchoolsAdded = useMemo(() => {
    const byId = new Map();
    schoolsAdded.forEach((school) => byId.set(String(school.id), school));
    localSchools.forEach((school) => byId.set(String(school.id), school));
    return Array.from(byId.values());
  }, [localSchools, schoolsAdded]);
  const schoolsListMeta = schoolsList;
  const schoolsListLoading = schoolsQuery.isLoading || schoolsQuery.isFetching;
  const schoolsListError = schoolsQuery.error?.message || null;
  const schoolsAddedCount = schoolsListMeta?.total ?? schoolsAdded.length;
  const schoolsTotalPages = Math.max(1, schoolsListMeta?.totalPages ?? 1);
  const listOffset =
    schoolsListMeta != null
      ? Math.max(0, (schoolsListMeta.page - 1) * schoolsListMeta.limit)
      : (schoolsPage - 1) * SCHOOLS_PAGE_SIZE;
  const pagedSchoolsAdded = mergedSchoolsAdded;
  const eventsQuery = useEventsQuery({ enabled: activeNav === 'events' });
  const updateEventStatusMutation = useUpdateEventStatusMutation();
  const eventsList = eventsQuery.data || [];
  const eventsLoading = eventsQuery.isLoading || eventsQuery.isFetching;
  const eventsError = eventsQuery.error?.message || null;
  const [activationTargetEvent, setActivationTargetEvent] = useState(null);
  const [activationForm, setActivationForm] = useState({ fromDate: '', toDate: '' });

  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showEditSchool, setShowEditSchool] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [editSchoolForm, setEditSchoolForm] = useState(INITIAL_SCHOOL_FORM);
  const [schoolForm, setSchoolForm] = useState(INITIAL_SCHOOL_FORM);
  const [schoolFormErrors, setSchoolFormErrors] = useState({});
  const [editSchoolFormErrors, setEditSchoolFormErrors] = useState({});
  const [schoolSubmitting, setSchoolSubmitting] = useState(false);
  const [editSchoolSubmitting, setEditSchoolSubmitting] = useState(false);

  useEffect(() => {
    // If navigation passes a default tab, switch to it on mount / state change.
    const nextNav = location.state?.defaultNav;
    if (nextNav) setActiveNav(nextNav);
  }, [location.state]);

  useEffect(() => {
    if (!schoolsListMeta?.totalPages) return;
    setSchoolsPage((p) => Math.min(p, Math.max(1, schoolsListMeta.totalPages)));
  }, [schoolsListMeta?.totalPages]);

  const promotersAdded = useAppSelector(selectAllPromoters);
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
  const [promoterForm, setPromoterForm] = useState(INITIAL_PROMOTER_FORM);
  const [promoterFormErrors, setPromoterFormErrors] = useState({});
  const [promoterSubmitting, setPromoterSubmitting] = useState(false);

  const PARTNERS_PAGE_SIZE = 10;
  const [partnersPage, setPartnersPage] = useState(1);
  const [partnersSearchInput, setPartnersSearchInput] = useState('');
  const debouncedPartnersSearch = useDebouncedValue(partnersSearchInput, 400);
  const [partnersStatusFilter, setPartnersStatusFilter] = useState('all');
  const partnersStatusParam =
    partnersStatusFilter === 'active'
      ? true
      : partnersStatusFilter === 'inactive'
        ? false
        : undefined;

  const partnersListQuery = useSuperAdminsListQuery(
    {
      page: partnersPage,
      limit: PARTNERS_PAGE_SIZE,
      search: debouncedPartnersSearch,
      status: partnersStatusParam,
    },
    { enabled: activeNav === 'partners' }
  );
  const createPartnerMutation = useCreateSuperAdminMutation();
  const updatePartnerStatusMutation = useUpdateSuperAdminStatusMutation();
  const resetPartnerPasswordMutation = useResetSuperAdminPasswordMutation();

  const partnersListMeta = partnersListQuery.data || {
    items: [],
    total: 0,
    page: 1,
    limit: PARTNERS_PAGE_SIZE,
    totalPages: 1,
  };
  const partnersRows = partnersListMeta.items || [];
  const partnersListLoading = partnersListQuery.isLoading || partnersListQuery.isFetching;
  const partnersListError = partnersListQuery.error?.message || null;

  const [showAddPartner, setShowAddPartner] = useState(false);
  const [partnerForm, setPartnerForm] = useState(INITIAL_PARTNER_FORM);
  const [partnerFormErrors, setPartnerFormErrors] = useState({});
  const [resetPasswordTarget, setResetPasswordTarget] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');

  useEffect(() => {
    setPartnersPage(1);
  }, [debouncedPartnersSearch, partnersStatusFilter]);

  useEffect(() => {
    const tp = partnersListMeta?.totalPages;
    if (!tp) return;
    setPartnersPage((p) => Math.min(p, Math.max(1, tp)));
  }, [partnersListMeta?.totalPages]);

  const updatePromoterStatus = (id, nextStatus) => {
    dispatch(updatePromoterStatusLocal({ id, status: nextStatus }));
  };

  const validatePromoterForm = (form) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const name = form.name?.trim();
    const email = form.email?.trim();
    const phoneRaw = form.phone?.trim().replace(/\s/g, '');
    const pincode = form.pincode?.trim();

    if (!name) errors.name = 'Promoter name is required.';
    if (!email) errors.email = 'Promoter email is required.';
    else if (!emailRegex.test(email)) errors.email = 'Enter a valid promoter email.';
    if (!phoneRaw) errors.phone = 'Promoter phone is required.';
    else if (!/^[6-9]\d{9}$/.test(phoneRaw)) errors.phone = 'Enter a valid 10-digit phone starting with 6-9.';
    if (pincode && !/^\d{6}$/.test(pincode)) errors.pincode = 'Enter a valid 6-digit pincode.';

    return errors;
  };

  /** Partners are super admin accounts (POST `/api/super-admins`). */
  const validatePartnerForm = (form) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const name = form.name?.trim();
    const mobileRaw = form.mobileNumber?.trim().replace(/\s/g, '');
    const email = form.email?.trim();

    if (!name) errors.name = 'Name is required.';
    if (!mobileRaw) errors.mobileNumber = 'Mobile number is required.';
    else if (!/^[6-9]\d{9}$/.test(mobileRaw)) {
      errors.mobileNumber = 'Enter a valid 10-digit mobile number starting with 6-9.';
    }
    if (!email) errors.email = 'Email is required.';
    else if (!emailRegex.test(email)) errors.email = 'Enter a valid email address.';

    return errors;
  };

  const handleCreatePartner = async () => {
    if (!canManageAdminData) {
      notifyError('Only admin can add partners.');
      return;
    }
    const errors = validatePartnerForm(partnerForm);
    setPartnerFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await createPartnerMutation.mutateAsync({
        name: partnerForm.name?.trim(),
        email: partnerForm.email?.trim(),
        mobileNumber: partnerForm.mobileNumber?.trim().replace(/\s/g, ''),
      });
      success('Partner account created. They will use the credentials your organization provides.');
      setShowAddPartner(false);
      setPartnerForm(INITIAL_PARTNER_FORM);
      setPartnerFormErrors({});
    } catch (e) {
      notifyError(e?.message || 'Could not add partner.');
    }
  };

  const handleTogglePartnerStatus = async (row, nextActive) => {
    if (!canManageAdminData) {
      notifyError('Only admin can change status.');
      return;
    }
    try {
      await updatePartnerStatusMutation.mutateAsync({
        userId: row.id,
        active: nextActive,
      });
      success(nextActive ? 'Partner activated.' : 'Partner deactivated.');
    } catch (e) {
      notifyError(e?.message || 'Could not update status.');
    }
  };

  const handleSubmitResetPartnerPassword = async () => {
    if (!canManageAdminData) {
      notifyError('Only admin can reset password.');
      return;
    }
    const pwd = resetPasswordValue?.trim() || '';
    const strong = validateStrongPassword(pwd);
    if (!strong.valid) {
      setResetPasswordError(strong.error);
      return;
    }
    setResetPasswordError('');
    try {
      await resetPartnerPasswordMutation.mutateAsync({
        userId: resetPasswordTarget.id,
        newPassword: pwd,
      });
      success('Password updated.');
      setResetPasswordTarget(null);
      setResetPasswordValue('');
    } catch (e) {
      notifyError(e?.message || 'Could not reset password.');
    }
  };

  const validateSchoolForm = (form) => {
    const errors = {};
    const pincode = form.pincode?.trim();
    const contactPhone = form.contactPhone?.trim().replace(/\s/g, '');
    if (!form.name?.trim()) errors.name = 'School name is required.';
    if (!form.address?.trim()) errors.address = 'Address is required.';
    if (!form.city?.trim()) errors.city = 'City is required.';
    if (!form.state?.trim()) errors.state = 'State is required.';
    if (!pincode) errors.pincode = 'Pincode is required.';
    else if (!/^\d{6}$/.test(pincode)) errors.pincode = 'Enter a valid 6-digit pincode.';
    if (!form.contactName?.trim()) errors.contactName = 'Contact person name is required.';
    if (!contactPhone) errors.contactPhone = 'Contact mobile number is required.';
    else if (!/^[6-9]\d{9}$/.test(contactPhone)) errors.contactPhone = 'Enter a valid 10-digit number starting with 6-9.';
    if (form.hasBranches && !form.branchCode?.trim()) errors.branchCode = 'Branch code is required when school has branches.';
    return errors;
  };

  const handleAddPromoter = () => {
    if (!canManageAdminData) {
      notifyError('Super admin has view-only access for this screen.');
      return;
    }
    const errors = validatePromoterForm(promoterForm);
    setPromoterFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setPromoterSubmitting(true);
    const name = promoterForm.name?.trim();
    const email = promoterForm.email?.trim();
    const phoneRaw = promoterForm.phone?.trim().replace(/\s/g, '');
    const pincode = promoterForm.pincode?.trim();

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

    dispatch(addPromoterLocal(newPromoter));
    setShowAddPromoter(false);
    setPromoterForm(INITIAL_PROMOTER_FORM);
    setPromoterFormErrors({});
    setPromoterSubmitting(false);
  };

  const getPromoterTotalAddress = (p) =>
    [p.address, p.city, p.state, p.pincode].filter(Boolean).join(', ');

  const handleSidebarNavClick = (path) => {
    if (path === 'quiz') {
      navigate('/QuizCreator');
      return;
    }
    if (path === 'profile') {
      navigate('/profile');
      return;
    }
    setActiveNav(path);
  };

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/');
  };

  const handleAddSchool = async () => {
    if (!canManageAdminData) {
      notifyError('Super admin has view-only access for this screen.');
      return;
    }
    const errors = validateSchoolForm(schoolForm);
    setSchoolFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSchoolSubmitting(true);
    const name = schoolForm.name?.trim();

    const studentsCountRaw = schoolForm.studentsCount?.toString().trim();
    let studentsCountValue = 0;
    if (studentsCountRaw) {
      const parsed = parseInt(studentsCountRaw, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        setSchoolFormErrors((prev) => ({ ...prev, studentsCount: 'Number of students must be 0 or greater.' }));
        setSchoolSubmitting(false);
        return;
      }
      studentsCountValue = parsed;
    }

    const address = schoolForm.address?.trim();
    const city = schoolForm.city?.trim();
    const state = schoolForm.state?.trim();
    const pincode = schoolForm.pincode?.trim();
    const contactName = schoolForm.contactName?.trim();
    const contactPhone = schoolForm.contactPhone?.trim().replace(/\s/g, '');

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

    try {
      await createSchoolMutation.mutateAsync({ payload: requestPayload, userId: 1, userRole: 'admin' });
      setSchoolsPage(1);
      success('School created successfully.');
    } catch {
      setLocalSchools((previous) => [newSchool, ...previous]);
      info('School saved locally. Sync will continue in background.');
    }

    setShowAddSchool(false);
    setSchoolForm(INITIAL_SCHOOL_FORM);
    setSchoolFormErrors({});
    setSchoolSubmitting(false);
  };

  const handleDeleteSchool = async (id) => {
    if (!isAdmin) {
      notifyError('Only admin can delete schools.');
      return;
    }

    const ok = window.confirm('Delete this school?');
    if (!ok) return;

    try {
      await deleteSchoolMutation.mutateAsync({ schoolId: id, userRole: 'admin' });
      setSchoolsPage(1);
      success('School deleted successfully.');
    } catch {
      setLocalSchools((previous) => previous.filter((school) => school.id !== id));
      info('Delete synced locally; server sync will retry.');
    }
  };

  const handleUpdateEventStatus = async ({ eventId, nextStatus, fromDate, toDate }) => {
    if (!isAdmin) {
      notifyError('Only admin can update event status.');
      return;
    }
    try {
      await updateEventStatusMutation.mutateAsync({ eventId, status: nextStatus, fromDate, toDate });
      success(`Event marked as ${nextStatus}.`);
    } catch (error) {
      notifyError(error?.message || 'Failed to update event status.');
    }
  };

  const openActivationModal = (event) => {
    setActivationTargetEvent(event);
    setActivationForm({
      fromDate: String(event?.fromDate ?? '').slice(0, 10),
      toDate: String(event?.toDate ?? '').slice(0, 10),
    });
  };

  const closeActivationModal = () => {
    setActivationTargetEvent(null);
    setActivationForm({ fromDate: '', toDate: '' });
  };

  const confirmActivation = async () => {
    const fromDate = String(activationForm.fromDate || '').trim();
    const toDate = String(activationForm.toDate || '').trim();
    if (!fromDate || !toDate) {
      notifyError('From date and To date are required to activate an event.');
      return;
    }
    if (fromDate > toDate) {
      notifyError('From date must be less than or equal to To date.');
      return;
    }
    await handleUpdateEventStatus({
      eventId: activationTargetEvent?.id,
      nextStatus: 'active',
      fromDate,
      toDate,
    });
    closeActivationModal();
  };

  const openEditSchool = (school) => {
    if (!canManageAdminData) {
      notifyError('Super admin has view-only access for this screen.');
      return;
    }
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
    setEditSchoolFormErrors({});
    setShowEditSchool(true);
  };

  const handleUpdateSchool = () => {
    if (!canManageAdminData) {
      notifyError('Super admin has view-only access for this screen.');
      return;
    }
    if (editingSchoolId === null) return;
    const errors = validateSchoolForm(editSchoolForm);
    setEditSchoolFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setEditSchoolSubmitting(true);
    const name = editSchoolForm.name?.trim();

    const studentsCountRaw = editSchoolForm.studentsCount?.toString().trim();
    let studentsCountValue = 0;
    if (studentsCountRaw) {
      const parsed = parseInt(studentsCountRaw, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        setEditSchoolFormErrors((prev) => ({ ...prev, studentsCount: 'Number of students must be 0 or greater.' }));
        setEditSchoolSubmitting(false);
        return;
      }
      studentsCountValue = parsed;
    }

    const address = editSchoolForm.address?.trim();
    const city = editSchoolForm.city?.trim();
    const state = editSchoolForm.state?.trim();
    const pincode = editSchoolForm.pincode?.trim();
    const contactName = editSchoolForm.contactName?.trim();
    const contactPhone = editSchoolForm.contactPhone?.trim().replace(/\s/g, '');

    setLocalSchools((previous) =>
      previous.map((school) =>
        school.id === editingSchoolId
          ? {
              ...school,
              name,
              email: editSchoolForm.email?.trim() || '',
              branchCode: editSchoolForm.hasBranches ? editSchoolForm.branchCode?.trim() || '' : '',
              address,
              city,
              state,
              pincode: pincode || '',
              contactName,
              contactPhone,
              studentsCount: studentsCountValue,
            }
          : school
      )
    );
    setShowEditSchool(false);
    setEditingSchoolId(null);
    setEditSchoolFormErrors({});
    setEditSchoolSubmitting(false);
  };

  const updateSchoolStatus = (id, nextStatus) => {
    if (!canManageAdminData) {
      notifyError('Only admin can update school status.');
      return;
    }

    setLocalSchools((previous) =>
      previous.map((school) =>
        school.id === id ? { ...school, status: nextStatus === 'inactive' ? 'inactive' : 'active' } : school
      )
    );
  };

  const getTotalAddress = (s) =>
    [s.address, s.city, s.state, s.pincode].filter(Boolean).join(', ');


  return (
    <div className="flex min-h-screen bg-gray-50 flex-col">
      <div className="flex flex-1">
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
        <div className="px-4 pt-3">
          <p className="mb-1 text-xs uppercase tracking-wide text-sky-700">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-2">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => handleSidebarNavClick(item.path)}
              onMouseEnter={() => {
                if (item.path === 'profile') prefetchByPath('/profile');
                if (item.path === 'schools') prefetchByPath('/admin');
                if (item.path === 'dashboard') prefetchByPath('/home');
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
                activeNav === item.path
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'text-sky-900 hover:bg-sky-100'
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-sky-700 px-3 py-2 text-sm font-medium text-white hover:bg-sky-800"
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
        <div className="px-4 pt-3">
          <p className="mb-1 text-xs uppercase tracking-wide text-sky-700">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-2">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                handleSidebarNavClick(item.path);
                setSidebarOpen(false);
              }}
              onMouseEnter={() => {
                if (item.path === 'profile') prefetchByPath('/profile');
                if (item.path === 'schools') prefetchByPath('/admin');
                if (item.path === 'dashboard') prefetchByPath('/home');
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-3 ${
                activeNav === item.path
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'text-sky-900 hover:bg-sky-100'
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false);
              handleLogout();
            }}
            className="w-full rounded-lg bg-sky-700 px-3 py-2 text-sm font-medium text-white hover:bg-sky-800"
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
            {activeNav === 'influencers' && 'Influencers'}
            {activeNav === 'partners' && 'Partners'}
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
          {activeNav === 'influencers' && 'Influencers'}
          {activeNav === 'partners' && 'Partners'}
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
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">S No</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Event Name</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">From Date</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">To Date</th>
                    <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-gray-500">
                        Loading events...
                      </td>
                    </tr>
                  ) : eventsError ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-red-600">
                        {eventsError}
                      </td>
                    </tr>
                  ) : eventsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-gray-500">
                        No events available.
                      </td>
                    </tr>
                  ) : (
                    eventsList.map((event, idx) => {
                      const isActive = event.status === 'active';
                      return (
                        <tr key={String(event.id)} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-5 py-4 whitespace-nowrap">{idx + 1}</td>
                          <td className="px-5 py-4 text-gray-800 font-medium">{event.name || '-'}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                            {event.fromDate ? String(event.fromDate).slice(0, 10) : '-'}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                            {event.toDate ? String(event.toDate).slice(0, 10) : '-'}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                              <input
                                type="checkbox"
                                checked={isActive}
                                disabled={!isAdmin || updateEventStatusMutation.isPending}
                                aria-label={`Set event ${event.name || ''} status to ${isActive ? 'inactive' : 'active'}`}
                                onChange={(e) => {
                                  const nextStatus = e.target.checked ? 'active' : 'inactive';
                                  if (nextStatus === 'active') {
                                    openActivationModal(event);
                                    return;
                                  }
                                  handleUpdateEventStatus({ eventId: event.id, nextStatus: 'inactive' });
                                }}
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
        )}

        {activationTargetEvent && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Activate Event</h3>
              <p className="text-sm text-gray-500 mb-4">{activationTargetEvent.name || 'Selected event'}</p>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm text-gray-700">From Date</span>
                  <input
                    type="date"
                    value={activationForm.fromDate}
                    onChange={(e) => setActivationForm((prev) => ({ ...prev, fromDate: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">To Date</span>
                  <input
                    type="date"
                    value={activationForm.toDate}
                    onChange={(e) => setActivationForm((prev) => ({ ...prev, toDate: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
              </div>
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeActivationModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmActivation}
                  disabled={updateEventStatusMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Save & Activate
                </button>
              </div>
            </div>
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
                onClick={() => {
                  setPromoterForm(INITIAL_PROMOTER_FORM);
                  setPromoterFormErrors({});
                  if (canManageAdminData) setShowAddPromoter(true);
                }}
                disabled={!canManageAdminData}
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
              <Suspense fallback={<div className="fixed inset-0 z-40 bg-black/40" />}>
                <AdminPromoterFormModal
                value={promoterForm}
                errors={promoterFormErrors}
                submitting={promoterSubmitting}
                onChange={(field, value) => setPromoterForm((prev) => ({ ...prev, [field]: value }))}
                onCancel={() => {
                  setShowAddPromoter(false);
                  setPromoterForm(INITIAL_PROMOTER_FORM);
                  setPromoterFormErrors({});
                  setPromoterSubmitting(false);
                }}
                onSubmit={handleAddPromoter}
                />
              </Suspense>
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
                  onClick={() => {
                    setSchoolForm(INITIAL_SCHOOL_FORM);
                    setSchoolFormErrors({});
                    if (canManageAdminData) setShowAddSchool(true);
                  }}
                  disabled={!canManageAdminData}
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
                                    disabled={!canManageAdminData}
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
                                {canManageAdminData && (
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
                                )}
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

            {showAddSchool && canManageAdminData && (
              <Suspense fallback={<div className="fixed inset-0 z-40 bg-black/40" />}>
                <AdminSchoolFormModal
                title="Add School (Admin)"
                value={schoolForm}
                errors={schoolFormErrors}
                submitLabel="Add School"
                submitting={schoolSubmitting}
                onChange={(field, value) => setSchoolForm((prev) => ({ ...prev, [field]: value }))}
                onCancel={() => {
                  setShowAddSchool(false);
                  setSchoolForm(INITIAL_SCHOOL_FORM);
                  setSchoolFormErrors({});
                  setSchoolSubmitting(false);
                }}
                onSubmit={handleAddSchool}
                />
              </Suspense>
            )}

            {showEditSchool && canManageAdminData && (
              <Suspense fallback={<div className="fixed inset-0 z-40 bg-black/40" />}>
                <AdminSchoolFormModal
                title="Edit School"
                value={editSchoolForm}
                errors={editSchoolFormErrors}
                submitLabel="Save Changes"
                submitting={editSchoolSubmitting}
                onChange={(field, value) => setEditSchoolForm((prev) => ({ ...prev, [field]: value }))}
                onCancel={() => {
                  setShowEditSchool(false);
                  setEditingSchoolId(null);
                  setEditSchoolForm(INITIAL_SCHOOL_FORM);
                  setEditSchoolFormErrors({});
                  setEditSchoolSubmitting(false);
                }}
                onSubmit={handleUpdateSchool}
                />
              </Suspense>
            )}
          </div>
        )}

        {activeNav === 'influencers' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Influencers</h2>
                <p className="text-sm text-gray-500">Manage influencer records from this section.</p>
              </div>
              <button
                type="button"
                disabled={!canManageAdminData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (!canManageAdminData) notifyError('Only admin can add influencers.');
                }}
              >
                Add Influencer
              </button>
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-100 p-6 text-gray-500">
              No influencers added yet.
            </div>
          </div>
        )}

        {activeNav === 'partners' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Partners</h2>
                <p className="text-sm text-gray-500">
                  Partners have super admin–level access. Account credentials are never shown here.
                </p>
              </div>
              <button
                type="button"
                disabled={!canManageAdminData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                onClick={() => {
                  if (!canManageAdminData) {
                    notifyError('Only admin can add partners.');
                    return;
                  }
                  setPartnerForm(INITIAL_PARTNER_FORM);
                  setPartnerFormErrors({});
                  setShowAddPartner(true);
                }}
              >
                Add Partner
              </button>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                <FormInput
                  type="search"
                  value={partnersSearchInput}
                  onChange={(e) => setPartnersSearchInput(e.target.value)}
                  placeholder="Name, email, or mobile"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={partnersStatusFilter}
                  onChange={(e) => setPartnersStatusFilter(e.target.value)}
                  className="w-full sm:w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 bg-white"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {partnersListError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {partnersListError}
              </div>
            )}

            {partnersListLoading && partnersRows.length === 0 ? (
              <div className="bg-white rounded-xl shadow border border-gray-100 p-8 text-center text-gray-500">
                Loading…
              </div>
            ) : partnersRows.length === 0 ? (
              <div className="bg-white rounded-xl shadow border border-gray-100 p-8 text-center text-gray-500">
                No partners found.
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">S No</th>
                        <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Name</th>
                        <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Email</th>
                        <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Mobile</th>
                        <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                        {canManageAdminData && (
                          <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {partnersRows.map((row, idx) => {
                        const globalIndex =
                          (partnersListMeta.page - 1) * (partnersListMeta.limit || PARTNERS_PAGE_SIZE) +
                          idx +
                          1;
                        return (
                          <tr key={String(row.id)} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-5 py-4 whitespace-nowrap">{globalIndex}</td>
                            <td className="px-5 py-4 font-medium text-gray-800">{row.name}</td>
                            <td className="px-5 py-4 text-gray-700">{row.email}</td>
                            <td className="px-5 py-4 whitespace-nowrap text-gray-700">{row.mobileNumber}</td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  row.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {row.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            {canManageAdminData && (
                              <td className="px-5 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={
                                      updatePartnerStatusMutation.isPending ||
                                      resetPartnerPasswordMutation.isPending
                                    }
                                    className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                                    onClick={() => handleTogglePartnerStatus(row, !row.active)}
                                  >
                                    {row.active ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      updatePartnerStatusMutation.isPending ||
                                      resetPartnerPasswordMutation.isPending
                                    }
                                    className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                                    onClick={() => {
                                      setResetPasswordTarget({ id: row.id, name: row.name });
                                      setResetPasswordValue('');
                                      setResetPasswordError('');
                                    }}
                                  >
                                    Reset password
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {partnersListMeta.totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/80">
                    <p className="text-xs text-gray-600">
                      Page {partnersListMeta.page} of {partnersListMeta.totalPages} (
                      {partnersListMeta.total} total)
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={partnersPage <= 1 || partnersListLoading}
                        onClick={() => setPartnersPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        disabled={
                          partnersPage >= partnersListMeta.totalPages || partnersListLoading
                        }
                        onClick={() =>
                          setPartnersPage((p) => Math.min(partnersListMeta.totalPages, p + 1))
                        }
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showAddPartner && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Partner</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Creates a partner account with elevated access. The user receives credentials through your
                    secure provisioning flow (not in this app).
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <FormInput
                        type="text"
                        value={partnerForm.name}
                        onChange={(e) => setPartnerForm((prev) => ({ ...prev, name: e.target.value }))}
                        error={partnerFormErrors.name}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <FormInput
                        type="email"
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm((prev) => ({ ...prev, email: e.target.value }))}
                        error={partnerFormErrors.email}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile number *
                      </label>
                      <FormInput
                        type="tel"
                        value={partnerForm.mobileNumber}
                        onChange={(e) =>
                          setPartnerForm((prev) => ({ ...prev, mobileNumber: e.target.value }))
                        }
                        error={partnerFormErrors.mobileNumber}
                        placeholder="10-digit mobile"
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPartner(false);
                        setPartnerForm(INITIAL_PARTNER_FORM);
                        setPartnerFormErrors({});
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreatePartner}
                      disabled={createPartnerMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createPartnerMutation.isPending ? 'Saving…' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {resetPasswordTarget && (
              <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Reset password</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    New password for <span className="font-medium text-gray-800">{resetPasswordTarget.name}</span>.{' '}
                    {PASSWORD_REQUIREMENTS_SUMMARY}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                    <FormInput
                      type="password"
                      value={resetPasswordValue}
                      onChange={(e) => {
                        setResetPasswordValue(e.target.value);
                        if (resetPasswordError) setResetPasswordError('');
                      }}
                      error={resetPasswordError}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setResetPasswordTarget(null);
                        setResetPasswordValue('');
                        setResetPasswordError('');
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitResetPartnerPassword}
                      disabled={resetPartnerPasswordMutation.isPending}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {resetPartnerPasswordMutation.isPending ? 'Saving…' : 'Update password'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
