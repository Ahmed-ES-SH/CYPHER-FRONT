import CryptoJS from "crypto-js";

/**
 * Decrypts a token previously encrypted with AES using crypto-js.
 * Safe for use in Next.js Client Components.
 */
export function decryptToken(encryptedToken: string): string | null {
  if (!encryptedToken) return null;

  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;

  if (!SECRET_KEY) {
    throw new Error("Decryption key (NEXT_PUBLIC_SECRET_KEY) is missing");
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);

    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error("Decryption failed: Invalid key or corrupted data");
    }

    return decryptedText;
  } catch (error) {
    console.error("Error during decryption:", error);
    return "";
  }
}
