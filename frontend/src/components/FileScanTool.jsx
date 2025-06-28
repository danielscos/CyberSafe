import { useState } from "react";
import { Alert, Box, Chip, IconButton, Tooltip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  CozyPrimaryButton,
  CozySecondaryButton,
  CozyTypography,
  CozySecondaryTypography,
  CozyResultPaper,
  CozyToolContainer,
  CozyFileInfoContainer,
  CozyLinearProgress,
  CozyUploadButton,
} from "./StyledComponents";
import { useFileType, useFileUpload } from "../hooks/useApi";
import { MESSAGES, LAYOUT } from "../constants";

const BUTTON_STYLES = {
  upload: {
    width: "100%",
    height: "48px",
    minHeight: "48px",
    maxHeight: "48px",
    fontSize: "0.95rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    flexShrink: 0,
    padding: "8px 16px",
  },
  primary: {
    width: "100%",
    height: "44px",
    minHeight: "44px",
    maxHeight: "44px",
    fontSize: "0.95rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    flexShrink: 0,
    padding: "8px 20px",
  },
  secondary: {
    height: "36px",
    minHeight: "36px",
    maxHeight: "36px",
    fontSize: "0.85rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
    flexShrink: 0,
    minWidth: "100px",
    padding: "6px 12px",
  },
};

const FileScanTool = () => {
  const { file, handleFileChange, clearFile } = useFileUpload();
  const { fileTypeResult, loading, error, detectFileType, clearFileType } =
    useFileType();

  const handleDetectFileType = async () => {
    try {
      await detectFileType(file);
    } catch (err) {
      console.error("File type detection failed:", err);
    }
  };

  const handleClearFile = () => {
    clearFile();
    clearFileType();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Animation variants for result popup
  const resultVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const resultItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const resultsContainerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.98,
      y: 10,
    },
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
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const resultItemAnimationVariants = {
    hidden: {
      opacity: 0,
      x: -15,
      y: 5,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <CozyToolContainer maxWidth={550}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* typography */}
        <motion.div variants={itemVariants}>
          <CozyTypography variant="h5" gutterBottom align="center">
            File Type Scanner
          </CozyTypography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <CozyUploadButton
              variant="contained"
              component="label"
              role="button"
              aria-label="Upload file for scanning"
              startIcon={<CloudUploadIcon />}
              sx={{
                ...BUTTON_STYLES.upload,
                width: "300px",
                maxWidth: "100%",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  transition: "left 0.5s",
                },
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0, 188, 212, 0.15)",
                },
                "&:hover::before": {
                  left: "100%",
                },
                "& .MuiButton-startIcon": {
                  marginRight: "8px",
                  "& > svg": {
                    fontSize: "20px",
                  },
                },
              }}
            >
              {MESSAGES.uploadFile}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept="*/*"
                aria-label="File input for upload"
              />
            </CozyUploadButton>
          </Box>
        </motion.div>

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
              transition: "all 0.2s ease",
              minHeight: "44px",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(0, 188, 212, 0.15)",
                borderColor: "rgba(0, 188, 212, 0.5)",
              },
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
            >
              <Chip
                label={file.name}
                sx={{
                  backgroundColor: "rgba(0, 188, 212, 0.1)",
                  color: "#00BCD4",
                  fontWeight: 500,
                  maxWidth: "250px",
                  height: "28px",
                  "& .MuiChip-label": {
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  },
                }}
              />
              <CozySecondaryTypography variant="caption">
                ({formatFileSize(file.size)})
              </CozySecondaryTypography>
            </Box>
            <Tooltip title="Remove file">
              <IconButton
                onClick={handleClearFile}
                size="small"
                sx={{
                  color: "#f44336",
                  width: "28px",
                  height: "28px",
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: "rgba(244, 67, 54, 0.1)",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.2s ease",
                }}
                aria-label="Remove selected file"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </CozyFileInfoContainer>
        )}

        <motion.div variants={itemVariants}>
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <CozyPrimaryButton
              variant="contained"
              color="primary"
              onClick={handleDetectFileType}
              disabled={loading || !file}
              startIcon={
                loading ? (
                  <RefreshIcon sx={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <AnalyticsIcon />
                )
              }
              sx={{
                ...BUTTON_STYLES.primary,
                width: "300px",
                maxWidth: "100%",
                mt: 2.5,
                position: "relative",
                overflow: "hidden",
                background: loading
                  ? "linear-gradient(45deg, #00BCD4 30%, #4DD0E1 90%)"
                  : "linear-gradient(45deg, #00BCD4 30%, #26C6DA 90%)",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
                  transform: "translateX(-100%)",
                  transition: "transform 0.6s",
                },
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 25px rgba(0, 188, 212, 0.35)",
                },
                "&:hover::after": {
                  transform: "translateX(100%)",
                },
                "&:active": {
                  transform: "translateY(0px) scale(0.98)",
                  transition: "transform 0.1s ease",
                },
                "&:disabled": {
                  background: "#484F58",
                  color: "#8B949E",
                  transform: "none",
                  boxShadow: "none",
                },
                "& .MuiButton-startIcon": {
                  marginRight: "6px",
                  "& > svg": {
                    fontSize: "18px",
                  },
                },
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
              aria-label="Analyze uploaded file"
            >
              {loading ? "Analyzing..." : MESSAGES.detectFileType}
            </CozyPrimaryButton>
          </Box>
        </motion.div>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            minHeight: "100px",
            mt: 1.5,
            position: "relative",
          }}
        >
          <AnimatePresence mode="wait">
            {fileTypeResult && !error && (
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
                  overflowX: "hidden",
                }}
              >
                <Box
                  sx={{
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(0, 188, 212, 0.3)",
                      borderRadius: "3px",
                      "&:hover": {
                        background: "rgba(0, 188, 212, 0.5)",
                      },
                    },
                  }}
                >
                  <CozyResultPaper
                    sx={{
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                      perspective: "1000px",
                    }}
                  >
                    <motion.div variants={resultItemAnimationVariants}>
                      <CozyTypography variant="body1" sx={{ mb: 1 }}>
                        <strong>Filename:</strong> {fileTypeResult.filename}
                      </CozyTypography>
                    </motion.div>

                    <motion.div variants={resultItemAnimationVariants}>
                      <CozyTypography variant="body1" sx={{ mb: 1 }}>
                        <strong>Type:</strong> {fileTypeResult.file_type}
                      </CozyTypography>
                    </motion.div>

                    <motion.div variants={resultItemAnimationVariants}>
                      <CozyTypography variant="body1" sx={{ mb: 1 }}>
                        <strong>MIME Type:</strong> {fileTypeResult.mime_type}
                      </CozyTypography>
                    </motion.div>

                    <motion.div variants={resultItemAnimationVariants}>
                      <CozyTypography variant="body1" sx={{ mb: 1 }}>
                        <strong>Size:</strong>{" "}
                        {formatFileSize(fileTypeResult.filesize)}
                      </CozyTypography>
                    </motion.div>

                    <motion.div variants={resultItemAnimationVariants}>
                      <CozyTypography
                        variant="body1"
                        sx={{
                          mb: 1,
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                          fontSize: "0.875rem",
                        }}
                      >
                        <strong>SHA256:</strong> {fileTypeResult.sha256}
                      </CozyTypography>
                    </motion.div>

                    <motion.div variants={resultItemAnimationVariants}>
                      <CozyTypography
                        variant="body1"
                        sx={{
                          mb: 1,
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                          fontSize: "0.875rem",
                        }}
                      >
                        <strong>MD5:</strong> {fileTypeResult.md5}
                      </CozyTypography>
                    </motion.div>

                    <motion.div variants={resultItemAnimationVariants}>
                      <CozyTypography variant="body1" sx={{ mb: 1 }}>
                        <strong>Entropy:</strong> {fileTypeResult.entropy} (
                        {fileTypeResult.entropy_label})
                      </CozyTypography>
                    </motion.div>

                    {fileTypeResult.entropy_explanation && (
                      <motion.div variants={resultItemAnimationVariants}>
                        <CozySecondaryTypography variant="body2" sx={{ mb: 2 }}>
                          {fileTypeResult.entropy_explanation}
                        </CozySecondaryTypography>
                      </motion.div>
                    )}

                    <motion.div variants={resultItemAnimationVariants}>
                      <CozyTypography variant="body1" sx={{ mt: 2 }}>
                        <strong>Description:</strong>{" "}
                        {fileTypeResult.description}
                      </CozyTypography>
                    </motion.div>
                  </CozyResultPaper>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </motion.div>
    </CozyToolContainer>
  );
};

export default FileScanTool;
