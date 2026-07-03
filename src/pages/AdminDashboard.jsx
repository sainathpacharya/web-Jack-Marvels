import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutThunk } from '../store/slices/authSlice';
import { selectRoleId } from '../store/selectors/authSelectors';
import { getMe, ROLE_IDS } from '../auth/session';
import {
  useCreateSchoolMutation,
  useDeleteSchoolMutation,
  useSchoolsQuery,
  useUpdateSchoolStatusMutation,
} from '../features/schools/hooks/useSchoolsQuery';
import {
  useUpdateInfluencerStatusMutation,
  useUpdatePromotorStatusMutation,
} from '../features/masters/hooks/useMasterStatusMutation';
import { isServerMasterId } from '../api/masters';
import { useEventsQuery, useUpdateEventStatusMutation } from '../features/events/hooks/useEventsQuery';
import {
  useCreateSuperAdminMutation,
  useResetSuperAdminPasswordMutation,
  useSuperAdminsListQuery,
  useUpdateSuperAdminStatusMutation,
} from '../features/superAdmins/hooks/useSuperAdminsQuery';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { addPromoterLocal, updatePromoterStatusLocal } from '../store/slices/promoterSlice';
import { addInfluencerLocal, updateInfluencerStatusLocal } from '../store/slices/influencerSlice';
import { selectAllPromoters } from '../store/selectors/promoterSelectors';
import { selectAllInfluencers } from '../store/selectors/influencerSelectors';
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
import {
  validateAdminSchoolForm,
  validateAdminPromoterForm,
  validatePartnerAccountForm,
} from '../lib/validation';
import { eventDateRangeSchema } from '../lib/validation/schemas';
import { zodErrorToFlatFieldErrors } from '../lib/validation/zodUtils';
import AdminSidebar, { AdminMobileSidebar } from '../components/admin/AdminSidebar';
import AdminPageTitle from '../components/admin/AdminPageTitle';
import { EVENT_TABLE_HEADER_COLORS, getScriptNameColor } from '../lib/adminTheme';

const AdminPromoterFormModal = lazy(() => import('../components/forms/admin/AdminPromoterFormModal'));
const AdminInfluencerFormModal = lazy(() => import('../components/forms/admin/AdminInfluencerFormModal'));
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

const INITIAL_INFLUENCER_FORM = { ...INITIAL_PROMOTER_FORM };

/** Partner accounts are super admins (same API as `/api/super-admins`). */
const INITIAL_PARTNER_FORM = {
  name: '',
  email: '',
  mobileNumber: '',
};


export default function AdminDashboard() {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotifications();
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
    // Student role has no access to the web application.
    if (Number(userRoleId) === ROLE_IDS.STUDENT) {
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
  const updateSchoolStatusMutation = useUpdateSchoolStatusMutation();
  const updatePromotorStatusMutation = useUpdatePromotorStatusMutation();
  const updateInfluencerStatusMutation = useUpdateInfluencerStatusMutation();
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
  const [activationFormErrors, setActivationFormErrors] = useState({});

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

  const influencersAdded = useAppSelector(selectAllInfluencers);
  const INFLUENCERS_PAGE_SIZE = 10;
  const [influencersPage, setInfluencersPage] = useState(1);
  const influencersTotalPages = Math.max(1, Math.ceil(influencersAdded.length / INFLUENCERS_PAGE_SIZE));
  const influencersStartIndex = (influencersPage - 1) * INFLUENCERS_PAGE_SIZE;
  const pagedInfluencersAdded = influencersAdded.slice(
    influencersStartIndex,
    influencersStartIndex + INFLUENCERS_PAGE_SIZE
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

  useEffect(() => {
    setInfluencersPage((p) => Math.min(p, Math.max(1, Math.ceil(influencersAdded.length / INFLUENCERS_PAGE_SIZE))));
  }, [influencersAdded.length]);

  const [showAddPromoter, setShowAddPromoter] = useState(false);
  const [promoterForm, setPromoterForm] = useState(INITIAL_PROMOTER_FORM);
  const [promoterFormErrors, setPromoterFormErrors] = useState({});
  const [promoterSubmitting, setPromoterSubmitting] = useState(false);

  const [showAddInfluencer, setShowAddInfluencer] = useState(false);
  const [influencerForm, setInfluencerForm] = useState(INITIAL_INFLUENCER_FORM);
  const [influencerFormErrors, setInfluencerFormErrors] = useState({});
  const [influencerSubmitting, setInfluencerSubmitting] = useState(false);

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

  const applyLocalPromoterStatus = (id, nextStatus) => {
    dispatch(updatePromoterStatusLocal({ id, status: nextStatus }));
  };

  const applyLocalInfluencerStatus = (id, nextStatus) => {
    dispatch(updateInfluencerStatusLocal({ id, status: nextStatus }));
  };

  const handleTogglePromoterStatus = async (row, checked) => {
    if (!canManageAdminData) {
      notifyError('Only admin can change promoter status.');
      return;
    }
    const nextStatus = checked ? 'active' : 'inactive';
    const active = checked;
    if (!isServerMasterId(row.id)) {
      applyLocalPromoterStatus(row.id, nextStatus);
      return;
    }
    try {
      await updatePromotorStatusMutation.mutateAsync({ id: row.id, active });
      applyLocalPromoterStatus(row.id, nextStatus);
      success(active ? 'Promoter activated.' : 'Promoter deactivated.');
    } catch (e) {
      notifyError(e?.message || 'Could not update promoter status.');
    }
  };

  const handleToggleInfluencerStatus = async (row, checked) => {
    if (!canManageAdminData) {
      notifyError('Only admin can change influencer status.');
      return;
    }
    const nextStatus = checked ? 'active' : 'inactive';
    const active = checked;
    if (!isServerMasterId(row.id)) {
      applyLocalInfluencerStatus(row.id, nextStatus);
      return;
    }
    try {
      await updateInfluencerStatusMutation.mutateAsync({ id: row.id, active });
      applyLocalInfluencerStatus(row.id, nextStatus);
      success(active ? 'Influencer activated.' : 'Influencer deactivated.');
    } catch (e) {
      notifyError(e?.message || 'Could not update influencer status.');
    }
  };

  const handleAddInfluencer = () => {
    if (!canManageAdminData) {
      notifyError('Super admin has view-only access for this screen.');
      return;
    }
    const errors = validateAdminPromoterForm(influencerForm);
    setInfluencerFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setInfluencerSubmitting(true);
    const name = influencerForm.name?.trim();
    const email = influencerForm.email?.trim();
    const phoneRaw = influencerForm.phone?.trim().replace(/\s/g, '');
    const pincode = influencerForm.pincode?.trim();

    const newInfluencer = {
      id: Date.now(),
      name,
      email,
      phone: phoneRaw,
      address: influencerForm.address?.trim() || '',
      city: influencerForm.city?.trim() || '',
      state: influencerForm.state?.trim() || '',
      pincode: pincode || '',
      referralCode: influencerForm.referralCode?.trim() || '',
      promoCode: influencerForm.promoCode?.trim() || '',
      instagramProfileLink: influencerForm.instagramProfileLink?.trim() || '',
      youtubeProfileLink: influencerForm.youtubeProfileLink?.trim() || '',
      status: 'active',
      addedAt: new Date().toISOString().slice(0, 10),
    };

    dispatch(addInfluencerLocal(newInfluencer));
    setShowAddInfluencer(false);
    setInfluencerForm(INITIAL_INFLUENCER_FORM);
    setInfluencerFormErrors({});
    setInfluencerSubmitting(false);
    success('Influencer added successfully.');
  };

  const handleCreatePartner = async () => {
    if (!canManageAdminData) {
      notifyError('Only admin can add partners.');
      return;
    }
    const errors = validatePartnerAccountForm(partnerForm);
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

  const handleAddPromoter = () => {
    if (!canManageAdminData) {
      notifyError('Super admin has view-only access for this screen.');
      return;
    }
    const errors = validateAdminPromoterForm(promoterForm);
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
    const errors = validateAdminSchoolForm(schoolForm);
    setSchoolFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSchoolSubmitting(true);
    const name = schoolForm.name?.trim();

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

    const me = getMe();
    const adminUserId = me?.id ?? 1;

    try {
      await createSchoolMutation.mutateAsync({ payload: requestPayload, userId: adminUserId, userRole: 'admin' });
      setSchoolsPage(1);
      success('School added successfully.');
    } catch (e) {
      notifyError(e?.message || 'Failed to create school on server.');
      setSchoolSubmitting(false);
      return;
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
    } catch (e) {
      notifyError(e?.message || 'Failed to delete school.');
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
    setActivationFormErrors({});
    setActivationForm({
      fromDate: String(event?.fromDate ?? '').slice(0, 10),
      toDate: String(event?.toDate ?? '').slice(0, 10),
    });
  };

  const closeActivationModal = () => {
    setActivationTargetEvent(null);
    setActivationForm({ fromDate: '', toDate: '' });
    setActivationFormErrors({});
  };

  const confirmActivation = async () => {
    const parsed = eventDateRangeSchema.safeParse({
      fromDate: activationForm.fromDate,
      toDate: activationForm.toDate,
    });
    if (!parsed.success) {
      setActivationFormErrors(zodErrorToFlatFieldErrors(parsed.error));
      return;
    }
    setActivationFormErrors({});
    const { fromDate, toDate } = parsed.data;
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
    const errors = validateAdminSchoolForm(editSchoolForm);
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

  const handleToggleSchoolStatus = async (school, checked) => {
    if (!canManageAdminData) {
      notifyError('Only admin can update school status.');
      return;
    }
    const active = checked;
    const nextStatus = checked ? 'active' : 'inactive';
    const id = school.id;

    if (!isServerMasterId(id)) {
      setLocalSchools((previous) =>
        previous.map((s) => (s.id === id ? { ...s, status: nextStatus } : s))
      );
      return;
    }

    try {
      await updateSchoolStatusMutation.mutateAsync({ schoolId: id, active });
      setLocalSchools((previous) =>
        previous.map((s) => (String(s.id) === String(id) ? { ...s, status: nextStatus } : s))
      );
      success(active ? 'School activated.' : 'School deactivated.');
    } catch (e) {
      notifyError(e?.message || 'Could not update school status.');
    }
  };

  const getTotalAddress = (s) =>
    [s.address, s.city, s.state, s.pincode].filter(Boolean).join(', ');


  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
      <AdminSidebar
        items={SIDEBAR_ITEMS}
        activeNav={activeNav}
        onNavClick={handleSidebarNavClick}
        onLogoClick={() => navigate('/home')}
        onLogout={handleLogout}
        onMouseEnterItem={(path) => {
          if (path === 'profile') prefetchByPath('/profile');
          if (path === 'schools') prefetchByPath('/admin');
          if (path === 'dashboard') prefetchByPath('/home');
        }}
      />

      <AdminMobileSidebar
        open={sidebarOpen}
        items={SIDEBAR_ITEMS}
        activeNav={activeNav}
        onNavClick={handleSidebarNavClick}
        onLogoClick={() => navigate('/home')}
        onLogout={handleLogout}
        onClose={() => setSidebarOpen(false)}
        onMouseEnterItem={(path) => {
          if (path === 'profile') prefetchByPath('/profile');
          if (path === 'schools') prefetchByPath('/admin');
          if (path === 'dashboard') prefetchByPath('/home');
        }}
      />

      {/* Main - static data for now; TODO: replace with API */}
      <main className="admin-main">
        <div className="mb-4 flex items-center justify-between border-b border-orange-100/60 pb-2 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-orange-200/60 bg-white/70 p-2"
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
          <AdminPageTitle activeNav={activeNav} className="!text-3xl" />
          <div />
        </div>

        <AdminPageTitle activeNav={activeNav} className="mb-6 hidden md:block" />

        {activeNav === 'dashboard' && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="admin-card">
                <p className="font-display text-3xl font-bold text-blue-600">{STATIC_TOTAL_STUDENTS}</p>
                <p className="mt-1 font-label text-gray-600">Total Students</p>
              </div>
              <div className="admin-card">
                <p className="font-display text-3xl font-bold text-blue-600">{schoolsAddedCount}</p>
                <p className="mt-1 font-label text-gray-600">Schools Added</p>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="admin-section-title mb-4">Recent Uploads</h2>
              <div className="admin-list-panel">
                {STATIC_RECENT_UPLOADS.map((name, i) => (
                  <div key={i} className="admin-list-row cursor-pointer">
                    <span className="font-script text-xl text-gray-700">{name}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="admin-section-title mb-4">Quiz Attempts</h2>
              <div className="admin-list-panel">
                {STATIC_QUIZ_ATTEMPTS.map((name, i) => (
                  <div key={i} className="admin-list-row cursor-pointer">
                    <span className="font-script text-xl text-gray-700">{name}</span>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeNav === 'students' && (
          <div className="admin-list-panel">
            {STATIC_STUDENTS_LIST.map((s) => (
              <div key={s.id} className="admin-list-row">
                <div>
                  <span className={`font-script text-xl ${getScriptNameColor(s.id)}`}>{s.name}</span>
                  <span className="ml-2 font-body text-sm text-gray-500">{s.email}</span>
                </div>
                <span className={s.status === 'active' ? 'admin-status-pill-active' : 'admin-status-pill'}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeNav === 'events' && (
          <div className="admin-panel">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    {['S No', 'Event Name', 'Status', 'From Date', 'To Date', 'Active'].map((label, i) => (
                      <th key={label} className={`whitespace-nowrap ${EVENT_TABLE_HEADER_COLORS[i]}`}>
                        {label}
                      </th>
                    ))}
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
                        <tr key={String(event.id)}>
                          <td className="whitespace-nowrap">{idx + 1}</td>
                          <td className={`font-script text-2xl ${getScriptNameColor(idx)}`}>
                            {event.name || '-'}
                          </td>
                          <td className="whitespace-nowrap">
                            <span className={isActive ? 'admin-status-pill-active' : 'admin-status-pill'}>
                              {event.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap text-gray-700">
                            {event.fromDate ? String(event.fromDate).slice(0, 10) : '-'}
                          </td>
                          <td className="whitespace-nowrap text-gray-700">
                            {event.toDate ? String(event.toDate).slice(0, 10) : '-'}
                          </td>
                          <td className="whitespace-nowrap">
                            <label className="flex cursor-pointer items-center gap-2 text-gray-700">
                              <input
                                type="checkbox"
                                className="admin-checkbox"
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
              <h3 className="admin-section-title mb-2">Activate Event</h3>
              <p className="text-sm text-gray-500 mb-4">{activationTargetEvent.name || 'Selected event'}</p>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm text-gray-700">From Date</span>
                  <input
                    type="date"
                    value={activationForm.fromDate}
                    onChange={(e) => {
                      setActivationForm((prev) => ({ ...prev, fromDate: e.target.value }));
                      setActivationFormErrors((prev) => ({ ...prev, fromDate: undefined }));
                    }}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                      activationFormErrors.fromDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {activationFormErrors.fromDate ? (
                    <p className="mt-1 text-xs text-red-600">{activationFormErrors.fromDate}</p>
                  ) : null}
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">To Date</span>
                  <input
                    type="date"
                    value={activationForm.toDate}
                    onChange={(e) => {
                      setActivationForm((prev) => ({ ...prev, toDate: e.target.value }));
                      setActivationFormErrors((prev) => ({ ...prev, toDate: undefined }));
                    }}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 ${
                      activationFormErrors.toDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {activationFormErrors.toDate ? (
                    <p className="mt-1 text-xs text-red-600">{activationFormErrors.toDate}</p>
                  ) : null}
                </label>
              </div>
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeActivationModal}
                  className="theme-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmActivation}
                  disabled={updateEventStatusMutation.isPending}
                  className="admin-btn-primary disabled:opacity-50"
                >
                  Save & Activate
                </button>
              </div>
            </div>
          </div>
        )}

        {activeNav === 'quiz' && (
          <div className="admin-card p-6 text-gray-500">
            No quiz records yet.
          </div>
        )}

        {activeNav === 'promotors' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="admin-section-title">Promoters</h2>
                <p className="text-sm text-gray-500">Add a promoter (admin) and it will appear below.</p>
              </div>
              <button
                onClick={() => {
                  setPromoterForm(INITIAL_PROMOTER_FORM);
                  setPromoterFormErrors({});
                  if (canManageAdminData) setShowAddPromoter(true);
                }}
                disabled={!canManageAdminData}
                className="admin-btn-primary"
              >
                Add Promoter
              </button>
            </div>

            <div className="admin-panel">
            <div className="overflow-x-auto">
              <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">S No</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Name</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Mobile number</th>
                      <th className="max-w-[180px] whitespace-normal font-label text-xs font-bold uppercase tracking-wide text-gray-700">Email</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Promocode</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">
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
                          <tr key={p.id} className="border-b border-gray-100 hover:bg-white/40">
                            <td className="px-5 py-4 whitespace-nowrap">{promotersStartIndex + idx + 1}</td>
                            <td className="px-5 py-4">
                              <span style={twoLineEllipsisStyle} className="font-script text-xl text-gray-800">
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
                                  className="admin-checkbox"
                                  checked={isActive}
                                  aria-label={`Set promoter ${p.name || ''} status to ${isActive ? 'inactive' : 'active'}`}
                                  disabled={!canManageAdminData || updatePromotorStatusMutation.isPending}
                                  onChange={(e) => handleTogglePromoterStatus(p, e.target.checked)}
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
                <h2 className="admin-section-title">Schools</h2>
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
                  className="admin-btn-primary"
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

            <div className="admin-panel">
            <div className="overflow-x-auto">
              <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">S No</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">School Name</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">branchCode</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Mobile Number</th>
                      <th className="max-w-[180px] whitespace-normal font-label text-xs font-bold uppercase tracking-wide text-gray-700">Email</th>
                      <th className="font-label text-xs font-bold uppercase tracking-wide text-gray-700">Address</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Total students</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Active</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Action</th>
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
                          <tr key={s.id} className="border-b border-gray-100 hover:bg-white/40">
                            <td className="px-5 py-4 whitespace-nowrap">{listOffset + idx + 1}</td>
                            <td className="px-5 py-4">
                              <span style={twoLineEllipsisStyle} className="font-script text-xl text-gray-800">
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
                                    className="admin-checkbox"
                                    checked={isActive}
                                    disabled={!canManageAdminData || updateSchoolStatusMutation.isPending}
                                    aria-label={`Set school ${s.name} status to ${isActive ? 'inactive' : 'active'}`}
                                    onChange={(e) => handleToggleSchoolStatus(s, e.target.checked)}
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
                <h2 className="admin-section-title">Influencers</h2>
                <p className="text-sm text-gray-500">Add an influencer (admin) and it will appear below.</p>
              </div>
              <button
                type="button"
                disabled={!canManageAdminData}
                className="admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (!canManageAdminData) {
                    notifyError('Only admin can add influencers.');
                    return;
                  }
                  setInfluencerForm(INITIAL_INFLUENCER_FORM);
                  setInfluencerFormErrors({});
                  setShowAddInfluencer(true);
                }}
              >
                Add Influencer
              </button>
            </div>
            <div className="admin-panel">
            <div className="overflow-x-auto">
              <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">S No</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Name</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Mobile number</th>
                      <th className="max-w-[180px] whitespace-normal font-label text-xs font-bold uppercase tracking-wide text-gray-700">Email</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Promocode</th>
                      <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {influencersAdded.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-gray-500">
                          No influencers added yet.
                        </td>
                      </tr>
                    ) : (
                      pagedInfluencersAdded.map((row, idx) => {
                        const isActive = (row.status || 'active') === 'active';
                        return (
                          <tr key={row.id} className="border-b border-gray-100 hover:bg-white/40">
                            <td className="px-5 py-4 whitespace-nowrap">{influencersStartIndex + idx + 1}</td>
                            <td className="px-5 py-4">
                              <span style={twoLineEllipsisStyle} className="font-script text-xl text-gray-800">
                                {row.name || '-'}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                              {row.phone ? (
                                <span style={twoLineEllipsisStyle}>{row.phone}</span>
                              ) : (
                                <span style={twoLineEllipsisStyle} className="text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-gray-700 max-w-[180px] whitespace-normal">
                              {row.email ? (
                                <span style={twoLineEllipsisStyle}>{row.email}</span>
                              ) : (
                                <span style={twoLineEllipsisStyle} className="text-gray-400">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                              {row.promoCode ? (
                                <span style={twoLineEllipsisStyle}>{row.promoCode}</span>
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
                                  className="admin-checkbox"
                                  checked={isActive}
                                  aria-label={`Set influencer ${row.name || ''} status to ${isActive ? 'inactive' : 'active'}`}
                                  disabled={!canManageAdminData || updateInfluencerStatusMutation.isPending}
                                  onChange={(e) => handleToggleInfluencerStatus(row, e.target.checked)}
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

            {influencersAdded.length > INFLUENCERS_PAGE_SIZE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setInfluencersPage((p) => Math.max(1, p - 1))}
                  disabled={influencersPage <= 1}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <div className="text-sm text-gray-600">
                  Page {influencersPage} of {influencersTotalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setInfluencersPage((p) => Math.min(influencersTotalPages, p + 1))}
                  disabled={influencersPage >= influencersTotalPages}
                  className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}

            {showAddInfluencer && (
              <Suspense fallback={<div className="fixed inset-0 z-40 bg-black/40" />}>
                <AdminInfluencerFormModal
                  value={influencerForm}
                  errors={influencerFormErrors}
                  submitting={influencerSubmitting}
                  onChange={(field, value) => setInfluencerForm((prev) => ({ ...prev, [field]: value }))}
                  onCancel={() => {
                    setShowAddInfluencer(false);
                    setInfluencerForm(INITIAL_INFLUENCER_FORM);
                    setInfluencerFormErrors({});
                    setInfluencerSubmitting(false);
                  }}
                  onSubmit={handleAddInfluencer}
                />
              </Suspense>
            )}
          </div>
        )}

        {activeNav === 'partners' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="admin-section-title">Partners</h2>
                <p className="text-sm text-gray-500">
                  Partners have super admin–level access. Account credentials are never shown here.
                </p>
              </div>
              <button
                type="button"
                disabled={!canManageAdminData}
                className="admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
                  className="theme-input w-full sm:w-40 !py-2"
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
                        <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">S No</th>
                        <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Name</th>
                        <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Email</th>
                        <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Mobile</th>
                        <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Status</th>
                        {canManageAdminData && (
                          <th className="whitespace-nowrap font-label text-xs font-bold uppercase tracking-wide text-gray-700">Actions</th>
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
                          <tr key={String(row.id)} className="border-b border-gray-100 hover:bg-white/40">
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
                        className="theme-btn-ghost border border-orange-200/70 !text-sm disabled:opacity-50"
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
                        className="theme-btn-ghost border border-orange-200/70 !text-sm disabled:opacity-50"
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
                  <h3 className="admin-section-title mb-4">Add Partner</h3>
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
                      className="theme-btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreatePartner}
                      disabled={createPartnerMutation.isPending}
                      className="admin-btn-primary disabled:opacity-50"
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
                  <h3 className="admin-section-title mb-1">Reset password</h3>
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
                      className="theme-btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitResetPartnerPassword}
                      disabled={resetPartnerPasswordMutation.isPending}
                      className="admin-btn-primary disabled:opacity-50"
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
