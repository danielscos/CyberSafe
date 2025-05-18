import React, { useEffect, useState } from "react";
import styles from "./App.module.css"; // Import CSS module

function App() {
  const [backendStatus, setBackendStatus] = useState("");
  const [textToHash, setTextToHash] = useState("");
  const [hashedText, setHashedText] = useState("");
  const [hashError, setHashError] = useState("");

  // Fetch backend status
  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await fetch("http://localhost:8000/");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setBackendStatus(jsonData.status);
      } catch (error) {
        console.error("Error fetching backend status:", error);
        setBackendStatus("Error");
      }
    };
    fetchBackendStatus();
  }, []);

  const handleHashSubmit = async (e) => {
    e.preventDefault();
    setHashedText("");
    setHashError("");
    if (!textToHash) {
      setHashError("Please enter text to hash.");
      return;
    }
    try {
      // Encode the text to be used in a URL query parameter
      const encodedText = encodeURIComponent(textToHash);
      // Construct the URL with the query parameter
      const url = `http://localhost:8000/hash_sha256?text=${encodedText}`;

      const response = await fetch(url, { // Changed to GET, URL includes query param
        method: "GET", // Explicitly GET, though it's the default
        headers: {
          // No 'Content-Type' needed for GET with query params
        },
        // No 'body' for GET requests
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Hashing failed with status: " + response.status }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      setHashedText(jsonData.hash); 
    } catch (error) {
      console.error("Error hashing text:", error);
      setHashError(error.message || "Failed to hash text.");
    }
  };

  // You would add similar handlers for filetype features
  // For example, a function to handle file upload and send it to a /filetype/identify endpoint

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>CyberSafe Tools</h1>
        <div>Backend Status: {backendStatus || "Loading..."}</div>

        <hr />

        <h2>SHA256 Hasher</h2>
        <form onSubmit={handleHashSubmit}>
          <div>
            <label htmlFor="textToHash">Text to Hash:</label>
            <input
              type="text"
              id="textToHash"
              value={textToHash}
              onChange={(e) => setTextToHash(e.target.value)}
              placeholder="Enter text"
            />
          </div>
          <button type="submit">Hash Text</button>
        </form>
        {hashedText && (
          <div>
            <strong>Hashed Result:</strong> <p>{hashedText}</p>
          </div>
        )}
        {hashError && <div style={{ color: "red" }}>Error: {hashError}</div>}

        {/* Placeholder for Filetype Features */}
        <hr />
        <h2>Filetype Identifier</h2>
        {/* Add input type="file" and a submit handler here */}
        <p><i>Filetype feature UI to be implemented.</i></p>

      </div>
      <footer className={styles.footer}>
          CyberSafe &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;