/**
 * This file contains utility functions for encrypting and decrypting data using the Web Crypto API.
 * It uses AES-GCM for encryption, which is an authenticated encryption algorithm, providing both confidentiality and integrity.
 * The encryption key is derived from the user's password using PBKDF2, which is a standard key derivation function.
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12; // 96 bits for AES-GCM

/**
 * Derives an encryption key from a password and salt using PBKDF2.
 * @param password The user's password.
 * @param salt The salt to use for key derivation.
 * @returns A Promise that resolves to a CryptoKey.
 */
async function getEncryptionKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a string using AES-GCM.
 * The salt and IV are generated randomly and prepended to the ciphertext.
 * @param data The string to encrypt.
 * @param password The password to use for encryption.
 * @returns A Promise that resolves to a base64-encoded string containing the salt, IV, and ciphertext.
 */
export async function encryptData(data: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await getEncryptionKey(password, salt);

  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    new TextEncoder().encode(data)
  );

  const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);

  // Convert to base64 to safely store in chrome.storage
  return btoa(String.fromCharCode.apply(null, Array.from(combined)));
}

/**
 * Decrypts a string that was encrypted with encryptData.
 * @param encryptedData The base64-encoded string containing the salt, IV, and ciphertext.
 * @param password The password to use for decryption.
 * @returns A Promise that resolves to the decrypted string.
 */
export async function decryptData(encryptedData: string, password: string): Promise<string> {
  const combined = new Uint8Array(Array.from(atob(encryptedData), c => c.charCodeAt(0)));

  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

  const key = await getEncryptionKey(password, salt);

  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decryptedContent);
}
