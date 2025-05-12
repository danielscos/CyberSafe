use pyo3::prelude::*;

/// A simple hello function to test PyO3 integration.
#[pyfunction]
fn hello() -> PyResult<&'static str> {
    Ok("Hello from Rust!")
}

/// The module definition.
#[pymodule]
fn rustlib(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(hello, m)?)?;
    Ok(())
}
