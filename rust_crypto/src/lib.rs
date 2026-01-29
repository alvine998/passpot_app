use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose, Engine as _};
use rand::{rngs::OsRng, RngCore};
use std::str;

/// Generates a random 32-byte key for AES-256
pub fn generate_key() -> String {
    let mut key = [0u8; 32];
    OsRng.fill_bytes(&mut key);
    general_purpose::STANDARD.encode(key)
}

/// Encrypts a message using AES-256-GCM
/// Returns a base64 encoded string of "nonce:ciphertext"
pub fn encrypt(plaintext: &str, key_b64: &str) -> Result<String, String> {
    let key_bytes = general_purpose::STANDARD
        .decode(key_b64)
        .map_err(|_| "Invalid key format")?;
    
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).map_err(|_| "Invalid key length")?;
    
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|_| "Encryption failed")?;

    let mut result = nonce_bytes.to_vec();
    result.extend(ciphertext);

    Ok(general_purpose::STANDARD.encode(result))
}

/// Decrypts a message using AES-256-GCM
pub fn decrypt(encrypted_b64: &str, key_b64: &str) -> Result<String, String> {
    let key_bytes = general_purpose::STANDARD
        .decode(key_b64)
        .map_err(|_| "Invalid key format")?;
    
    let encrypted_data = general_purpose::STANDARD
        .decode(encrypted_b64)
        .map_err(|_| "Invalid encrypted data")?;

    if encrypted_data.len() < 12 {
        return Err("Encrypted data too short".to_string());
    }

    let (nonce_bytes, ciphertext) = encrypted_data.split_at(12);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).map_err(|_| "Invalid key length")?;
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext_bytes = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed")?;

    str::from_utf8(&plaintext_bytes)
        .map(|s| s.to_string())
        .map_err(|_| "Invalid UTF-8 plaintext".to_string())
}

// FFI Interfaces for React Native (Simplified example)
// In a real project, we would use UniFFI or a JSI bridge.
#[no_mangle]
pub extern "C" fn rust_encrypt(plaintext: *const i8, key: *const i8) -> *mut i8 {
    // FFI boiler plate to convert pointers to strings and back
    // This is where we'd bridge to iOS/Android
    std::ptr::null_mut()
}
