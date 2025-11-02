// Save as final-test.js
const bs58Module = require('bs58');
const bs58 = bs58Module.default;
const nacl = require('tweetnacl');

const privateKeyBase58 = "5A5BmQFg6q6s7dBXeLBsy3HuTwYSeDk5coHmqtoXcd8s3TCXYsKLts4vdmAQfgospX7Un1JEWMu7kmp9rAhUP2wN";
const expectedPublicKey = "2UXVF3VjRHThrfK6HTjDFzH4WogX2aQ9d8cBMPsYyVNt";

const privateKey = bs58.decode(privateKeyBase58);

console.log("Private Key Length:", privateKey.length);
console.log("Private Key as array:", Array.from(privateKey));

// Test method 1: From full 64 bytes
const fromFull = nacl.sign.keyPair.fromSecretKey(privateKey);
const pubFromFull = bs58.encode(fromFull.publicKey);

// Test method 2: From first 32 bytes (seed)
const fromSeed = nacl.sign.keyPair.fromSeed(privateKey.slice(0, 32));
const pubFromSeed = bs58.encode(fromSeed.publicKey);

console.log("\nFrom full 64 bytes:", pubFromFull);
console.log("From first 32 bytes:", pubFromSeed);
console.log("Expected:          ", expectedPublicKey);

console.log("\n--- Results ---");
if (pubFromFull === expectedPublicKey) {
  console.log("✅ Full 64 bytes MATCHES!");
} else {
  console.log("❌ Full 64 bytes DOES NOT match");
}

if (pubFromSeed === expectedPublicKey) {
  console.log("✅ First 32 bytes (seed) MATCHES!");
} else {
  console.log("❌ First 32 bytes DOES NOT match");
}
