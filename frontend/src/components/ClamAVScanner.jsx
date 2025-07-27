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
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";

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

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
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
  const [showInstallPopup, setShowInstallPopup] = useState(true);
  const [file, setFile] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [directory, setDirectory] = useState("");
  const [dirScanResult, setDirScanResult] = useState(null);

  // Framer Motion variants for popup animation
  const popupVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 320, damping: 28 },
    },
    exit: { opacity: 0, scale: 0.85, y: -40, transition: { duration: 0.25 } },
  };

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
      console.log("Directory scan result:", data);
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
      {/* ClamAV not installed floating card with blurred overlay and framer-motion animation */}
      <AnimatePresence>
        {!status?.clamav_status?.available &&
          status?.clamav_status?.reason === "not_installed" &&
          showInstallPopup && (
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 2000,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Blurred overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "rgba(30,34,44,0.55)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  zIndex: 2001,
                  pointerEvents: "auto",
                }}
              />
              {/* Animated floating card */}
              <motion.div
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  zIndex: 2002,
                  width: "100%",
                  maxWidth: 420,
                  minWidth: 340,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "rgba(35, 39, 47, 0.85)",
                    color: "#fff",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                    borderRadius: "24px",
                    padding: "40px 36px 32px 36px",
                    textAlign: "center",
                    pointerEvents: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    position: "relative",
                    border: "1.5px solid rgba(255,255,255,0.08)",
                    minWidth: 340,
                    maxWidth: 420,
                  }}
                >
                  {/* X Button */}
                  <IconButton
                    aria-label="Close"
                    onClick={() => setShowInstallPopup(false)}
                    sx={{
                      position: "absolute",
                      top: 18,
                      right: 18,
                      color: "#fff",
                      backgroundColor: "rgba(255,255,255,0.18)",
                      backdropFilter: "blur(2px)",
                      WebkitBackdropFilter: "blur(2px)",
                      "&:hover": { backgroundColor: "rgba(255,82,82,0.35)" },
                      zIndex: 2003,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                      transition: "background 0.2s",
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 24 }} />
                  </IconButton>
                  <ErrorIcon sx={{ fontSize: 54, color: "#ff5252", mb: 2 }} />
                  <Box sx={{ fontWeight: 700, fontSize: "1.35rem", mb: 1 }}>
                    ClamAV is not installed
                  </Box>
                  <Box sx={{ fontSize: "1.05rem", mb: 2 }}>
                    {status?.clamav_status?.message ||
                      "ClamAV is not available on this system."}
                  </Box>
                  {status?.clamav_status?.installation_help && (
                    <Box
                      sx={{
                        color: "#ffd600",
                        fontWeight: 500,
                        fontSize: "1.05rem",
                        mb: 2,
                      }}
                    >
                      <em>{status.clamav_status.installation_help}</em>
                    </Box>
                  )}
                  <Box sx={{ fontSize: "0.97rem", color: "#bdbdbd", mb: 1 }}>
                    After installing, restart the application and refresh this
                    page.
                  </Box>
                  <Box sx={{ fontSize: "0.97rem", color: "#bdbdbd", mb: 1 }}>
                    <strong>Important:</strong> After installation, run{" "}
                    <code style={{ color: "#ff5252", fontWeight: 700 }}>
                      freshclam
                    </code>{" "}
                    to update virus definitions.
                  </Box>
                  <Box sx={{ fontSize: "0.97rem", color: "#bdbdbd", mb: 1 }}>
                    You should also enable the ClamAV daemon service by running{" "}
                    <code style={{ color: "#ff5252", fontWeight: 700 }}>
                      sudo systemctl enable --now clamav-daemon.service
                    </code>
                    .
                  </Box>
                  <Box sx={{ fontSize: "0.97rem", color: "#bdbdbd" }}>
                    For a detailed installation guide, see&nbsp;
                    <a
                      href="https://docs.clamav.net/manual/Installing.html#installing-with-a-package-manager"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#ffd600", textDecoration: "underline" }}
                    >
                      ClamAV Installation Documentation
                    </a>
                    .
                  </Box>
                </Box>
              </motion.div>
            </Box>
          )}
      </AnimatePresence>
      {status?.clamav_status?.available &&
        status?.clamav_status?.mode === "daemon" && (
          <Box
            sx={{
              position: "fixed",
              top: 24,
              right: 32,
              px: 2.5,
              py: 1,
              backgroundColor: "rgba(40, 44, 52, 0.85)", // dark gray with transparency
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: "100%" }}
        >
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
            <motion.div
              variants={itemVariants}
              style={{ flex: 1, minWidth: 320, maxWidth: 400 }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 320,
                  maxWidth: 400,
                  alignSelf: "center",
                  my: "auto",
                  backgroundColor: "rgba(30,34,44,0.85)",
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
                      disabled={!status?.clamav_status?.available}
                    >
                      Upload File
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        disabled={!status?.clamav_status?.available}
                      />
                    </CozyUploadButton>
                  </Box>
                  {file && (
                    <motion.div
                      variants={itemVariants}
                      style={{ width: "100%" }}
                    >
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
                          <motion.div variants={itemVariants}>
                            <IconButton
                              onClick={handleClearFile}
                              size="small"
                              sx={{ color: "#f44336" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </motion.div>
                        </Tooltip>
                      </CozyFileInfoContainer>
                    </motion.div>
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <CozyPrimaryButton
                      variant="contained"
                      onClick={handleScanFile}
                      disabled={
                        !file || loading || !status?.clamav_status?.available
                      }
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
                                    style={{
                                      fontWeight: 700,
                                      color: "#f44336",
                                    }}
                                  >
                                    🛑
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      color: "#00bfae",
                                    }}
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
                                    scanResult.recommendations?.severity ===
                                    "none"
                                      ? "#00bfae"
                                      : "#ffa726",
                                }}
                              >
                                <strong>Recommendation:</strong>{" "}
                                {scanResult.recommendations?.message}
                              </CozyTypography>
                            </motion.div>
                            {scanResult.recommendations?.recommendations && (
                              <motion.div
                                variants={resultItemAnimationVariants}
                              >
                                <CozySecondaryTypography
                                  variant="body2"
                                  sx={{ mb: 2 }}
                                >
                                  <strong>Details:</strong>
                                </CozySecondaryTypography>
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
                              </motion.div>
                            )}
                          </CozyResultPaper>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
            {/* scan a dir */}
            <motion.div
              variants={itemVariants}
              style={{ flex: 1, minWidth: 320, maxWidth: 400 }}
            >
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
                      <motion.div variants={itemVariants} key={dir.name}>
                        <CozyPrimaryButton
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
                      </motion.div>
                    ))}
                  </Box>
                </Box>
                {/* Directory Path Input */}
                <motion.div variants={itemVariants}>
                  <TextField
                    label="Directory Path"
                    value={directory}
                    onChange={(e) => setDirectory(e.target.value)}
                    sx={{ ...COMMON_STYLES.textField, flex: 1, mb: 2 }}
                    InputProps={{
                      startAdornment: <FolderIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </motion.div>
                {/* File Type Selection */}
                <CozySecondaryTypography variant="subtitle2" sx={{ mb: 1 }}>
                  File Types to Scan:
                </CozySecondaryTypography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {/* Presets */}
                  <motion.div variants={itemVariants}>
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
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <CozyPrimaryButton
                      variant="outlined"
                      size="small"
                      sx={{ px: 1.5, py: 0.5, fontSize: "0.85rem" }}
                      onClick={() => setSelectedTypes(["all"])}
                    >
                      All Files
                    </CozyPrimaryButton>
                  </motion.div>
                  <motion.div variants={itemVariants}>
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
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <CozyPrimaryButton
                      variant="outlined"
                      size="small"
                      sx={{ px: 1.5, py: 0.5, fontSize: "0.85rem" }}
                      onClick={() => setSelectedTypes(["scripts", "archives"])}
                    >
                      Scripts & Archives
                    </CozyPrimaryButton>
                  </motion.div>
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
                    <motion.div variants={itemVariants} key={key}>
                      <Box
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
                    </motion.div>
                  ))}
                </Box>
                {/* Recursive Option */}
                <motion.div variants={itemVariants}>
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
                </motion.div>
                {/* Scan Button */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <motion.div variants={itemVariants} style={{ width: "100%" }}>
                    <CozyPrimaryButton
                      variant="contained"
                      onClick={handleSmartDirectoryScan}
                      disabled={
                        !status?.clamav_status?.available ||
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
                      {loading ? "Scanning..." : "Directory Scan"}
                    </CozyPrimaryButton>
                  </motion.div>
                  <motion.div variants={itemVariants}>
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
                  </motion.div>
                </Box>
              </Box>
            </motion.div>
            {/* Animated Directory Scan Result removed from below Smart Scan Directory button */}
            {/* Far Right: Directory Scan Results */}
            <motion.div
              variants={itemVariants}
              style={{ flex: 1, minWidth: 320, maxWidth: 400 }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 320,
                  maxWidth: 400,
                  alignSelf: "center",
                  my: "auto",
                  backgroundColor: "rgba(30,34,44,0.85)",
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
                          {/* Directory scan result summary */}
                          <CozyTypography variant="body1" sx={{ mb: 1 }}>
                            <strong>Directory:</strong>{" "}
                            {dirScanResult.directory}
                          </CozyTypography>
                          <CozyTypography variant="body2" sx={{ mb: 2 }}>
                            <strong>Total Files:</strong>{" "}
                            {dirScanResult.batch_summary?.total_files}
                            <br />
                            <strong>Clean:</strong>{" "}
                            {dirScanResult.batch_summary?.clean_count}
                            <br />
                            <strong>Infected:</strong>{" "}
                            {dirScanResult.batch_summary?.infected_count}
                            <br />
                            <strong>Errors:</strong>{" "}
                            {dirScanResult.batch_summary?.error_count}
                          </CozyTypography>
                          <CozyTypography variant="body2" sx={{ mb: 1 }}>
                            <strong>Files:</strong>
                          </CozyTypography>
                          <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {dirScanResult.scan_results?.map((file, idx) => (
                              <li
                                key={idx}
                                style={{
                                  color: file.infected ? "#f44336" : "#00bfae",
                                  marginBottom: 4,
                                }}
                              >
                                {file.file_path ||
                                  file.filename ||
                                  "Unknown file"}{" "}
                                - {file.infected ? "Infected" : "Clean"}
                              </li>
                            ))}
                          </ul>
                        </CozyResultPaper>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </CozyToolContainer>
    </>
  );
}

export default ClamAVScanner;
