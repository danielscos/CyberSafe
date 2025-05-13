// use pyo3::prelude::*;
// use sha2::{Digest, Sha256, Sha512};
// use ::md5::Md5;
// use sha1::Sha1;
// use hex;
use md5::{Md5, Digest};
use hex;

fn main() {
    let mut hasher = Md5::new();

    // Feed data in parts
    hasher.update(b"hello ");
    hasher.update(b"world");

    // Finalize to get the raw byte array
    let result_bytes = hasher.finalize();
    // Encode to lowercase hex string
    let hex_str = hex::encode(result_bytes);
    println!("{}", hex_str);
    // Prints: 5eb63bbbe01eeed093cb22bb8f5acdc3
}
// // sha256 functions (str, bytes)

// #[pyfunction]
// fn hash_sha256_str(text: &str) -> PyResult<String> {
//     let mut hasher = Sha256::new();
//     hasher.update(text.as_bytes());
//     let result = hasher.finalize();
//     Ok(hex::encode(result))
// } 

// #[pyfunction]
// fn hash_sha256_bytes(bytes: &[u8]) -> PyResult<String> {
//     let mut hasher = Sha256::new();
//     hasher.update(bytes);
//     let result = hasher.finalize();
//     Ok(hex::encode(result))
// }

// // sha512 functions (str, bytes)

// #[pyfunction]
// fn hash_sha512_str(text: &str) -> PyResult<String> {
//     let mut hasher = Sha512::new();
//     hasher.update(text.as_bytes());
//     let result = hasher.finalize();
//     Ok(hex::encode(result))
// }

// #[pyfunction]
// fn hash_sha512_bytes(bytes: &[u8]) -> PyResult<String> {
//     let mut hasher = Sha512::new();
//     hasher.update(bytes);
//     let result = hasher.finalize();
//     Ok(hex::encode(result))
// }

// // sha1 functions (str, bytes)

// #[pyfunction]
// fn hash_sha1_str(text: &str) -> PyResult<String> {
//     let mut hasher = Sha1::new();
//     hasher.update(text.as_bytes());
//     let result = hasher.finalize();
//     Ok(hex::encode(result))
// }

// #[pyfunction]
// fn hash_sha1_bytes(bytes: &[u8]) -> PyResult<String> {
//     let mut hasher = Sha1::new();
//     hasher.update(bytes);
//     let result = hasher.finalize();
//     Ok(hex::encode(result))
// }


// // md5 functions (str, bytes)

// #[pyfunction]
// fn hash_md5_str(text: &str) -> PyResult<String> {
//     let mut hasher = Md5::new();
//     hasher.update(text.as_bytes());
//     let result = hasher.finalize();
//     Ok(hex::encode(result))
// }

// #[pyfunction]
// fn hash_md5_bytes(bytes: &[u8]) -> PyResult<String> {
//     let mut hasher = Md5::new();
//     hasher.update(bytes);
//     let result = hasher.finalize();
//     Ok(hex::encode(result))
// }



// #[pymodule]
// fn rustlib(m: Bound<'_, PyModule>) -> PyResult<()> {
//     m.add_function(wrap_pyfunction!(hash_sha256_str, &m)?)?; // Pass &m
//     m.add_function(wrap_pyfunction!(hash_sha256_bytes, &m)?)?; 
//     m.add_function(wrap_pyfunction!(hash_sha512_str, &m)?)?; 
//     m.add_function(wrap_pyfunction!(hash_sha512_bytes, &m)?)?; 
//     m.add_function(wrap_pyfunction!(hash_sha1_str, &m)?)?; 
//     m.add_function(wrap_pyfunction!(hash_sha1_bytes, &m)?)?; 
//     m.add_function(wrap_pyfunction!(hash_md5_str, &m)?)?; 
//     m.add_function(wrap_pyfunction!(hash_md5_bytes, &m)?)?; 
//     Ok(())
// }
