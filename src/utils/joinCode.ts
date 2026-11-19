const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomBlock(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

/** Generates a family code in the format "FAM-72AB-91QX" (MVP_SPEC §4). */
export function generateJoinCode(): string {
  return `FAM-${randomBlock(4)}-${randomBlock(4)}`;
}

/** Normalizes user input (trim, uppercase). */
export function normalizeJoinCode(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidJoinCode(code: string): boolean {
  return /^FAM-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code);
}
