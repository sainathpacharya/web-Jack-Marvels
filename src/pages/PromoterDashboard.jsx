import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STATIC_SCHOOLS_ADDED, STATIC_PROMOTER_HISTORY } from '../data/staticData';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: 'dashboard' },
  { label: 'History', path: 'history' },
];

const MOBILE_REGEX = /^[6-9]\d{9}$/;

const initialSchoolForm = () => ({
  name: '',
  hasBranches: false,
  branchCode: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  contactName: '',
  contactPhone: '',
});

const PROMOTER_SCHOOLS_KEY = 'promoterSchools';
const getPromoterSchools = () => {
  try {
    const raw = localStorage.getItem(PROMOTER_SCHOOLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const savePromoterSchool = (school) => {
  const list = getPromoterSchools();
  list.push(school);
  localStorage.setItem(PROMOTER_SCHOOLS_KEY, JSON.stringify(list));
};

export default function PromoterDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [schoolsAdded, setSchoolsAdded] = useState([...STATIC_SCHOOLS_ADDED]);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [schoolForm, setSchoolForm] = useState(initialSchoolForm());

  useEffect(() => {
    const list = getPromoterSchools();
    if (list.length === 0) localStorage.setItem(PROMOTER_SCHOOLS_KEY, JSON.stringify(STATIC_SCHOOLS_ADDED));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleSchoolFormChange = (field, value) => {
    setSchoolForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSchool = () => {
    const name = schoolForm.name?.trim();
    if (!name) {
      alert('Please enter school name.');
      return;
    }
    if (!schoolForm.address?.trim()) {
      alert('Please enter address.');
      return;
    }
    if (!schoolForm.city?.trim()) {
      alert('Please enter city.');
      return;
    }
    if (!schoolForm.state?.trim()) {
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
    if (!schoolForm.contactName?.trim()) {
      alert('Please enter contact person name.');
      return;
    }
    const contactPhone = schoolForm.contactPhone?.trim().replace(/\s/g, '');
    if (!contactPhone) {
      alert('Please enter mobile number.');
      return;
    }
    if (!MOBILE_REGEX.test(contactPhone)) {
      alert('Please enter a valid 10-digit mobile number (starting with 6, 7, 8 or 9).');
      return;
    }
    if (schoolForm.hasBranches) {
      const branchCode = schoolForm.branchCode?.trim();
      if (!branchCode) {
        alert('Branch code is required when school has branches.');
        return;
      }
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const promoterId = currentUser.promoterId ?? 1;
    const school = {
      id: Date.now(),
      name,
      branchCode: schoolForm.hasBranches ? (schoolForm.branchCode?.trim() || '') : '',
      address: schoolForm.address.trim(),
      city: schoolForm.city.trim(),
      state: schoolForm.state.trim(),
      pincode: pincode,
      contactName: schoolForm.contactName.trim(),
      contactPhone,
      addedAt: new Date().toISOString().slice(0, 10),
      addedByPromoterId: promoterId,
    };
    setSchoolsAdded([...schoolsAdded, school]);
    savePromoterSchool(school);
    setSchoolForm(initialSchoolForm());
    setShowAddSchool(false);
  };

  // History: from schools added (newest first) then static entries
  const historyFromSchools = schoolsAdded
    .map((s) => ({ id: s.id, action: 'Added school', name: s.name, date: s.addedAt }))
    .sort((a, b) => (b.date > a.date ? 1 : -1));
  const historyEntries = [...historyFromSchools, ...STATIC_PROMOTER_HISTORY.filter((h) => !schoolsAdded.some((s) => s.name === h.name && s.addedAt === h.date))];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <span className="text-2xl font-bold text-amber-700">JACK</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveNav(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                activeNav === item.path ? 'bg-amber-100 text-amber-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
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

      {/* Main - static data for now; TODO: replace with API */}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {activeNav === 'dashboard' ? 'PROMOTER DASHBOARD' : 'History'}
        </h1>

        {activeNav === 'dashboard' && (
          <>
            <div className="mb-6">
              <button
                onClick={() => setShowAddSchool(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
              >
                Add School
              </button>
            </div>
            <div>
              <p className="text-sm text-amber-700 mb-2">Schools you add are eligible for your promo code discount.</p>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Schools Added</h2>
              <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
                {schoolsAdded.length === 0 ? (
                  <p className="px-5 py-8 text-gray-500">No schools added yet. Click &quot;Add School&quot; to add one.</p>
                ) : (
                  schoolsAdded.map((school) => (
                    <div key={school.id} className="px-5 py-4 hover:bg-gray-50 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800">
                          {school.name}
                          {school.branchCode && <span className="text-amber-600 font-normal ml-2">(Branch: {school.branchCode})</span>}
                        </p>
                        {school.address && <p className="text-sm text-gray-600">{school.address}</p>}
                        {(school.city || school.state || school.pincode) && (
                          <p className="text-sm text-gray-500">
                            {[school.city, school.state, school.pincode].filter(Boolean).join(', ')}
                          </p>
                        )}
                        {(school.contactName || school.contactPhone) && (
                          <p className="text-sm text-gray-500">
                            {school.contactName}
                            {school.contactName && school.contactPhone ? ' · ' : ''}
                            {school.contactPhone}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Added on {school.addedAt}</p>
                      </div>
                      <span className="text-gray-400 flex-shrink-0">→</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeNav === 'history' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {historyEntries.length === 0 ? (
              <p className="px-5 py-8 text-gray-500">No history yet.</p>
            ) : (
              historyEntries.map((h) => (
                <div key={`${h.id}-${h.date}`} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <span className="text-gray-700">{h.action}: <strong>{h.name}</strong></span>
                  <span className="text-gray-500 text-sm">{h.date}</span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Add School modal */}
      {showAddSchool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add School</h3>
            <p className="text-sm text-gray-600 mb-4">Schools you add are eligible for your promo code discount.</p>
            <div className="space-y-3">
              <input
                value={schoolForm.name}
                onChange={(e) => handleSchoolFormChange('name', e.target.value)}
                placeholder="School name *"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <textarea
                value={schoolForm.address}
                onChange={(e) => handleSchoolFormChange('address', e.target.value)}
                placeholder="Address *"
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={schoolForm.city}
                  onChange={(e) => handleSchoolFormChange('city', e.target.value)}
                  placeholder="City *"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <input
                  value={schoolForm.state}
                  onChange={(e) => handleSchoolFormChange('state', e.target.value)}
                  placeholder="State *"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <input
                value={schoolForm.pincode}
                onChange={(e) => handleSchoolFormChange('pincode', e.target.value)}
                placeholder="Pincode * (6 digits)"
                className="w-full p-3 border border-gray-300 rounded-lg"
                maxLength={6}
              />
              <input
                value={schoolForm.contactName}
                onChange={(e) => handleSchoolFormChange('contactName', e.target.value)}
                placeholder="Contact person name *"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                value={schoolForm.contactPhone}
                onChange={(e) => handleSchoolFormChange('contactPhone', e.target.value)}
                placeholder="Mobile number * (10 digits, 6–9 start)"
                type="tel"
                maxLength={10}
                className={`w-full p-3 border rounded-lg ${schoolForm.contactPhone && !MOBILE_REGEX.test(schoolForm.contactPhone.trim().replace(/\s/g, '')) ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {schoolForm.contactPhone && !MOBILE_REGEX.test(schoolForm.contactPhone.trim().replace(/\s/g, '')) && (
                <p className="text-sm text-red-600">Enter a valid 10-digit mobile number (starting with 6, 7, 8 or 9).</p>
              )}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Does the school have branches?</span>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasBranches"
                      checked={schoolForm.hasBranches === true}
                      onChange={() => handleSchoolFormChange('hasBranches', true)}
                      className="w-4 h-4 text-amber-600"
                    />
                    <span>Yes, has branches</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasBranches"
                      checked={schoolForm.hasBranches === false}
                      onChange={() => handleSchoolFormChange('hasBranches', false)}
                      className="w-4 h-4 text-amber-600"
                    />
                    <span>No branches</span>
                  </label>
                </div>
              </div>
              {schoolForm.hasBranches && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Branch code * (required when school has branches)</label>
                  <input
                    value={schoolForm.branchCode}
                    onChange={(e) => handleSchoolFormChange('branchCode', e.target.value)}
                    placeholder="e.g. BR01, Main, North"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => { setShowAddSchool(false); setSchoolForm(initialSchoolForm()); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleAddSchool} className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Add School
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
