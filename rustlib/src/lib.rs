use pyo3::prelude::*;
use sha2::{Digest, Sha256};
use hex;

/// Hashes a string using SHA256.
#[pyfunction]
fn hash_sha256_str(text: &str) -> PyResult<String> {
    let mut hasher = Sha256::new();
    hasher.update(text.as_bytes());
    let result = hasher.finalize();
    Ok(hex::encode(result))
}

/// Hashes a byte array using SHA256.
#[pyfunction]
fn hash_sha256_bytes(bytes: &[u8]) -> PyResult<String> {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let result = hasher.finalize();
    Ok(hex::encode(result))
}

/// A simple hello function to test PyO3 integration.
#[pyfunction]
fn hello() -> PyResult<&'static str> {
    Ok("Hello from Rust!")
}

/// The module definition.
#[pymodule]
fn rustlib(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(hello, m)?)?;
    m.add_function(wrap_pyfunction!(hash_sha256_str, m)?)?;
    m.add_function(wrap_pyfunction!(hash_sha256_bytes, m)?)?;
    Ok(())
}