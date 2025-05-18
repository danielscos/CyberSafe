import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./App.module.css";
import { FiHash, FiFileText, FiAlertCircle } from "react-icons/fi"; // Added FiAlertCircle for errors

function App() {
  const [backendStatus, setBackendStatus] = useState("");
  const [textToHash, setTextToHash] = useState("");
  const [hashedText, setHashedText] = useState("");
  const [hashError, setHashError] = useState("");
  const [selectedHashType, setSelectedHashType] = useState("sha256");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
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
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
        const errorData = await response.json().catch(() => ({ detail: "Hashing failed" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      setHashedText(jsonData.hash);
    } catch (error) {
      setHashError(error.message);
    }
  };

  const handleFileChange = (event) => {
    setFileInfo(null);
    setFileTypeError("");
    setSelectedFile(event.target.files && event.target.files[0] ? event.target.files[0] : null);
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
    formData.append("file", selectedFile);
    try {
      const response = await fetch("http://localhost:8000/filetype", { method: "POST", body: formData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "File analysis failed" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      setFileInfo(jsonData);
    } catch (error) {
      setFileTypeError(error.message);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, scale: 0.95, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "circOut" }}
      >
        <header className={styles.header}>
          <h1>CyberSafe</h1>
          <div className={styles.status}>Backend: {backendStatus || "Loading..."}</div>
        </header>

        <section className={styles.toolSection}>
          <h2><FiHash /> Text Hasher</h2>
          <form onSubmit={handleHashSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="hashType">Hash Type:</label>
              <select id="hashType" value={selectedHashType} onChange={(e) => setSelectedHashType(e.target.value)}>
                {hashTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="textToHash">Text to Hash:</label>
              <input type="text" id="textToHash" value={textToHash} onChange={(e) => setTextToHash(e.target.value)} placeholder="Enter text" />
            </div>
            <button type="submit" className={styles.button}>Hash Text</button>
          </form>
          <AnimatePresence>
            {hashedText && (
              <motion.div className={styles.result} variants={itemVariants} initial="hidden" animate="visible" exit="exit">
                <strong>Hashed Result ({selectedHashType.toUpperCase()}):</strong>
                <p className={styles.hashOutput}>{hashedText}</p>
              </motion.div>
            )}
            {hashError && (
              <motion.div className={styles.error} variants={itemVariants} initial="hidden" animate="visible" exit="exit">
                <FiAlertCircle /> {hashError}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <hr className={styles.divider} />

        <section className={styles.toolSection}>
          <h2><FiFileText /> Filetype Identifier</h2>
          <form onSubmit={handleFileTypeSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="fileInput">Select File:</label>
              <input type="file" id="fileInput" onChange={handleFileChange} />
            </div>
            <button type="submit" className={styles.button} disabled={!selectedFile}>Analyze File</button>
          </form>
          <AnimatePresence>
            {fileInfo && (
              <motion.div className={`${styles.result} ${styles.fileInfoResult}`} variants={itemVariants} initial="hidden" animate="visible" exit="exit">
                <h3>File Analysis:</h3>
                <p><strong>Filename:</strong> {fileInfo.filename}</p>
                <p><strong>MIME Type:</strong> {fileInfo.mime_type}</p>
                <p><strong>Detected Type:</strong> {fileInfo.file_type || "N/A"}</p>
                <p><strong>Description:</strong> {fileInfo.description}</p>
              </motion.div>
            )}
            {fileTypeError && (
              <motion.div className={styles.error} variants={itemVariants} initial="hidden" animate="visible" exit="exit">
                <FiAlertCircle /> {fileTypeError}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>
      {/* Footer removed */}
    </div>
  );
}

export default App;