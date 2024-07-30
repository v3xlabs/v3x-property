use hmac::{digest::InvalidLength, Hmac, Mac};
use sha2::Sha256;

pub fn hash_session(session_id: &str) -> Result<String, InvalidLength> {
    let mut hash = Hmac::<Sha256>::new_from_slice(b"")?;
    hash.update(session_id.as_bytes());
    Ok(hex::encode(hash.finalize().into_bytes()))
}
