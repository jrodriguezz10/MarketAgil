const ADMIN_TOKEN_STORAGE_KEY = 'token';

const parseStoredToken = (storedValue: string): string | null => {
  try {
    if (storedValue.startsWith('{')) {
      return JSON.parse(storedValue).token ?? null;
    }
  } catch {}

  return storedValue;
};

const getStoredToken = (storageKey: string): string | null => {
  const storedValue = globalThis.localStorage.getItem(storageKey);
  if (!storedValue) return null;

  const token = parseStoredToken(storedValue);
  if (token && token.split('.').length === 3) return token;
  return null;
};

export function getToken(): string | null {
  return getStoredToken(ADMIN_TOKEN_STORAGE_KEY);
}
