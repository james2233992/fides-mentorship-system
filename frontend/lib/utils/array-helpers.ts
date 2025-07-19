/**
 * Safe array utilities to prevent runtime errors
 */

/**
 * Safely filter an array, returning empty array if input is not an array
 */
export function safeFilter<T>(
  data: T[] | null | undefined,
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] {
  if (!Array.isArray(data)) {
    console.warn('safeFilter called with non-array data:', data);
    return [];
  }
  return data.filter(predicate);
}

/**
 * Safely map over an array, returning empty array if input is not an array
 */
export function safeMap<T, U>(
  data: T[] | null | undefined,
  callback: (value: T, index: number, array: T[]) => U
): U[] {
  if (!Array.isArray(data)) {
    console.warn('safeMap called with non-array data:', data);
    return [];
  }
  return data.map(callback);
}

/**
 * Safely get array length, returning 0 if input is not an array
 */
export function safeLength(data: unknown[] | null | undefined): number {
  if (!Array.isArray(data)) {
    return 0;
  }
  return data.length;
}

/**
 * Ensure a value is an array, converting or returning empty array if not
 */
export function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data === null || data === undefined) {
    return [];
  }
  return [data];
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}