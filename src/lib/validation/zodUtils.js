import { z } from 'zod';

/**
 * @param {import('zod').ZodError} zodError
 * @returns {Record<string, string>}
 */
export function zodErrorToFieldErrors(zodError) {
  const out = {};
  for (const issue of zodError.issues) {
    const key = issue.path.length ? issue.path.join('.') : '_root';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * @param {import('zod').ZodError} zodError
 * @returns {Record<string, string>} first segment keys for flat forms
 */
export function zodErrorToFlatFieldErrors(zodError) {
  const out = {};
  for (const issue of zodError.issues) {
    const key = issue.path.length ? String(issue.path[0]) : '_root';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
