import rustlib

def test_hash_sha256():
    input_data = "hello world"
    expected_output = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"  # Expected SHA-256 hash of "hello world"

    # Call the Rust function from Python
    result = rustlib.hash_sha256(input_data)
    
    assert result == expected_output, f"Expected {expected_output}, but got {result}"

if __name__ == "__main__":
    test_hash_sha256()
    print("All tests passed!")

