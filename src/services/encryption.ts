export class EncryptionManager {
    private key: CryptoKey | null = null;
    private readonly storageKey = 'encryption_key_salt';
    private readonly algorithm = { name: 'AES-GCM', length: 256 };
  
    constructor() {
      this.initializeKey();
    }
  
    private async initializeKey(): Promise<void> {
      // Try to get existing salt from localStorage
      const storedSalt = localStorage.getItem(this.storageKey);
      
      if (storedSalt) {
        // Derive key from stored salt
        this.key = await this.deriveKey(storedSalt);
      } else {
        // Generate new salt and derive key
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltString = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
        localStorage.setItem(this.storageKey, saltString);
        this.key = await this.deriveKey(saltString);
      }
    }
  
    private async deriveKey(salt: string): Promise<CryptoKey> {
      // Convert salt string back to Uint8Array
      const saltArray = new Uint8Array(salt.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
      
      // Create a key from the salt
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        saltArray,
        'PBKDF2',
        false,
        ['deriveKey']
      );
  
      // Derive the actual encryption key
      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltArray,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        this.algorithm,
        false,
        ['encrypt', 'decrypt']
      );
    }
  
    async encrypt<T>(data: T): Promise<string> {
      if (!this.key) {
        await this.initializeKey();
      }
  
      try {
        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Convert data to string
        const jsonString = JSON.stringify(data);
        const encodedData = new TextEncoder().encode(jsonString);
  
        // Encrypt the data
        const encryptedData = await crypto.subtle.encrypt(
          {
            name: 'AES-GCM',
            iv: iv
          },
          this.key!,
          encodedData
        );
  
        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);
  
        // Convert to base64 string for storage
        return btoa(String.fromCharCode(...combined));
      } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt data');
      }
    }
  
    async decrypt<T>(encryptedString: string): Promise<T> {
      if (!this.key) {
        await this.initializeKey();
      }
  
      try {
        // Convert base64 string back to Uint8Array
        const combined = new Uint8Array(
          atob(encryptedString).split('').map(char => char.charCodeAt(0))
        );
  
        // Extract IV and encrypted data
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);
  
        // Decrypt the data
        const decryptedData = await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: iv
          },
          this.key!,
          encryptedData
        );
  
        // Convert decrypted data back to object
        const jsonString = new TextDecoder().decode(decryptedData);
        return JSON.parse(jsonString) as T;
      } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data');
      }
    }
  
    async clearKey(): Promise<void> {
      this.key = null;
      localStorage.removeItem(this.storageKey);
    }
  }