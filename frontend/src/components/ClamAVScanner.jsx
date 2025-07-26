import React, { useState, useEffect } from "react";
import {
  CozyToolContainer,
  CozyTypography,
  CozyResultPaper,
  CozyPrimaryButton,
  CozySecondaryTypography,
  CozyFileInfoContainer,
  CozyUploadButton,
} from "./StyledComponents";
import { API_BASE_URL, COMMON_STYLES, MESSAGES } from "../constants";
import {
  Button,
  TextField,
  Alert,
  Chip,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const endpoints = {
  status: `${API_BASE_URL}/clamav/status`,
  scan: `${API_BASE_URL}/clamav/scan`,
  scanDirectory: `${API_BASE_URL}/clamav/scan-directory`,
};

const BUTTON_STYLES = {
  upload: {
    width: "100%",
    height: "48px",
    fontSize: "0.95rem",
    fontWeight: 600,
    padding: "8px 16px",
  },
  primary: {
    width: "100%",
    height: "44px",
    fontSize: "0.95rem",
    fontWeight: 600,
    padding: "8px 20px",
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const resultsContainerVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const resultItemAnimationVariants = {
  hidden: { opacity: 0, x: -15, y: 5 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

function ClamAVScanner() {
  const [status, setStatus] = useState(null);
  const [file, setFile] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [directory, setDirectory] = useState("");
  const [dirScanResult, setDirScanResult] = useState(null);

  // Smart scan options state
  const [selectedTypes, setSelectedTypes] = useState(["all"]);
  const [recursive, setRecursive] = useState(true);

  // Scan cancellation support
  const [scanAbortController, setScanAbortController] = useState(null);

  // clamav status fetch
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoints.status);
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch ClamAV status.");
      }
      setLoading(false);
    };
    fetchStatus();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setScanResult(null);
  };

  const handleClearFile = () => {
    setFile(null);
    setScanResult(null);
  };

  const handleScanFile = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setScanResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(endpoints.scan, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to scan file.");
    }
    setLoading(false);
  };

  // dir scan functionality
  const handleSmartDirectoryScan = async () => {
    if (!directory || selectedTypes.length === 0) return;
    setLoading(true);
    setError(null);
    setDirScanResult(null);

    // Create AbortController for cancellation
    const controller = new AbortController();
    setScanAbortController(controller);

    try {
      // force expansion of ~ and ~/ paths
      let expandedDirectory = directory;
      if (directory === "~") {
        expandedDirectory = "/home/arch";
      } else if (directory.startsWith("~/")) {
        expandedDirectory = directory.replace("~", "/home/arch");
      }
      console.log("Expanded Directory:", expandedDirectory);
      const payload = {
        directory: expandedDirectory,
        file_types: selectedTypes,
        recursive,
      };
      console.log("Smart Directory Scan Payload:", payload);
      const res = await fetch(`${API_BASE_URL}/clamav/scan-by-types`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data = await res.json();
      setDirScanResult(data);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Scan was cancelled.");
      } else {
        console.error(err);
        setError("Failed to scan directory.");
      }
    }
    setLoading(false);
    setScanAbortController(null);
  };

  return (
    <>
      {/* daemon status indicator */}
      {status?.clamav_status?.available &&
        status?.clamav_status?.mode === "daemon" && (
          <Box
            sx={{
              position: "fixed",
              top: 24,
              right: 32,
              px: 2.5,
              py: 1,
              bgcolor: "rgba(40, 44, 52, 0.85)", // dark gray with transparency
              color: "#b2dfdb",
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "1rem",
              zIndex: 1300,
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 22, color: "#26a69a" }} />
            ClamAV Daemon Running
          </Box>
        )}
      <CozyToolContainer maxWidth={1200} sx={{ pt: 0 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "stretch",
            gap: 4,
            width: "100%",
            position: "relative",
          }}
        >
          {/* scan a file */}
          <Box
            sx={{
              flex: 1,
              minWidth: 320,
              maxWidth: 400,
              alignSelf: "center",
              my: "auto",
              background: "rgba(30,34,44,0.85)",
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <CozyTypography variant="h5" align="center" sx={{ mb: 2 }}>
              Scan a File
            </CozyTypography>
            <motion.div variants={itemVariants} style={{ width: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <CozyUploadButton
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    ...BUTTON_STYLES.upload,
                    width: "300px",
                    maxWidth: "100%",
                    mt: 1,
                  }}
                >
                  Upload File
                  <input type="file" hidden onChange={handleFileChange} />
                </CozyUploadButton>
              </Box>
              {file && (
                <CozyFileInfoContainer
                  sx={{
                    width: "350px",
                    maxWidth: "100%",
                    margin: "0 auto",
                    marginTop: 1.5,
                    padding: "10px 16px",
                    borderRadius: 1.5,
                    border: "1px solid rgba(0, 188, 212, 0.3)",
                    backgroundColor: "rgba(0, 188, 212, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                    }}
                  >
                    <Chip
                      label={file.name}
                      sx={{
                        backgroundColor: "rgba(0, 188, 212, 0.1)",
                        color: "#00BCD4",
                        fontWeight: 500,
                        maxWidth: "250px",
                        height: "28px",
                      }}
                    />
                    <CozySecondaryTypography variant="caption">
                      ({file.size} bytes)
                    </CozySecondaryTypography>
                  </Box>
                  <Tooltip title="Remove file">
                    <IconButton
                      onClick={handleClearFile}
                      size="small"
                      sx={{ color: "#f44336" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CozyFileInfoContainer>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <CozyPrimaryButton
                  variant="contained"
                  onClick={handleScanFile}
                  disabled={!file || loading}
                  sx={{
                    ...BUTTON_STYLES.primary,
                    width: "300px",
                    maxWidth: "100%",
                    mt: 2.5,
                  }}
                  startIcon={
                    loading ? (
                      <RefreshIcon
                        sx={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <AnalyticsIcon />
                    )
                  }
                >
                  {loading ? "Scanning..." : "Scan File"}
                </CozyPrimaryButton>
              </Box>
              {/* Animated Scan Result */}
              <Box
                sx={{
                  minHeight: "100px",
                  mt: 1.5,
                  position: "relative",
                  width: "100%",
                }}
              >
                <AnimatePresence mode="wait">
                  {scanResult && !error && (
                    <motion.div
                      key="result"
                      variants={resultsContainerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      style={{
                        width: "100%",
                        maxHeight: "500px",
                        overflowY: "auto",
                      }}
                    >
                      <CozyResultPaper sx={{ p: 2.5, mb: 2 }}>
                        {/* scan result*/}
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozyTypography
                            variant="body1"
                            sx={{ mb: 1.5, fontWeight: 600 }}
                          >
                            <strong>Filename:</strong>{" "}
                            {scanResult.file_info?.filename}
                          </CozyTypography>
                        </motion.div>
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozyTypography variant="body1" sx={{ mb: 1 }}>
                            <strong>Size:</strong>{" "}
                            {scanResult.file_info?.size_mb} MB (
                            {scanResult.file_info?.size_bytes} bytes)
                          </CozyTypography>
                        </motion.div>
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozyTypography
                            variant="body1"
                            sx={{
                              mb: 1,
                              fontFamily: "monospace",
                              wordBreak: "break-all",
                              fontSize: "0.95rem",
                              color: "#607d8b",
                            }}
                            title={scanResult.file_info?.sha256}
                          >
                            <strong>SHA256:</strong>{" "}
                            {scanResult.file_info?.sha256
                              ? `${scanResult.file_info.sha256.slice(0, 12)}...${scanResult.file_info.sha256.slice(-8)}`
                              : ""}
                          </CozyTypography>
                        </motion.div>
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozyTypography
                            variant="body1"
                            sx={{
                              mb: 1.5,
                              fontWeight: 700,
                              color: scanResult.scan_result?.infected
                                ? "#f44336"
                                : "#00bfae",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {scanResult.scan_result?.infected ? (
                              <span
                                style={{ fontWeight: 700, color: "#f44336" }}
                              >
                                🛑
                              </span>
                            ) : (
                              <span
                                style={{ fontWeight: 700, color: "#00bfae" }}
                              >
                                ✅
                              </span>
                            )}
                            <strong>Status:</strong>{" "}
                            {scanResult.scan_result?.infected
                              ? `Infected (${scanResult.scan_result?.threat})`
                              : "Clean"}
                          </CozyTypography>
                        </motion.div>
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozyTypography variant="body1" sx={{ mb: 1 }}>
                            <strong>Scan Time:</strong>{" "}
                            {scanResult.scan_result?.scan_time}s
                          </CozyTypography>
                        </motion.div>
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozyTypography variant="body1" sx={{ mb: 1 }}>
                            <strong>Scan Mode:</strong>{" "}
                            {scanResult.scan_result?.scan_mode}
                          </CozyTypography>
                        </motion.div>
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozyTypography variant="body1" sx={{ mb: 1 }}>
                            <strong>Message:</strong>{" "}
                            {scanResult.scan_result?.message}
                          </CozyTypography>
                        </motion.div>
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozyTypography
                            variant="body1"
                            sx={{
                              mb: 1.5,
                              fontWeight: 600,
                              color:
                                scanResult.recommendations?.severity === "none"
                                  ? "#00bfae"
                                  : "#ffa726",
                            }}
                          >
                            <strong>Recommendation:</strong>{" "}
                            {scanResult.recommendations?.message}
                          </CozyTypography>
                        </motion.div>
                        {scanResult.recommendations?.recommendations && (
                          <motion.div variants={resultItemAnimationVariants}>
                            <CozySecondaryTypography
                              variant="body2"
                              sx={{ mb: 2 }}
                            >
                              <strong>Details:</strong>
                              <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {scanResult.recommendations.recommendations.map(
                                  (rec, idx) => (
                                    <li
                                      key={idx}
                                      style={{
                                        marginBottom: 4,
                                        listStyle: "disc",
                                        color: "#607d8b",
                                      }}
                                    >
                                      {rec}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </CozySecondaryTypography>
                          </motion.div>
                        )}
                      </CozyResultPaper>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </motion.div>
          </Box>
          {/* scan a dir */}
          <Box sx={{ flex: 1, minWidth: 320, maxWidth: 400 }}>
            <motion.div variants={itemVariants}>
              <CozyTypography variant="h6" sx={{ mt: 2 }} align="center">
                Scan a Directory
              </CozyTypography>
              {/* scan options */}
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                {/* Common Directories */}
                <Box sx={{ mb: 2 }}>
                  <CozySecondaryTypography variant="subtitle2" sx={{ mb: 1 }}>
                    Common Directories:
                  </CozySecondaryTypography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {[
                      { name: "Home", path: "~" },
                      { name: "Downloads", path: "~/Downloads" },
                      { name: "Documents", path: "~/Documents" },
                      { name: "Desktop", path: "~/Desktop" },
                      { name: "Temp", path: "/tmp" },
                      { name: "Current", path: "." },
                    ].map((dir) => (
                      <CozyPrimaryButton
                        key={dir.name}
                        variant="outlined"
                        size="small"
                        sx={{
                          minWidth: 0,
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.85rem",
                        }}
                        onClick={() => setDirectory(dir.path)}
                      >
                        {dir.name}
                      </CozyPrimaryButton>
                    ))}
                  </Box>
                </Box>
                {/* Directory Path Input */}
                <TextField
                  label="Directory Path"
                  value={directory}
                  onChange={(e) => setDirectory(e.target.value)}
                  sx={{ ...COMMON_STYLES.textField, flex: 1, mb: 2 }}
                  InputProps={{
                    startAdornment: <FolderIcon sx={{ mr: 1 }} />,
                  }}
                />
                {/* File Type Selection */}
                <CozySecondaryTypography variant="subtitle2" sx={{ mb: 1 }}>
                  File Types to Scan:
                </CozySecondaryTypography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {/* Presets */}
                  <CozyPrimaryButton
                    variant="outlined"
                    size="small"
                    sx={{ px: 1.5, py: 0.5, fontSize: "0.85rem" }}
                    onClick={() =>
                      setSelectedTypes([
                        "executables",
                        "scripts",
                        "suspicious",
                        "no-extension",
                      ])
                    }
                  >
                    Security Focused
                  </CozyPrimaryButton>
                  <CozyPrimaryButton
                    variant="outlined"
                    size="small"
                    sx={{ px: 1.5, py: 0.5, fontSize: "0.85rem" }}
                    onClick={() => setSelectedTypes(["all"])}
                  >
                    All Files
                  </CozyPrimaryButton>
                  <CozyPrimaryButton
                    variant="outlined"
                    size="small"
                    sx={{ px: 1.5, py: 0.5, fontSize: "0.85rem" }}
                    onClick={() =>
                      setSelectedTypes([
                        "windows-executables",
                        "linux-executables",
                        "scripts",
                      ])
                    }
                  >
                    Executables
                  </CozyPrimaryButton>
                  <CozyPrimaryButton
                    variant="outlined"
                    size="small"
                    sx={{ px: 1.5, py: 0.5, fontSize: "0.85rem" }}
                    onClick={() => setSelectedTypes(["scripts", "archives"])}
                  >
                    Scripts & Archives
                  </CozyPrimaryButton>
                </Box>
                {/* Individual File Type Categories */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {Object.entries({
                    all: "All files",
                    executables: "Executables",
                    "windows-executables": "Windows Executables",
                    "linux-executables": "Linux Executables",
                    "macos-executables": "macOS Executables",
                    scripts: "Scripts",
                    archives: "Archives",
                    documents: "Documents",
                    media: "Media",
                    "source-code": "Source Code",
                    suspicious: "Suspicious",
                    "no-extension": "No Extension",
                  }).map(([key, label]) => (
                    <Box
                      key={key}
                      sx={{ display: "flex", alignItems: "center", mr: 2 }}
                    >
                      <input
                        type="checkbox"
                        id={`type-${key}`}
                        checked={selectedTypes.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTypes([...selectedTypes, key]);
                          } else {
                            setSelectedTypes(
                              selectedTypes.filter((t) => t !== key),
                            );
                          }
                        }}
                        style={{ marginRight: 6 }}
                      />
                      <label
                        htmlFor={`type-${key}`}
                        style={{ fontSize: "0.95rem" }}
                      >
                        {label}
                      </label>
                    </Box>
                  ))}
                </Box>
                {/* Recursive Option */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <input
                    type="checkbox"
                    id="recursive"
                    checked={recursive}
                    onChange={(e) => setRecursive(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  <label htmlFor="recursive" style={{ fontSize: "0.95rem" }}>
                    Scan subdirectories recursively
                  </label>
                </Box>
                {/* Scan Button */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <CozyPrimaryButton
                    variant="contained"
                    onClick={handleSmartDirectoryScan}
                    disabled={
                      !directory ||
                      selectedTypes.length === 0 ||
                      loading ||
                      !!scanAbortController
                    }
                    sx={{ ...BUTTON_STYLES.primary, width: "220px" }}
                    startIcon={
                      loading ? (
                        <RefreshIcon
                          sx={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <AnalyticsIcon />
                      )
                    }
                  >
                    {loading ? "Scanning..." : "Smart Scan Directory"}
                  </CozyPrimaryButton>
                  <CozyPrimaryButton
                    variant="contained"
                    color="error"
                    disabled={!scanAbortController}
                    onClick={() => {
                      if (scanAbortController) scanAbortController.abort();
                    }}
                    sx={{ ml: 2, width: "140px" }}
                  >
                    Stop Scan
                  </CozyPrimaryButton>
                </Box>
              </Box>
            </motion.div>
            {/* Animated Directory Scan Result removed from below Smart Scan Directory button */}
          </Box>
          {/* Far Right: Directory Scan Results */}
          <Box
            sx={{
              flex: 1,
              minWidth: 320,
              maxWidth: 400,
              alignSelf: "center",
              my: "auto",
            }}
          >
            {/* Vertical divider */}
            <Box
              sx={{
                width: "2px",
                background: "rgba(80,80,80,0.25)",
                mx: 2,
                alignSelf: "stretch",
                borderRadius: 1,
                display: { xs: "none", md: "block" },
              }}
            />
            {/* Far Right: Directory Scan Results */}
            <Box
              sx={{
                flex: 1,
                minWidth: 320,
                maxWidth: 400,
                alignSelf: "center",
                my: "auto",
                background: "rgba(30,34,44,0.85)",
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: 400,
              }}
            >
              <CozyTypography variant="h5" align="center" sx={{ mb: 2 }}>
                Directory Scan Results
              </CozyTypography>
              <Box
                sx={{
                  minHeight: "100px",
                  mt: 1.5,
                  position: "relative",
                  width: "100%",
                }}
              >
                {loading && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 2 }}
                  >
                    <CircularProgress color="info" />
                  </Box>
                )}
                <AnimatePresence mode="wait">
                  {dirScanResult && (
                    <motion.div
                      key="dirResult"
                      variants={resultsContainerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      style={{
                        width: "100%",
                        maxHeight: "500px",
                        overflowY: "auto",
                      }}
                    >
                      <CozyResultPaper>
                        {/* ...directory scan result content... */}
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozyTypography variant="body1" sx={{ mb: 1 }}>
                            <strong>Directory:</strong>{" "}
                            {dirScanResult.directory}
                          </CozyTypography>
                        </motion.div>
                        <motion.div variants={resultItemAnimationVariants}>
                          <CozySecondaryTypography
                            variant="body2"
                            sx={{ mb: 2 }}
                          >
                            <strong>File Types:</strong>{" "}
                            {dirScanResult.file_types?.join(", ")}
                            <br />
                            <strong>Recursive:</strong>{" "}
                            {dirScanResult.recursive ? "Yes" : "No"}
                            <br />
                            <strong>Total Files:</strong>{" "}
                            {dirScanResult.batch_summary?.total_files}
                            <br />
                            <strong>Scanned:</strong>{" "}
                            {dirScanResult.batch_summary?.completed}
                            <br />
                            <strong>Clean:</strong>{" "}
                            {dirScanResult.batch_summary?.clean_count}
                            <br />
                            <strong>Infected:</strong>{" "}
                            {dirScanResult.batch_summary?.infected_count}
                            <br />
                            <strong>Errors:</strong>{" "}
                            {dirScanResult.batch_summary?.error_count}
                            <br />
                            <strong>Scan Time:</strong>{" "}
                            {dirScanResult.batch_summary?.scan_time}s
                          </CozySecondaryTypography>
                        </motion.div>
                        {/* Clean Files */}
                        {dirScanResult.batch_summary?.clean_count > 0 && (
                          <motion.div variants={resultItemAnimationVariants}>
                            <CozyTypography
                              variant="body2"
                              sx={{ mb: 1, color: "#00bfae" }}
                            >
                              <strong>✅ Clean Files:</strong>
                            </CozyTypography>
                            {(() => {
                              const cleanFiles =
                                dirScanResult.scan_results?.filter(
                                  (f) => !f.infected,
                                ) || [];
                              if (cleanFiles.length <= 10) {
                                return cleanFiles.map((file, idx) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      fontFamily: "monospace",
                                      fontSize: "0.95rem",
                                      mb: 1,
                                      color: "#00bfae",
                                    }}
                                  >
                                    <CheckCircleIcon
                                      sx={{
                                        fontSize: 18,
                                        color: "#00bfae",
                                        mr: 1,
                                        verticalAlign: "middle",
                                      }}
                                    />
                                    {file.file_path || file.filename}
                                  </Box>
                                ));
                              } else {
                                return (
                                  <>
                                    {cleanFiles.slice(0, 5).map((file, idx) => (
                                      <Box
                                        key={idx}
                                        sx={{
                                          fontFamily: "monospace",
                                          fontSize: "0.95rem",
                                          mb: 1,
                                          color: "#00bfae",
                                        }}
                                      >
                                        <CheckCircleIcon
                                          sx={{
                                            fontSize: 18,
                                            color: "#00bfae",
                                            mr: 1,
                                            verticalAlign: "middle",
                                          }}
                                        />
                                        {file.file_path || file.filename}
                                      </Box>
                                    ))}
                                    <Box
                                      sx={{
                                        fontFamily: "monospace",
                                        fontSize: "0.95rem",
                                        mb: 1,
                                        color: "#888",
                                      }}
                                    >
                                      ... {cleanFiles.length - 10} more clean
                                      files ...
                                    </Box>
                                    {cleanFiles.slice(-5).map((file, idx) => (
                                      <Box
                                        key={idx}
                                        sx={{
                                          fontFamily: "monospace",
                                          fontSize: "0.95rem",
                                          mb: 1,
                                          color: "#00bfae",
                                        }}
                                      >
                                        <CheckCircleIcon
                                          sx={{
                                            fontSize: 18,
                                            color: "#00bfae",
                                            mr: 1,
                                            verticalAlign: "middle",
                                          }}
                                        />
                                        {file.file_path || file.filename}
                                      </Box>
                                    ))}
                                  </>
                                );
                              }
                            })()}
                          </motion.div>
                        )}
                        {/* File Type Breakdown */}
                        {dirScanResult.file_type_breakdown && (
                          <motion.div variants={resultItemAnimationVariants}>
                            <CozyTypography variant="body2" sx={{ mb: 1 }}>
                              <strong>📈 File Type Breakdown:</strong>
                            </CozyTypography>
                            {Object.entries(
                              dirScanResult.file_type_breakdown,
                            ).map(([type, counts], idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: "0.95rem",
                                  mb: 1,
                                }}
                              >
                                {counts.infected > 0 ? (
                                  "🚨"
                                ) : (
                                  <CheckCircleIcon
                                    sx={{
                                      fontSize: 16,
                                      color: "#00bfae",
                                      mr: 1,
                                      verticalAlign: "middle",
                                    }}
                                  />
                                )}{" "}
                                {type}: {counts.total} files ({counts.clean}{" "}
                                clean, {counts.infected} infected)
                              </Box>
                            ))}
                          </motion.div>
                        )}
                        {/* Overall Status */}
                        {dirScanResult.batch_summary?.infected_count > 0 ? (
                          <motion.div variants={resultItemAnimationVariants}>
                            <CozyTypography
                              variant="body2"
                              sx={{ mb: 2, color: "#f44336" }}
                            >
                              <strong>🚨 SECURITY ALERT:</strong>{" "}
                              {dirScanResult.batch_summary?.infected_count}{" "}
                              threats detected! Quarantine infected files
                              immediately.
                            </CozyTypography>
                          </motion.div>
                        ) : (
                          <motion.div variants={resultItemAnimationVariants}>
                            <CozyTypography
                              variant="body2"
                              sx={{ mb: 2, color: "#00bfae" }}
                            >
                              <strong>✅ ALL CLEAN:</strong> No threats
                              detected.
                            </CozyTypography>
                          </motion.div>
                        )}
                      </CozyResultPaper>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            </Box>
          </Box>
        </Box>
      </CozyToolContainer>
    </>
  );
}

export default ClamAVScanner;
