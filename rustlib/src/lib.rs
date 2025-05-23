use pyo3::prelude::*;
use sha2::{Digest, Sha256, Sha512};
use md5;
use sha1::Sha1;
use hex;

// sha256 functions (str, bytes)

#[pyfunction]
fn hash_sha256_str(text: &str) -> PyResult<String> {
    let mut hasher = Sha256::new();
    hasher.update(text.as_bytes());
    let result = hasher.finalize();
    Ok(hex::encode(result))
} 

#[pyfunction]
fn hash_sha256_bytes(bytes: &[u8]) -> PyResult<String> {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    let result = hasher.finalize();
    Ok(hex::encode(result))
}

// sha512 functions (str, bytes)

#[pyfunction]
fn hash_sha512_str(text: &str) -> PyResult<String> {
    let mut hasher = Sha512::new();
    hasher.update(text.as_bytes());
    let result = hasher.finalize();
    Ok(hex::encode(result))
}

#[pyfunction]
fn hash_sha512_bytes(bytes: &[u8]) -> PyResult<String> {
    let mut hasher = Sha512::new();
    hasher.update(bytes);
    let result = hasher.finalize();
    Ok(hex::encode(result))
}

// sha1 functions (str, bytes)

#[pyfunction]
fn hash_sha1_str(text: &str) -> PyResult<String> {
    let mut hasher = Sha1::new();
    hasher.update(text.as_bytes());
    let result = hasher.finalize();
    Ok(hex::encode(result))
}

#[pyfunction]
fn hash_sha1_bytes(bytes: &[u8]) -> PyResult<String> {
    let mut hasher = Sha1::new();
    hasher.update(bytes);
    let result = hasher.finalize();
    Ok(hex::encode(result))
}


// md5 functions (str, bytes)

#[pyfunction]
fn hash_md5_str(text: &str) -> PyResult<String> {
    let digest = md5::compute(text.as_bytes());
    Ok(hex::encode(digest.0))
}

#[pyfunction]
fn hash_md5_bytes(bytes: &[u8]) -> PyResult<String> {
    let digest = md5::compute(bytes);
    Ok(hex::encode(digest.0))
}


// entropy calc
#[pyfunction]
fn entropy_bytes(bytes: &[u8]) -> PyResult<f64> {
    if bytes.is_empty() {
        return Ok(0.0);
    }
    let mut counts = [0usize; 256];
    for &b in bytes {
        counts[b as usize] += 1;
    }
    let len = bytes.len() as f64;
    let mut entropy = 0.0;
    for &count in &counts {
        if count > 0 {
            let p = count as f64 / len;
            entropy -= p * p.log2();
        }
    }
    Ok(entropy)
}

#[pymodule]
fn rustlib(m: Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(hash_sha256_str, &m)?)?;
    m.add_function(wrap_pyfunction!(hash_sha256_bytes, &m)?)?; 
    m.add_function(wrap_pyfunction!(hash_sha512_str, &m)?)?; 
    m.add_function(wrap_pyfunction!(hash_sha512_bytes, &m)?)?; 
    m.add_function(wrap_pyfunction!(hash_sha1_str, &m)?)?; 
    m.add_function(wrap_pyfunction!(hash_sha1_bytes, &m)?)?; 
    m.add_function(wrap_pyfunction!(hash_md5_str, &m)?)?;
    m.add_function(wrap_pyfunction!(hash_md5_bytes, &m)?)?;
    m.add_function(wrap_pyfunction!(entropy_bytes, &m)?)?;
    Ok(())
}
