/**
 * @creadev.org/encrypt
 *
 * Encryption utils using Web Crypto API.
 *
 * EXAMPLES:
 * ```typescript
 * import { generateId, hash, encrypt, decrypt } from '@creadev.org/encrypt';
 *
 * const id = generateId();
 * const hash = await hash('data');
 * ```
 * ============================================================================
 */

// ============================================================================
// CONFIG
// ============================================================================

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

// ============================================================================
// STATE
// ============================================================================

let _crypto: CryptoKey | null = null;

// ============================================================================
// ID GENERATION
// ============================================================================

/** Generate UUID-style ID */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Generate short ID */
export function generateShortId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/** Generate token */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// KEY MANAGEMENT
// ============================================================================

/** Generate encryption key from password */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Generate key from password string */
export async function generateKey(password: string): Promise<Uint8Array> {
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);
  const key = await deriveKey(password, salt);
  const exported = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

// ============================================================================
// ENCRYPT/DECRYPT
// ============================================================================

/** Encrypt data */
export async function encrypt(
  data: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(data);

  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);

  const iv = new Uint8Array(IV_LENGTH);
  crypto.getRandomValues(iv);

  const key = await deriveKey(password, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    plaintext
  );

  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  // Base64 encode
  return btoa(String.fromCharCode(...combined));
}

/** Decrypt data */
export async function decrypt(
  encrypted: string,
  password: string
): Promise<string> {
  const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintext);
}

// ============================================================================
// HASH
// ============================================================================

/** Hash data (SHA-256) */
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// SIGN
// ============================================================================

/** Generate keypair for signing */
export async function generateSignKey(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
}

/** Sign data */
export async function sign(
  data: string,
  key: CryptoKey
): Promise<string> {
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(data)
  );
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
}

/** Verify signature */
export async function verify(
  data: string,
  signature: string,
  key: CryptoKey
): Promise<boolean> {
  const encoder = new TextEncoder();
  return crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(data),
    Uint8Array.from(signature.match(/.{1,2}/g)!, hex => parseInt(hex, 16))
  );
}