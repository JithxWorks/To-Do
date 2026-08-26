export function createId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}
