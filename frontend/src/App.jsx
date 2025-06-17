import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CssBaseline,
  ThemeProvider,
  createTheme,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import "./App.css";

const theme = createTheme();

const HASH_TYPES = [
  { label: "MD5", value: "md5" },
  { label: "SHA-1", value: "sha1" },
  { label: "SHA-256", value: "sha256" },
  { label: "SHA-512", value: "sha512" },
  { label: "BLAKE3", value: "blake3" },
];

const ModernLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 8,
  backgroundColor: theme.palette.mode === "light" ? "#e0e0e0" : "#23232b",
  boxShadow: "0 6px 24px 0 rgba(0,0,0,0.18), 0 1.5px 6px 0 rgba(0,0,0,0.10)",
  overflow: "hidden",
  "& .MuiLinearProgress-bar": {
    borderRadius: 8,
    background: "linear-gradient(90deg, #00c6fb 0%, #005bea 100%)",
    boxShadow: "0 2px 8px 0 rgba(0,0,0,0.22), 0 1.5px 6px 0 rgba(0,0,0,0.10)",
  },
}));

function App() {
  const [hashInput, setHashInput] = useState("");
  const [hashType, setHashType] = useState("md5");
  const [hashResult, setHashResult] = useState(null);
  const [file, setFile] = useState(null);
  const [fileTypeResult, setFileTypeResult] = useState(null);
  const [hashLoading, setHashLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // Start from home page
  const [copySuccess, setCopySuccess] = useState(false);

  const handleHash = async () => {
    setHashLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/hash_${hashType}?text=${encodeURIComponent(hashInput)}`,
      );
      setHashResult(response.data);
    } catch (error) {
      setHashResult({ error: error.message });
    } finally {
      setHashLoading(false);
    }
  };

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(hashResult.hash);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileTypeResult(null);
  };

  const handleFileType = async () => {
    if (!file) return;
    setFileLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/filetype",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setFileTypeResult(response.data);
    } catch (error) {
      setFileTypeResult({ error: error.message });
    }
    setFileLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="main-bg">
        <div className="dashboard-container">
          <aside className="sidebar-glass">
            <h1 className="brand-title">CyberSafe</h1>
            <div className="sidebar-section">
              <h2>TOOLS</h2>
              <ul>
                <li
                  className={`sidebar-btn${activeTab === "dashboard" ? " active" : ""}`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <span className="icon">🏠</span> Home
                </li>
                <li
                  className={`sidebar-btn${activeTab === "hashing" ? " active" : ""}`}
                  onClick={() => setActiveTab("hashing")}
                >
                  <span className="icon">#</span> Hashing
                </li>
                <li
                  className={`sidebar-btn${activeTab === "filescan" ? " active" : ""}`}
                  onClick={() => setActiveTab("filescan")}
                >
                  <span className="icon">📁</span> File Scan
                </li>
                <li
                  className={`sidebar-btn${activeTab === "yara" ? " active" : ""}`}
                  onClick={() => setActiveTab("yara")}
                >
                  <span className="icon">🧬</span> YARA Scan
                </li>
              </ul>
            </div>
            <div className="sidebar-section">
              <h2>RESOURCES</h2>
              <ul>
                <li className="sidebar-btn">
                  <span className="icon">🌐</span> VirusTotal
                </li>
                <li className="sidebar-btn">
                  <span className="icon">🔗</span> Hybrid Analysis
                </li>
                <li className="sidebar-btn">
                  <span className="icon">🖥️</span> ANY.RUN
                </li>
                <li className="sidebar-btn">
                  <span className="icon">💾</span> MalwareBazaar
                </li>
                <li className="sidebar-btn">
                  <span className="icon">📚</span> Exploit Database
                </li>
              </ul>
            </div>
          </aside>
          <main className="main-content">
            {activeTab === "hashing" && (
              <div
                className="tool-content"
                style={{
                  maxWidth: 600,
                  margin: "0 auto",
                  paddingTop: 24,
                  minHeight: 420,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ color: "#fff", fontWeight: "bold" }}
                >
                  Hashing Tool
                </Typography>
                <TextField
                  label={
                    <span style={{ color: "#fff", fontWeight: "bold" }}>
                      Text to Hash
                    </span>
                  }
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputLabelProps={{
                    style: { color: "#fff", fontWeight: "bold" },
                  }}
                  InputProps={{ style: { color: "#fff", fontWeight: "bold" } }}
                  sx={{ mb: 2, background: "#23232b", borderRadius: 1 }}
                />
                <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: "#fff", fontWeight: "bold" }}>
                    Hash Type
                  </InputLabel>
                  <Select
                    value={hashType}
                    label="Hash Type"
                    onChange={(e) => setHashType(e.target.value)}
                    sx={{
                      color: "#fff",
                      fontWeight: "bold",
                      background: "#23232b",
                      borderRadius: 1,
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: { background: "#23232b", color: "#fff" },
                      },
                    }}
                  >
                    {HASH_TYPES.map((type) => (
                      <MenuItem
                        key={type.value}
                        value={type.value}
                        sx={{ color: "#fff", fontWeight: "bold" }}
                      >
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 16,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleHash}
                    disabled={hashLoading || !hashInput}
                    sx={{
                      flex: 1,
                      fontWeight: "bold",
                      fontSize: 16,
                      borderRadius: 2,
                      boxShadow:
                        "0 6px 24px 0 rgba(0,198,251,0.18), 0 1.5px 6px 0 rgba(0,91,234,0.10)",
                    }}
                  >
                    Generate Hash
                  </Button>
                  <Button
                    variant="text"
                    color="secondary"
                    onClick={() => {
                      setHashInput("");
                      setHashResult(null);
                    }}
                    sx={{
                      ml: 2,
                      px: 3,
                      py: 1.5,
                      fontWeight: "bold",
                      fontSize: 15,
                      color: "#00c6fb",
                      borderRadius: 2,
                      background: "rgba(0,198,251,0.08)",
                      transition: "all 0.2s",
                      "&:hover": {
                        background: "rgba(0,91,234,0.18)",
                        color: "#fff",
                      },
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        letterSpacing: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="9"
                          stroke="#00c6fb"
                          strokeWidth="2"
                        />
                        <path
                          d="M7 7L13 13M13 7L7 13"
                          stroke="#00c6fb"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      Deselect
                    </span>
                  </Button>
                </div>
                {hashLoading && <ModernLinearProgress sx={{ mt: 2 }} />}
                <div style={{ minHeight: 120 }}>
                  {hashResult && (
                    <Paper sx={{ mt: 2, p: 2, background: "#23232b" }}>
                      {hashResult.error ? (
                        <Alert severity="error">{hashResult.error}</Alert>
                      ) : (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 12,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 14,
                              }}
                            >
                              <b>
                                Result ({hashResult.hash_type?.toUpperCase()}):
                              </b>
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={handleCopyHash}
                              sx={{
                                minWidth: 100,
                                height: 32,
                                fontWeight: "bold",
                                fontSize: 12,
                                color: copySuccess ? "#4caf50" : "#00c6fb",
                                borderColor: copySuccess
                                  ? "#4caf50"
                                  : "#00c6fb",
                                backgroundColor: copySuccess
                                  ? "rgba(76, 175, 80, 0.1)"
                                  : "rgba(0, 198, 251, 0.1)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  backgroundColor: copySuccess
                                    ? "rgba(76, 175, 80, 0.2)"
                                    : "rgba(0, 198, 251, 0.2)",
                                  borderColor: copySuccess
                                    ? "#66bb6a"
                                    : "#005bea",
                                },
                              }}
                              startIcon={
                                copySuccess ? (
                                  <span style={{ fontSize: 14 }}>✓</span>
                                ) : (
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                )
                              }
                            >
                              {copySuccess ? "Copied!" : "Copy"}
                            </Button>
                          </div>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#fff",
                              fontWeight: "bold",
                              wordBreak: "break-all",
                              overflowWrap: "break-word",
                              whiteSpace: "pre-wrap",
                              backgroundColor: "rgba(0, 0, 0, 0.3)",
                              padding: "12px",
                              borderRadius: "8px",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              fontFamily: "monospace",
                              fontSize: 14,
                              lineHeight: 1.5,
                            }}
                          >
                            {hashResult.hash}
                          </Typography>
                        </div>
                      )}
                    </Paper>
                  )}
                </div>
              </div>
            )}
            {activeTab === "filescan" && (
              <div
                className="tool-content"
                style={{
                  maxWidth: 600,
                  margin: "0 auto",
                  paddingTop: 24,
                  minHeight: 520,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ color: "#fff", fontWeight: "bold" }}
                >
                  File Type Scanner
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    mt: 2,
                    width: "100%",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Upload File
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                {file && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{ mt: 1, color: "#fff", fontWeight: "bold" }}
                    >
                      Selected: {file.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setFile(null);
                        setFileTypeResult(null);
                      }}
                      sx={{
                        mt: 1,
                        fontWeight: "bold",
                        color: "#00c6fb",
                        borderColor: "#00c6fb",
                        ml: 2,
                        width: 140,
                        transition: "all 0.2s",
                        "&:hover": {
                          background: "#003a5e",
                          borderColor: "#005bea",
                          color: "#fff",
                        },
                      }}
                    >
                      <span style={{ fontWeight: 700, letterSpacing: 1 }}>
                        ✖ Deselect
                      </span>
                    </Button>
                  </div>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFileType}
                  disabled={fileLoading || !file}
                  sx={{
                    mt: 2,
                    width: "100%",
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Detect File Type
                </Button>
                {fileLoading && <ModernLinearProgress sx={{ mt: 2 }} />}
                <div style={{ minHeight: 220 }}>
                  {fileTypeResult && (
                    <Paper sx={{ mt: 2, p: 2, background: "#23232b" }}>
                      {fileTypeResult.error ? (
                        <Alert severity="error">{fileTypeResult.error}</Alert>
                      ) : (
                        <>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", fontWeight: "bold" }}
                          >
                            <b>Filename:</b> {fileTypeResult.filename}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", fontWeight: "bold" }}
                          >
                            <b>Type:</b> {fileTypeResult.file_type}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", fontWeight: "bold" }}
                          >
                            <b>MIME Type:</b> {fileTypeResult.mime_type}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", fontWeight: "bold" }}
                          >
                            <b>Size:</b> {fileTypeResult.filesize} bytes
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", fontWeight: "bold" }}
                          >
                            <b>SHA-256:</b> {fileTypeResult.sha256}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", fontWeight: "bold" }}
                          >
                            <b>MD5:</b> {fileTypeResult.md5}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", fontWeight: "bold" }}
                          >
                            <b>Entropy:</b> {fileTypeResult.entropy} (
                            {fileTypeResult.entropy_label})
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#aaa", fontStyle: "italic", mb: 1 }}
                          >
                            {fileTypeResult.entropy_explanation}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ color: "#fff", fontWeight: "bold", mt: 2 }}
                          >
                            <b>Description:</b> {fileTypeResult.description}
                          </Typography>
                        </>
                      )}
                    </Paper>
                  )}
                </div>
              </div>
            )}
            {activeTab === "yara" && (
              <div className="tool-content">
                <Typography variant="h5" gutterBottom>
                  YARA Scan (Coming Soon)
                </Typography>
                <Alert severity="info">
                  YARA scanning functionality will be available in a future
                  update.
                </Alert>
              </div>
            )}
            {/* You can keep the dashboard/news below or move it to a separate tab if desired */}
            {activeTab === "dashboard" && (
              <div className="dashboard-home">
                <div className="dashboard-row" style={{ marginBottom: 32 }}>
                  <div className="dashboard-card">
                    <div className="card-label">CPU</div>
                    <div className="card-value">Intel Core i7–12700H</div>
                  </div>
                  <div className="dashboard-card">
                    <div className="card-label">Memory</div>
                    <div className="card-value">16 GB</div>
                  </div>
                </div>
                <div
                  className="dashboard-news"
                  style={{
                    minHeight: 180,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <h2 style={{ marginTop: 0 }}>Cybersecurity News</h2>
                  <div className="news-placeholder" style={{ flex: 1 }}>
                    {/* News content here */}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
