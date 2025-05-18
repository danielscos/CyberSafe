import React, { useEffect, useState } from "react";
import styles from "./App.module.css"; // Import CSS module

function App() {
  const [backendStatus, setBackendStatus] = useState("");
  // Text Hashing State
  const [textToHash, setTextToHash] = useState("");
  const [hashedText, setHashedText] = useState("");
  const [hashError, setHashError] = useState("");
  const [selectedHashType, setSelectedHashType] = useState("sha256");

  // Filetype Feature State
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null); // To store { filename, mime_type, file_type, description }
  const [fileTypeError, setFileTypeError] = useState("");


  const hashTypes = [
    { value: "md5", label: "MD5" },
    { value: "sha1", label: "SHA1" },
    { value: "sha256", label: "SHA256" },
    { value: "sha512", label: "SHA512" },
  ];

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
      const encodedText = encodeURIComponent(textToHash);
      const url = `http://localhost:8000/hash_${selectedHashType}?text=${encodedText}`;
      const response = await fetch(url, { method: "GET" });
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

  const handleFileChange = (event) => {
    setFileInfo(null); // Clear previous file info
    setFileTypeError(""); // Clear previous error
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileTypeSubmit = async (e) => {
    e.preventDefault();
    setFileInfo(null);
    setFileTypeError("");

    if (!selectedFile) {
      setFileTypeError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // "file" is the key expected by your FastAPI backend

    try {
      const response = await fetch("http://localhost:8000/filetype", {
        method: "POST",
        body: formData,
        // Note: 'Content-Type' header is automatically set to 'multipart/form-data' by the browser
        // when using FormData with fetch, so you don't usually need to set it manually.
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "File analysis failed with status: " + response.status }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      setFileInfo(jsonData);
    } catch (error) {
      console.error("Error analyzing file:", error);
      setFileTypeError(error.message || "Failed to analyze file.");
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>CyberSafe Tools</h1>
        <div>Backend Status: {backendStatus || "Loading..."}</div>

        <hr />

        <h2>Text Hasher</h2>
        <form onSubmit={handleHashSubmit}>
          <div>
            <label htmlFor="hashType" style={{ marginRight: '10px' }}>Hash Type:</label>
            <select
              id="hashType"
              value={selectedHashType}
              onChange={(e) => setSelectedHashType(e.target.value)}
              style={{ marginBottom: '10px', padding: '5px' }}
            >
              {hashTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="textToHash" style={{ marginRight: '10px' }}>Text to Hash:</label>
            <input
              type="text"
              id="textToHash"
              value={textToHash}
              onChange={(e) => setTextToHash(e.target.value)}
              placeholder="Enter text"
              style={{ marginBottom: '10px', padding: '5px', width: 'calc(100% - 120px)' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 15px' }}>Hash Text</button>
        </form>
        {hashedText && (
          <div style={{ marginTop: '15px' }}>
            <strong>Hashed Result ({selectedHashType.toUpperCase()}):</strong>
            <p style={{ wordBreak: 'break-all' }}>{hashedText}</p>
          </div>
        )}
        {hashError && <div style={{ color: "red", marginTop: '15px' }}>Error: {hashError}</div>}

        <hr />
        <h2>Filetype Identifier</h2>
        <form onSubmit={handleFileTypeSubmit}>
          <div>
            <label htmlFor="fileInput" style={{ marginRight: '10px' }}>Select File:</label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              style={{ marginBottom: '10px' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 15px' }} disabled={!selectedFile}>
            Analyze File
          </button>
        </form>
        {fileInfo && (
          <div style={{ marginTop: '15px', textAlign: 'left', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <h3>File Analysis Result:</h3>
            <p><strong>Filename:</strong> {fileInfo.filename}</p>
            <p><strong>MIME Type:</strong> {fileInfo.mime_type}</p>
            <p><strong>Detected File Type:</strong> {fileInfo.file_type || "N/A"}</p>
            <p><strong>Description:</strong> {fileInfo.description}</p>
          </div>
        )}
        {fileTypeError && <div style={{ color: "red", marginTop: '15px' }}>Error: {fileTypeError}</div>}

      </div>
      <footer className={styles.footer}>
          CyberSafe &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;