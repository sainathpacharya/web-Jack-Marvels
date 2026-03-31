import React, { forwardRef, useId, useState } from 'react';
import { getPasswordStrength } from '../../../lib/passwordPolicy';

/**
 * Password input with optional visibility toggle and strength hint.
 * Does not log or expose the value.
 */
const PasswordField = forwardRef(function PasswordField(
  {
    error,
    className = '',
    showStrength = false,
    showRequirementsHint = false,
    requirementsHint,
    id: idProp,
    type: _typeIgnored,
    ...rest
  },
  ref
) {
  const genId = useId();
  const id = idProp || genId;
  const [visible, setVisible] = useState(false);
  const value = rest.value ?? '';
  const strength = showStrength && value ? getPasswordStrength(String(value)) : null;

  const strengthClass =
    strength?.label === 'strong'
      ? 'text-green-700'
      : strength?.label === 'medium'
        ? 'text-amber-700'
        : 'text-gray-600';

  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          {...rest}
          type={visible ? 'text' : 'password'}
          className={`w-full rounded-lg border p-3 pr-11 text-sm ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {showStrength && value ? (
        <p className={`mt-1 text-xs font-medium ${strengthClass}`} aria-live="polite">
          Strength: {strength?.label}
        </p>
      ) : null}
      {showRequirementsHint && requirementsHint ? (
        <p className="mt-1 text-xs text-gray-500">{requirementsHint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
});

export default PasswordField;
