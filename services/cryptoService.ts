
// cryptoService.ts - Handles Web Crypto API for AES-GCM encryption

const getPbkdf2Key = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', 
    encoder.encode(password), 
    { name: 'PBKDF2' }, 
    false, 
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptData = async <T,>(data: T, password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getPbkdf2Key(password, salt);
  const dataString = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(dataString);

  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encodedData
  );

  const encryptedBytes = new Uint8Array(encryptedContent);
  const resultBuffer = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
  resultBuffer.set(salt, 0);
  resultBuffer.set(iv, salt.length);
  resultBuffer.set(encryptedBytes, salt.length + iv.length);

  return btoa(String.fromCharCode.apply(null, Array.from(resultBuffer)));
};

export const decryptData = async <T,>(encryptedBase64: string, password: string): Promise<T> => {
  try {
    const encryptedData = atob(encryptedBase64);
    const encryptedBytes = new Uint8Array(encryptedData.length).map((_, i) => encryptedData.charCodeAt(i));

    const salt = encryptedBytes.slice(0, 16);
    const iv = encryptedBytes.slice(16, 28);
    const data = encryptedBytes.slice(28);

    const key = await getPbkdf2Key(password, salt);
    
    const decryptedContent = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );

    const decryptedString = new TextDecoder().decode(decryptedContent);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Invalid password or corrupted data.");
  }
};
