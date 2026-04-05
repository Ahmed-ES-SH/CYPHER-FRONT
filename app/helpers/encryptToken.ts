import CryptoJS from "crypto-js";

/**
 * Encrypts a token using AES.
 * Safe to use in both Browser and Server environments.
 */
export function encryptToken(token: string): string {
  if (!token) {
    throw new Error("Token is required for encryption");
  }

  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;

  if (!SECRET_KEY) {
    throw new Error("Encryption key (NEXT_PUBLIC_SECRET_KEY) is missing");
  }

  const encrypted = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();

  return encrypted;
}

/**
 * Decrypts the token when needed
 */
export function decryptToken(cipherText: string): string {
  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY!;
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
