import { decode as atob, encode as btoa } from 'base-64';

// Simulated Key for Demo
const MOCK_MASTER_KEY = 'cGFzc3BvdF9zZWN1cmVfbXNnX2VuZ2luZV9kZW1vX2tleV8xMjM='; // Base64 32-byte key

export const CryptoService = {
  /**
   * Encrypts plaintext using the Rust engine (Simulated for Now)
   */
  async encrypt(plaintext: string): Promise<string> {
    console.log('[Rust Engine] Encrypting message...');
    // Real call would be: await NativeModules.PasspotCrypto.encrypt(plaintext, key);
    // For demo, we return a mock ciphertext
    return `ENC[${btoa(plaintext)}]`;
  },

  /**
   * Decrypts ciphertext using the Rust engine (Simulated for Now)
   */
  async decrypt(ciphertext: string): Promise<string> {
    console.log('[Rust Engine] Decrypting message...');
    if (ciphertext.startsWith('ENC[')) {
      const b64 = ciphertext.replace('ENC[', '').replace(']', '');
      return atob(b64);
    }
    return ciphertext;
  },
};
