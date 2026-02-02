/**
 * Static / mock data for all dashboards and pages.
 * TODO: Replace with API calls when backend is ready.
 */

// --- Super Admin ---
export const STATIC_SCHOOLS = [
  { id: 1, name: 'Green Valley High' },
  { id: 2, name: 'Sunrise Public School' },
  { id: 3, name: 'Blue Ridge Academy' },
];

export const STATIC_PROMOTERS = [];

export const STATIC_SPONSORS = [
  { id: 1, name: 'Sponsor A' },
  { id: 2, name: 'Sponsor B' },
  { id: 3, name: 'Sponsor C' },
  { id: 4, name: 'Sponsor D' },
  { id: 5, name: 'Sponsor E' },
];

export const STATIC_WEEKLY_QUIZ_TITLES = [
  'Quiz Title 1', 'Quiz Title 2', 'Quiz Title 2', 'Quiz 4 Title 2',
  'Quiz 5 Title 3', 'Quiz 5 Title 4', 'Quiz Title 4', 'Quiz Title 4',
];

// Promo codes: discount for schools added by promoter when promoterId is set
export const STATIC_PROMO_CODES = [
  { code: 'WELCOME20', discount: '20%', promoterId: null, promoterName: null },
  { code: 'EVENT50', discount: '50%', promoterId: null, promoterName: null },
];

// --- Admin ---
export const STATIC_TOTAL_STUDENTS = 20;

export const STATIC_RECENT_UPLOADS = [
  'Student Name 1', 'Student Name 2', 'Student Name 2',
  'Student Name 4', 'Student Name 3', 'Student Name 6',
];

export const STATIC_QUIZ_ATTEMPTS = [
  'Student Name 4', 'Student Name 5', 'Student Name 8', 'Student Name 6',
];

export const STATIC_STUDENTS_LIST = [
  { id: 1, name: 'Student Name 1', email: 'student1@example.com', status: 'active' },
  { id: 2, name: 'Student Name 2', email: 'student2@example.com', status: 'active' },
  { id: 3, name: 'Student Name 3', email: 'student3@example.com', status: 'inactive' },
  { id: 4, name: 'Student Name 4', email: 'student4@example.com', status: 'active' },
  { id: 5, name: 'Student Name 5', email: 'student5@example.com', status: 'active' },
  { id: 6, name: 'Student Name 6', email: 'student6@example.com', status: 'active' },
];

export const STATIC_UPLOADS_LIST = [
  { id: 1, title: 'Dance Performance', student: 'Student Name 1', date: '2025-01-28' },
  { id: 2, title: 'Singing Entry', student: 'Student Name 2', date: '2025-01-27' },
  { id: 3, title: 'Science Project', student: 'Student Name 4', date: '2025-01-26' },
  { id: 4, title: 'Poetry Recitation', student: 'Student Name 3', date: '2025-01-25' },
];

// --- Promoter (schools added by this promoter; eligible for promoter's promo discount) ---
export const STATIC_SCHOOLS_ADDED = [
  { id: 1, name: 'School Name 1', branchCode: '', address: '123 Main St', city: 'Hyderabad', state: 'Telangana', pincode: '500001', contactName: 'Principal', contactPhone: '9876543210', addedAt: '2025-01-20', addedByPromoterId: 1 },
  { id: 2, name: 'School Name 2', branchCode: 'BR2', address: '456 Oak Ave', city: 'Secunderabad', state: 'Telangana', pincode: '500003', contactName: '', contactPhone: '', addedAt: '2025-01-18', addedByPromoterId: 1 },
  { id: 3, name: 'School Name 3', branchCode: '', address: '', city: '', state: '', pincode: '', contactName: '', contactPhone: '', addedAt: '2025-01-15', addedByPromoterId: 1 },
];

export const STATIC_PROMOTER_HISTORY = [
  { id: 1, action: 'Added school', name: 'School Name 1', date: '2025-01-20' },
  { id: 2, action: 'Added school', name: 'School Name 2', date: '2025-01-18' },
  { id: 3, action: 'Added school', name: 'School Name 3', date: '2025-01-15' },
];
