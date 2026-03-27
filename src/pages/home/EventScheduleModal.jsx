import React, { memo } from 'react';

function EventScheduleModal({
  open,
  selectedEvent,
  fromValue,
  toValue,
  onClose,
  onFromChange,
  onToChange,
  onSave,
  getEventState,
  formatRemaining,
}) {
  if (!open || !selectedEvent) return null;
  const { isActive, remainingMs } = getEventState(selectedEvent);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Set Event Dates</h3>
            <p className="text-sm text-gray-500 mt-1">{selectedEvent.name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-lg">✕</button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input type="datetime-local" value={fromValue} onChange={(e) => onFromChange(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input type="datetime-local" value={toValue} onChange={(e) => onToChange(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <div className="text-sm text-gray-700 font-medium">
              Current Status: <span className={isActive ? 'text-green-700' : 'text-gray-600'}>{isActive ? 'Active' : 'Inactive'}</span>
            </div>
            {isActive ? (
              <div className="text-sm text-gray-600 mt-1">Remaining time: <span className="font-medium">{formatRemaining(remainingMs)}</span></div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3 mt-5 pt-3 border-t border-gray-100">
          <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={onSave} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save & Set Active</button>
        </div>
      </div>
    </div>
  );
}

export default memo(EventScheduleModal);
