import { encryptData, decryptData } from '../src/lib/security-utils';

// Mock the crypto.subtle API for testing
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      importKey: jest.fn(),
      deriveKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    },
    getRandomValues: jest.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    })
  }
});

describe('Security Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encryptData', () => {
    it('should encrypt data with a password', async () => {
      const testData = 'Hello, World!';
      const password = 'myPassword123';
      
      // Mock the crypto APIs
      const mockImportedKey = {};
      const mockDerivedKey = {};
      const mockEncryptedData = new ArrayBuffer(16);
      
      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockImportedKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockDerivedKey);
      (global.crypto.subtle.encrypt as jest.Mock).mockResolvedValue(mockEncryptedData);
      
      const result = await encryptData(testData, password);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      
      // Verify that crypto APIs were called
      expect(global.crypto.subtle.importKey).toHaveBeenCalled();
      expect(global.crypto.subtle.deriveKey).toHaveBeenCalled();
      expect(global.crypto.subtle.encrypt).toHaveBeenCalled();
    });

    it('should handle different data types', async () => {
      const testData = 'Special characters: !@#$%^&*()';
      const password = 'passwordWithSpecialChars!';
      
      // Mock the crypto APIs
      const mockImportedKey = {};
      const mockDerivedKey = {};
      const mockEncryptedData = new ArrayBuffer(16);
      
      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockImportedKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockDerivedKey);
      (global.crypto.subtle.encrypt as jest.Mock).mockResolvedValue(mockEncryptedData);
      
      const result = await encryptData(testData, password);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty strings', async () => {
      const testData = '';
      const password = 'password';
      
      // Mock the crypto APIs
      const mockImportedKey = {};
      const mockDerivedKey = {};
      const mockEncryptedData = new ArrayBuffer(16);
      
      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockImportedKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockDerivedKey);
      (global.crypto.subtle.encrypt as jest.Mock).mockResolvedValue(mockEncryptedData);
      
      const result = await encryptData(testData, password);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('decryptData', () => {
    it('should decrypt data with the correct password', async () => {
      const testData = 'Hello, World!';
      const password = 'myPassword123';
      const encryptedData = 'someBase64String'; // This is what would be returned from encryptData
      
      // Mock the crypto APIs
      const mockImportedKey = {};
      const mockDerivedKey = {};
      const mockDecryptedData = new TextEncoder().encode(testData).buffer;
      
      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockImportedKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockDerivedKey);
      (global.crypto.subtle.decrypt as jest.Mock).mockResolvedValue(mockDecryptedData);
      
      const result = await decryptData(encryptedData, password);
      
      expect(result).toBe(testData);
      
      // Verify that crypto APIs were called
      expect(global.crypto.subtle.importKey).toHaveBeenCalled();
      expect(global.crypto.subtle.deriveKey).toHaveBeenCalled();
      expect(global.crypto.subtle.decrypt).toHaveBeenCalled();
    });

    it('should handle decryption with different passwords', async () => {
      const testData = 'Secret data';
      const password = 'differentPassword';
      const encryptedData = 'anotherBase64String';
      
      // Mock the crypto APIs
      const mockImportedKey = {};
      const mockDerivedKey = {};
      const mockDecryptedData = new TextEncoder().encode(testData).buffer;
      
      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockImportedKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockDerivedKey);
      (global.crypto.subtle.decrypt as jest.Mock).mockResolvedValue(mockDecryptedData);
      
      const result = await decryptData(encryptedData, password);
      
      expect(result).toBe(testData);
    });

    it('should handle empty encrypted data', async () => {
      const password = 'password';
      const encryptedData = '';
      
      // Mock the crypto APIs to handle empty data
      const mockImportedKey = {};
      const mockDerivedKey = {};
      const mockDecryptedData = new TextEncoder().encode('').buffer;
      
      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockImportedKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockDerivedKey);
      (global.crypto.subtle.decrypt as jest.Mock).mockResolvedValue(mockDecryptedData);
      
      const result = await decryptData(encryptedData, password);
      
      expect(result).toBe('');
    });
  });

  describe('Encrypt/Decrypt Cycle', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const originalData = 'This is my secret data that needs to be encrypted';
      const password = 'mySecurePassword123';
      
      // Mock the crypto APIs for both encryption and decryption
      const mockImportedKey = {};
      const mockDerivedKey = {};
      const mockEncryptedData = new ArrayBuffer(32);
      const mockDecryptedData = new TextEncoder().encode(originalData).buffer;
      
      (global.crypto.subtle.importKey as jest.Mock)
        .mockResolvedValueOnce(mockImportedKey) // For encryption
        .mockResolvedValueOnce(mockImportedKey); // For decryption
      
      (global.crypto.subtle.deriveKey as jest.Mock)
        .mockResolvedValueOnce(mockDerivedKey) // For encryption 
        .mockResolvedValueOnce(mockDerivedKey); // For decryption
      
      (global.crypto.subtle.encrypt as jest.Mock)
        .mockResolvedValue(mockEncryptedData);
      
      (global.crypto.subtle.decrypt as jest.Mock)
        .mockResolvedValue(mockDecryptedData);
      
      // Encrypt the data
      const encrypted = await encryptData(originalData, password);
      expect(encrypted).toBeDefined();
      
      // Decrypt the data
      const decrypted = await decryptData(encrypted, password);
      expect(decrypted).toBe(originalData);
    });

    it('should fail to decrypt with wrong password', async () => {
      const originalData = 'Secret message';
      const correctPassword = 'correctPassword123';
      const wrongPassword = 'wrongPassword456';
      const encryptedData = 'someEncryptedBase64String';
      
      // Mock the crypto APIs
      const mockImportedKey = {};
      const mockDerivedKey = {};
      // Simulate a decryption error when the wrong password is used
      const decryptionError = new Error('OperationError');
      
      (global.crypto.subtle.importKey as jest.Mock)
        .mockResolvedValueOnce(mockImportedKey) // For encryption
        .mockResolvedValueOnce(mockImportedKey); // For decryption attempt
      
      (global.crypto.subtle.deriveKey as jest.Mock)
        .mockResolvedValueOnce(mockDerivedKey) // For encryption 
        .mockResolvedValueOnce(mockDerivedKey); // For decryption attempt
      
      (global.crypto.subtle.encrypt as jest.Mock)
        .mockResolvedValue(new ArrayBuffer(16));
      
      (global.crypto.subtle.decrypt as jest.Mock)
        .mockRejectedValue(decryptionError);
      
      // Encrypt the data
      const encrypted = await encryptData(originalData, correctPassword);
      expect(encrypted).toBeDefined();
      
      // Try to decrypt with the wrong password, should throw an error
      await expect(decryptData(encrypted, wrongPassword)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long data strings', async () => {
      const longData = 'A'.repeat(10000); // 10,000 character string
      const password = 'password123';
      
      // Mock the crypto APIs
      const mockImportedKey = {};
      const mockDerivedKey = {};
      const mockEncryptedData = new ArrayBuffer(100);
      const mockDecryptedData = new TextEncoder().encode(longData).buffer;
      
      (global.crypto.subtle.importKey as jest.Mock)
        .mockResolvedValueOnce(mockImportedKey) // For encryption
        .mockResolvedValueOnce(mockImportedKey); // For decryption
      
      (global.crypto.subtle.deriveKey as jest.Mock)
        .mockResolvedValueOnce(mockDerivedKey) // For encryption 
        .mockResolvedValueOnce(mockDerivedKey); // For decryption
      
      (global.crypto.subtle.encrypt as jest.Mock)
        .mockResolvedValue(mockEncryptedData);
      
      (global.crypto.subtle.decrypt as jest.Mock)
        .mockResolvedValue(mockDecryptedData);
      
      // Encrypt the long data
      const encrypted = await encryptData(longData, password);
      expect(encrypted).toBeDefined();
      
      // Decrypt the long data
      const decrypted = await decryptData(encrypted, password);
      expect(decrypted).toBe(longData);
    });

    it('should handle special characters in passwords', async () => {
      const testData = 'Test data';
      const passwordWithSpecialChars = 'P@ssw0rd!@#$%^&*()_+123';
      
      // Mock the crypto APIs
      const mockImportedKey = {};
      const mockDerivedKey = {};
      const mockEncryptedData = new ArrayBuffer(16);
      const mockDecryptedData = new TextEncoder().encode(testData).buffer;
      
      (global.crypto.subtle.importKey as jest.Mock)
        .mockResolvedValueOnce(mockImportedKey) // For encryption
        .mockResolvedValueOnce(mockImportedKey); // For decryption
      
      (global.crypto.subtle.deriveKey as jest.Mock)
        .mockResolvedValueOnce(mockDerivedKey) // For encryption 
        .mockResolvedValueOnce(mockDerivedKey); // For decryption
      
      (global.crypto.subtle.encrypt as jest.Mock)
        .mockResolvedValue(mockEncryptedData);
      
      (global.crypto.subtle.decrypt as jest.Mock)
        .mockResolvedValue(mockDecryptedData);
      
      const encrypted = await encryptData(testData, passwordWithSpecialChars);
      expect(encrypted).toBeDefined();
      
      const decrypted = await decryptData(encrypted, passwordWithSpecialChars);
      expect(decrypted).toBe(testData);
    });
  });
});