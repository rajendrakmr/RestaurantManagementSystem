const enc = new TextEncoder();
const dec = new TextDecoder();

const toArrayBuffer = (u8: Uint8Array): ArrayBuffer =>u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);

const getKeyFromPassword = async (
  password: string,
  salt: Uint8Array
) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt), // ✅ FIX HERE
      iterations: 150000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptData = async (data: any, password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await getKeyFromPassword(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(data))
  );

  return {
    cipher: btoa(
      String.fromCharCode(...new Uint8Array(encrypted))
    ),
    salt: Array.from(salt),
    iv: Array.from(iv),
  };
};

export const decryptData = async (
  encryptedObj: any,
  password: string
) => {
  const key = await getKeyFromPassword(
    password,
    new Uint8Array(encryptedObj.salt)
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(new Uint8Array(encryptedObj.iv)), // ✅ FIX
    },
    key,
    toArrayBuffer(
      Uint8Array.from(
        atob(encryptedObj.cipher),
        c => c.charCodeAt(0)
      )
    )
  );

  return JSON.parse(dec.decode(decrypted));
};
