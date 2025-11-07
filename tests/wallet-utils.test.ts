import * as bip39 from 'bip39';
import { Keypair, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { derivePath } from 'ed25519-hd-key';
import { 
  generateSeedPhrase, 
  getRandomSeedIndices, 
  validateSeedPhrase, 
  generateWalletAddress, 
  importWallet, 
  validateWalletAddress
} from '../src/lib/utils/wallet-utils';

// Mock the required libraries
jest.mock('bip39', () => ({
  generateMnemonic: jest.fn(() => 'test word phrase seed more words here to make twelve'),
  validateMnemonic: jest.fn(),
  mnemonicToSeed: jest.fn()
}));

jest.mock('@solana/web3.js', () => ({
  Keypair: {
    fromSeed: jest.fn(),
    fromSecretKey: jest.fn()
  },
  PublicKey: jest.fn()
}));

jest.mock('tweetnacl', () => ({
  sign: {
    keyPair: {
      fromSecretKey: jest.fn()
    }
  }
}));

jest.mock('ed25519-hd-key', () => ({
  derivePath: jest.fn()
}));

jest.mock('bs58', () => ({
  decode: jest.fn()
}));

describe('Wallet Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSeedPhrase', () => {
    it('should generate a 12-word seed phrase', () => {
      (bip39.generateMnemonic as jest.Mock).mockReturnValue('word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12');
      
      const result = generateSeedPhrase();
      
      expect(result).toHaveLength(12);
      expect(Array.isArray(result)).toBe(true);
      expect(result.every(word => typeof word === 'string')).toBe(true);
    });

    it('should return different words on each call', () => {
      // Mock the bip39.generateMnemonic to return different values
      (bip39.generateMnemonic as jest.Mock)
        .mockReturnValueOnce('test word phrase seed more words here to make twelve')
        .mockReturnValueOnce('different words for second phrase generation');
      
      const firstPhrase = generateSeedPhrase();
      const secondPhrase = generateSeedPhrase();
      
      expect(firstPhrase).not.toEqual(secondPhrase);
    });
  });

  describe('getRandomSeedIndices', () => {
    it('should return 4 unique indices between 0 and 11', () => {
      const result = getRandomSeedIndices();
      
      expect(result).toHaveLength(4);
      expect(new Set(result).size).toBe(4); // Ensure uniqueness
      expect(result.every(index => index >= 0 && index <= 11)).toBe(true);
    });

    it('should return sorted indices', () => {
      const result = getRandomSeedIndices();
      
      expect(result).toEqual([...result].sort((a, b) => a - b)); // Check if sorted
    });

    it('should return different indices on multiple calls', () => {
      const results = Array.from({ length: 10 }, () => getRandomSeedIndices());
      
      // Check that we have some variety (not all the same)
      const uniqueResults = new Set(results.map(arr => arr.join(',')));
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });

  describe('validateSeedPhrase', () => {
    it('should return true for a valid seed phrase', () => {
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(true);
      
      const result = validateSeedPhrase('valid seed phrase here with twelve words total');
      
      expect(result).toBe(true);
      expect(bip39.validateMnemonic).toHaveBeenCalledWith('valid seed phrase here with twelve words total');
    });

    it('should return false for an invalid seed phrase', () => {
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(false);
      
      const result = validateSeedPhrase('invalid phrase not valid');
      
      expect(result).toBe(false);
      expect(bip39.validateMnemonic).toHaveBeenCalledWith('invalid phrase not valid');
    });

    it('should handle short phrases correctly', () => {
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(false);
      
      const result = validateSeedPhrase('too short');
      
      expect(result).toBe(false);
    });
  });

  describe('generateWalletAddress', () => {
    it('should generate a wallet address from a seed phrase', async () => {
      const seedPhrase = 'test word phrase seed more words here to make twelve';
      const seedBuffer = Buffer.from('mockSeed', 'hex');
      const mockDerivedSeed = { key: new Uint8Array(32).fill(1) };
      const mockPublicKey = { toBase58: jest.fn().mockReturnValue('mockPublicKey123') };
      
      (bip39.mnemonicToSeed as jest.Mock).mockResolvedValue(seedBuffer);
      (derivePath as jest.Mock).mockReturnValue(mockDerivedSeed);
      (Keypair.fromSeed as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
      
      const result = await generateWalletAddress(seedPhrase);
      
      expect(result).toBe('mockPublicKey123');
      expect(bip39.mnemonicToSeed).toHaveBeenCalledWith(seedPhrase);
      expect(derivePath).toHaveBeenCalledWith(`m/44'/501'/0'/0'`, expect.any(String));
      expect(Keypair.fromSeed).toHaveBeenCalledWith(mockDerivedSeed.key);
    });

    it('should handle different seed phrases correctly', async () => {
      const seedPhrase = 'different test phrase for wallet generation';
      const seedBuffer = Buffer.from('differentSeed', 'hex');
      const mockDerivedSeed = { key: new Uint8Array(32).fill(2) };
      const mockPublicKey = { toBase58: jest.fn().mockReturnValue('differentPublicKey456') };
      
      (bip39.mnemonicToSeed as jest.Mock).mockResolvedValue(seedBuffer);
      (derivePath as jest.Mock).mockReturnValue(mockDerivedSeed);
      (Keypair.fromSeed as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
      
      const result = await generateWalletAddress(seedPhrase);
      
      expect(result).toBe('differentPublicKey456');
    });
  });

  describe('importWallet', () => {
    beforeEach(() => {
      // Set up common mocks
      const mockPublicKey = { toBase58: jest.fn().mockReturnValue('mockAddress123') };
      (Keypair.fromSeed as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
      (Keypair.fromSecretKey as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
    });

    it('should import wallet from a valid seed phrase', async () => {
      const seedPhrase = 'valid seed phrase here with twelve words total';
      const mockSeed = Buffer.from('mockSeed', 'hex');
      const mockDerivedSeed = { key: new Uint8Array(32).fill(1) };
      
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(true);
      (bip39.mnemonicToSeed as jest.Mock).mockResolvedValue(mockSeed);
      (derivePath as jest.Mock).mockReturnValue(mockDerivedSeed);
      
      const result = await importWallet(seedPhrase);
      
      expect(result.seedPhrase).toEqual(seedPhrase.split(/\s+/));
      expect(result.address).toBe('mockAddress123');
      expect(result.keypair).toBeDefined();
      expect(bip39.validateMnemonic).toHaveBeenCalledWith(seedPhrase);
    });

    it('should import wallet from a valid private key', async () => {
      const privateKeyBase58 = '3yF5aJ2S8K9NupZQ2Li53DwLru4Jn6y6gE8uUz2G7i6N';
      const privateKeyBuffer = new Uint8Array(64).fill(1);
      const mockNaclKeyPair = { secretKey: new Uint8Array(64).fill(1) };
      
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(false); // Not a seed phrase
      (bs58.decode as jest.Mock).mockReturnValue(privateKeyBuffer);
      (nacl.sign.keyPair.fromSecretKey as jest.Mock).mockReturnValue(mockNaclKeyPair);
      
      const result = await importWallet(privateKeyBase58);
      
      expect(result.seedPhrase).toBeNull();
      expect(result.address).toBe('mockAddress123');
      expect(result.keypair).toBeDefined();
      expect(bs58.decode).toHaveBeenCalledWith(privateKeyBase58);
    });

    it('should throw error for invalid input', async () => {
      const invalidInput = 'not a valid seed phrase or private key';
      
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(false); // Not a seed phrase
      (bs58.decode as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid base58 string');
      });
      
      await expect(importWallet(invalidInput)).rejects.toThrow(
        'Invalid input. Please provide a valid seed phrase or private key.'
      );
    });

    it('should handle private key that is not 64 bytes', async () => {
      const invalidPrivateKey = 'shortKey';
      const shortBuffer = new Uint8Array(10); // Not 64 bytes
      
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(false); // Not a seed phrase
      (bs58.decode as jest.Mock).mockReturnValue(shortBuffer);
      
      await expect(importWallet(invalidPrivateKey)).rejects.toThrow(
        'Invalid input. Please provide a valid seed phrase or private key.'
      );
    });
  });

  describe('validateWalletAddress', () => {
    it('should return true for a valid wallet address', () => {
      (PublicKey as jest.Mock).mockImplementation(() => ({}));
      
      const result = validateWalletAddress('5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r');
      
      expect(result).toBe(true);
      expect(PublicKey).toHaveBeenCalledWith('5z3EqYQhCz6f3kPbFay8G9c23n6fP9w53Jv7h664655r');
    });

    it('should return false for an invalid wallet address', () => {
      (PublicKey as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid public key');
      });
      
      const result = validateWalletAddress('invalid-address');
      
      expect(result).toBe(false);
      expect(PublicKey).toHaveBeenCalledWith('invalid-address');
    });

    it('should handle different valid addresses', () => {
      (PublicKey as jest.Mock).mockImplementation(() => ({}));
      
      const validAddresses = [
        '4ZtE2XX6oQThPpdvTq9Q6o7vQjwWd1E7v8Dc9f2pY69z',
        'A7vt62M7m3C5X86Y9q6R8Y8qP8P7F4N8P9J3H7T5Y2X1',
        'G4Xz6G7Y8H9J0K1L2M3N4P5Q6R7S8T9U0V1W2X3Y4Z5'
      ];
      
      validAddresses.forEach(address => {
        expect(validateWalletAddress(address)).toBe(true);
        (PublicKey as jest.Mock).mockClear();
        (PublicKey as jest.Mock).mockImplementation(() => ({}));
      });
    });
  });

  describe('Integration Tests', () => {
    it('should generate and validate a wallet address', async () => {
      const seedPhrase = 'test word phrase seed more words here to make twelve';
      const seedBuffer = Buffer.from('mockSeedForValidation', 'hex');
      const mockDerivedSeed = { key: new Uint8Array(32).fill(5) };
      const mockPublicKey = { 
        toBase58: jest.fn().mockReturnValue('someValidPublicKeyAddress') 
      };
      
      (bip39.mnemonicToSeed as jest.Mock).mockResolvedValue(seedBuffer);
      (derivePath as jest.Mock).mockReturnValue(mockDerivedSeed);
      (Keypair.fromSeed as jest.Mock).mockReturnValue({ publicKey: mockPublicKey });
      (PublicKey as jest.Mock).mockImplementation(() => ({}));
      
      // Generate address
      const address = await generateWalletAddress(seedPhrase);
      expect(address).toBe('someValidPublicKeyAddress');
      
      // Validate the address
      const isValid = validateWalletAddress(address);
      expect(isValid).toBe(true);
    });

    it('should validate and import a seed phrase', () => {
      const seedPhrase = 'valid seed phrase here with twelve words total';
      
      (bip39.validateMnemonic as jest.Mock).mockReturnValue(true);
      
      const isValid = validateSeedPhrase(seedPhrase);
      expect(isValid).toBe(true);
    });
  });
});