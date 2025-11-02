import * as bip39 from "bip39";
import { Keypair, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { derivePath } from "ed25519-hd-key";

export function generateSeedPhrase(): string[] {
  const mnemonic = bip39.generateMnemonic();
  return mnemonic.split(" ");
}

export function getRandomSeedIndices(): number[] {
  // Returns 4 unique, random indices from 0-11.
  const indices = new Set<number>();
  while (indices.size < 4) {
    indices.add(Math.floor(Math.random() * 12));
  }
  return Array.from(indices).sort((a, b) => a - b);
}

export function validateSeedPhrase(phrase: string): boolean {
  return bip39.validateMnemonic(phrase);
}

export async function generateWalletAddress(seedPhrase: string): Promise<string> {
  const seed = await bip39.mnemonicToSeed(seedPhrase);
  const derivedSeed = derivePath(`m/44'/501'/0'/0'`, seed.toString('hex')).key;
  const keypair = Keypair.fromSeed(derivedSeed);
  return keypair.publicKey.toBase58();
}

export async function importWallet(input: string): Promise<{ 
  seedPhrase: string[] | null, 
  address: string,
  keypair: Keypair 
}> {
    const trimmed = input.trim();

    // Check if it's a seed phrase
    if (validateSeedPhrase(trimmed)) {
        const seedPhrase = trimmed.split(/\s+/);
        const address = await generateWalletAddress(trimmed);
        const seed = await bip39.mnemonicToSeed(trimmed);
        const derivedSeed = derivePath(`m/44'/501'/0'/0'`, seed.toString('hex')).key;
        const keypair = Keypair.fromSeed(derivedSeed);
        return { seedPhrase, address, keypair };
    }

    // Check if it's a base58 private key
    try {
        console.log("Trimmed input:", trimmed);
        const privateKey = bs58.decode(trimmed);
        console.log("Decoded private key:", privateKey);
        console.log("Private key length:", privateKey.length);
        if (privateKey.length === 64) {
            const keyPairNacl = nacl.sign.keyPair.fromSecretKey(privateKey);
            const keypair = Keypair.fromSecretKey(keyPairNacl.secretKey); // Reconstruct using @solana/web3.js Keypair
            const address = keypair.publicKey.toBase58();
            // Private keys don't have seed phrases
            return { seedPhrase: null, address, keypair };
        }
    } catch (error) {
        // Not a base58 string
    }

    throw new Error("Invalid input. Please provide a valid seed phrase or private key.");
}

export function validateWalletAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}
