const SALT = 'futur-notes-2024';

export function hashPassword(password: string): string {
  let hash = 0;
  const str = password + SALT;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function verifyPassword(input: string, hashed: string): boolean {
  return hashPassword(input) === hashed;
}
