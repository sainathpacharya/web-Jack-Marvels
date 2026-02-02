import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  STATIC_SCHOOLS,
  STATIC_PROMOTERS,
  STATIC_SPONSORS,
  STATIC_WEEKLY_QUIZ_TITLES,
  STATIC_PROMO_CODES,
} from '../data/staticData';

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
  const [activeNav, setActiveNav] = useState('dashboard');
  const [schools, setSchools] = useState([...STATIC_SCHOOLS]);
  const [promoters, setPromoters] = useState([...STATIC_PROMOTERS]);
  const [sponsors, setSponsors] = useState([...STATIC_SPONSORS]);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showAddPromoter, setShowAddPromoter] = useState(false);
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [showAddVideoByte, setShowAddVideoByte] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [promoterForm, setPromoterForm] = useState({
    name: '',
    email: '',
    mobile: '',
    photo: null,
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
  const [videoBytes, setVideoBytes] = useState([]);
  const [promoCodes, setPromoCodes] = useState([...STATIC_PROMO_CODES]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleAddSchool = () => {
    if (newSchoolName.trim()) {
      setSchools([...schools, { id: Date.now(), name: newSchoolName.trim() }]);
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
    setPromoterForm({
      name: '',
      email: '',
      mobile: '',
      photo: null,
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
    const { name, email, mobile, address } = promoterForm;
    if (!name?.trim()) {
      alert('Please enter promoter name.');
      return;
    }
    if (!email?.trim()) {
      alert('Please enter email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!mobile?.trim()) {
      alert('Please enter mobile number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim().replace(/\s/g, ''))) {
      alert('Please enter a valid 10-digit mobile number (starting with 6-9).');
      return;
    }
    if (!address?.trim()) {
      alert('Please enter address.');
      return;
    }
    const discountVal = promoterForm.discountPercent?.trim();
    if (!discountVal) {
      alert('Please enter discount % for the promoter\'s promo code (discount for schools they add).');
      return;
    }
    const discountNum = parseInt(discountVal, 10);
    if (isNaN(discountNum) || discountNum < 1 || discountNum > 100) {
      alert('Discount % must be between 1 and 100.');
      return;
    }
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
    setPromoters([...promoters, promoter]);
    // Create promo code for this promoter — discount applies to schools added by this promoter
    const codeRaw = promoterForm.promoCode?.trim();
    const promoCode = codeRaw || `PROMO_${String(promoterId).slice(-6)}`;
    setPromoCodes((prev) => [
      ...prev,
      {
        code: promoCode,
        discount: `${discountNum}%`,
        promoterId,
        promoterName: promoter.name,
      },
    ]);
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
      setSponsors([...sponsors, { id: Date.now(), name: newSponsorName.trim() }]);
      setNewSponsorName('');
      setShowAddSponsor(false);
    }
  };
  const handleAddVideoByte = () => {
    if (newVideoByteTitle.trim()) {
      setVideoBytes([...videoBytes, { id: Date.now(), title: newVideoByteTitle.trim() }]);
      setNewVideoByteTitle('');
      setShowAddVideoByte(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 shadow-sm flex flex-col">
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
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
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
          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {schools.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <span className="text-gray-700">{s.name}</span>
                <span className="text-gray-400">→</span>
              </div>
            ))}
          </div>
        )}
        {activeNav === 'promoters' && (
          <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-100">
            {promoters.length === 0 ? (
              <p className="px-5 py-8 text-gray-500">No promoters yet. Use &quot;Add Promoter&quot; on Dashboard.</p>
            ) : (
              promoters.map((p) => {
                const linkedPromo = promoCodes.find((c) => c.promoterId === p.id);
                return (
                  <div key={p.id} className="px-5 py-4 hover:bg-gray-50 flex items-start gap-4">
                    {p.photo && (
                      <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-sm text-gray-600">{p.email}</p>
                      {p.mobile && <p className="text-sm text-gray-600">Mobile: {p.mobile}</p>}
                      {p.address && <p className="text-sm text-gray-500 truncate" title={p.address}>{p.address}</p>}
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
                onChange={(e) => handlePromoterFormChange('name', e.target.value)}
                placeholder="Full name *"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                value={promoterForm.email}
                onChange={(e) => handlePromoterFormChange('email', e.target.value)}
                placeholder="Email ID *"
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <input
                value={promoterForm.mobile}
                onChange={(e) => handlePromoterFormChange('mobile', e.target.value)}
                placeholder="Mobile number * (10 digits)"
                type="tel"
                maxLength={10}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
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
                onChange={(e) => handlePromoterFormChange('referralCode', e.target.value)}
                placeholder="Referral code (if any)"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              <textarea
                value={promoterForm.address}
                onChange={(e) => handlePromoterFormChange('address', e.target.value)}
                placeholder="Address *"
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              />
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
                onChange={(e) => handlePromoterFormChange('pincode', e.target.value)}
                placeholder="Pincode"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
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
                  onChange={(e) => handlePromoterFormChange('promoCode', e.target.value)}
                  placeholder="Promo code (optional — auto-generated if blank)"
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                />
                <input
                  value={promoterForm.discountPercent}
                  onChange={(e) => handlePromoterFormChange('discountPercent', e.target.value)}
                  placeholder="Discount % * (1–100)"
                  type="number"
                  min={1}
                  max={100}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
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
  );
}
