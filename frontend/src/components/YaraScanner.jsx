import { useState, useEffect } from "react";
import {
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Divider,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import SecurityIcon from "@mui/icons-material/Security";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ScannerIcon from "@mui/icons-material/Scanner";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
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
import {
  useYaraScanner,
  useFileUpload,
  useMultiFileUpload,
} from "../hooks/useApi";
import { MESSAGES, COLORS } from "../constants";

const YaraScanner = () => {
  const { file, handleFileChange, clearFile } = useFileUpload();
  const { files, handleFilesChange, removeFile, clearFiles } =
    useMultiFileUpload();
  const {
    scanResult,
    batchScanResult,
    loading,
    error,
    scanFile,
    batchScanFiles,
    clearAllResults,
  } = useYaraScanner();

  const [batchMode, setBatchMode] = useState(false);

  const handleScanFile = async () => {
    try {
      await scanFile(file, null, true);
    } catch (err) {
      console.error("File scan failed:", err);
    }
  };

  const handleBatchScan = async () => {
    try {
      await batchScanFiles(files, null, true);
    } catch (err) {
      console.error("Batch scan failed:", err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#2196f3";
      default:
        return "#9e9e9e";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "clean":
        return <CheckCircleIcon sx={{ color: "#4caf50" }} />;
      case "suspicious":
        return <WarningIcon sx={{ color: "#ff9800" }} />;
      case "error":
        return <SecurityIcon sx={{ color: "#f44336" }} />;
      default:
        return <InfoIcon sx={{ color: "#2196f3" }} />;
    }
  };

  const renderScanMatch = (match, index) => (
    <Accordion
      key={index}
      sx={{ mb: 1, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
        >
          <Chip
            label={match.rule}
            sx={{
              backgroundColor: getSeverityColor(match.meta?.severity),
              color: "white",
              fontWeight: "bold",
            }}
          />
          <Typography sx={{ color: COLORS.text.primary, fontWeight: "bold" }}>
            {match.strings?.length || 0} string matches
          </Typography>
          {match.meta?.severity && (
            <Chip
              label={match.meta.severity.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: COLORS.text.primary,
                marginLeft: "auto",
              }}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {match.meta?.description && (
          <Typography sx={{ color: COLORS.text.secondary, mb: 2 }}>
            {match.meta.description}
          </Typography>
        )}
        {match.strings && match.strings.length > 0 && (
          <Box>
            <Typography
              sx={{ color: COLORS.text.primary, fontWeight: "bold", mb: 1 }}
            >
              String Matches:
            </Typography>
            {match.strings.map((stringMatch, idx) => (
              <Box
                key={idx}
                sx={{
                  mb: 2,
                  p: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderRadius: 1,
                }}
              >
                <Typography
                  sx={{
                    color: COLORS.primary.main,
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  {stringMatch.identifier} (Offset: {stringMatch.offset})
                </Typography>
                <Typography
                  sx={{
                    color: COLORS.text.primary,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    p: 1,
                    borderRadius: 1,
                    mt: 1,
                    wordBreak: "break-all",
                  }}
                >
                  {stringMatch.context}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );

  const renderSingleScanResult = () => {
    if (!scanResult) return null;

    return (
      <CozyResultPaper>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {getStatusIcon(scanResult.status)}
          <CozyTypography variant="h6">{MESSAGES.scanResults}</CozyTypography>
        </Box>

        <CozyTypography variant="body1" sx={{ mb: 1 }}>
          <strong>File:</strong> {scanResult.filename}
        </CozyTypography>
        <CozyTypography variant="body1" sx={{ mb: 1 }}>
          <strong>Size:</strong> {formatFileSize(scanResult.file_size)}
        </CozyTypography>
        <CozyTypography variant="body1" sx={{ mb: 1 }}>
          <strong>Status:</strong>{" "}
          <Chip
            label={scanResult.status.toUpperCase()}
            sx={{
              backgroundColor:
                scanResult.status === "clean" ? "#4caf50" : "#ff9800",
              color: "white",
              fontWeight: "bold",
            }}
          />
        </CozyTypography>
        <CozyTypography variant="body1" sx={{ mb: 2 }}>
          <strong>Matches:</strong> {scanResult.matches_found}
        </CozyTypography>

        {scanResult.matches && scanResult.matches.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <CozyTypography variant="h6" sx={{ mb: 2 }}>
              Threat Details:
            </CozyTypography>
            {scanResult.matches.map((match, index) =>
              renderScanMatch(match, index),
            )}
          </Box>
        ) : (
          <Alert severity="success" sx={{ mt: 2 }}>
            {MESSAGES.noMatches}
          </Alert>
        )}
      </CozyResultPaper>
    );
  };

  const renderBatchScanResult = () => {
    if (!batchScanResult) return null;

    const { batch_summary, results } = batchScanResult;

    return (
      <CozyResultPaper>
        <CozyTypography variant="h6" sx={{ mb: 2 }}>
          {MESSAGES.batchScanResults}
        </CozyTypography>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Chip label={`Total: ${batch_summary.total_files}`} />
          <Chip
            label={`Clean: ${batch_summary.clean_files}`}
            sx={{ backgroundColor: "#4caf50", color: "white" }}
          />
          <Chip
            label={`Suspicious: ${batch_summary.suspicious_files}`}
            sx={{ backgroundColor: "#ff9800", color: "white" }}
          />
          {batch_summary.error_files > 0 && (
            <Chip
              label={`Errors: ${batch_summary.error_files}`}
              sx={{ backgroundColor: "#f44336", color: "white" }}
            />
          )}
        </Box>

        {results.map((result, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                }}
              >
                {getStatusIcon(result.status)}
                <Typography
                  sx={{ color: COLORS.text.primary, fontWeight: "bold" }}
                >
                  {result.filename}
                </Typography>
                <Box sx={{ marginLeft: "auto", display: "flex", gap: 1 }}>
                  {result.file_size && (
                    <Chip
                      label={formatFileSize(result.file_size)}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        color: COLORS.text.primary,
                      }}
                    />
                  )}
                  <Chip
                    label={result.status.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor:
                        result.status === "clean"
                          ? "#4caf50"
                          : result.status === "suspicious"
                            ? "#ff9800"
                            : "#f44336",
                      color: "white",
                    }}
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {result.error ? (
                <Alert severity="error">{result.error}</Alert>
              ) : result.matches && result.matches.length > 0 ? (
                <Box>
                  <Typography
                    sx={{
                      color: COLORS.text.primary,
                      fontWeight: "bold",
                      mb: 1,
                    }}
                  >
                    {result.matches_found} {MESSAGES.matchesFound}
                  </Typography>
                  {result.matches.map((match, idx) =>
                    renderScanMatch(match, idx),
                  )}
                </Box>
              ) : (
                <Alert severity="success">{MESSAGES.noMatches}</Alert>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </CozyResultPaper>
    );
  };

  return (
    <CozyToolContainer maxWidth="xl">
      <CozyTypography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        {MESSAGES.yaraScanner}
      </CozyTypography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 4,
          minHeight: "70vh",
        }}
      >
        {/* Left Panel - Controls */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", lg: "0 0 480px" },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* mode select */}
          <Box
            sx={{
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={batchMode}
                  onChange={(e) => {
                    setBatchMode(e.target.checked);
                    clearAllResults();
                    clearFile();
                    clearFiles();
                  }}
                />
              }
              label="Batch Scan Mode"
              sx={{ color: COLORS.text.primary }}
            />
          </Box>

          {/* file upload */}
          {!batchMode ? (
            <>
              <CozyUploadButton
                variant="contained"
                component="label"
                role="button"
                aria-label="Upload file for scanning"
                startIcon={<CloudUploadIcon />}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 56,
                  width: "100%",
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

              {file && (
                <CozyFileInfoContainer
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    marginTop: 2,
                    padding: "16px 20px",
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    },
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
                        maxWidth: "300px",
                        "& .MuiChip-label": {
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        },
                      }}
                    />
                    <CozySecondaryTypography variant="caption">
                      ({formatFileSize(file.size)})
                    </CozySecondaryTypography>
                  </Box>
                  <Tooltip title="Remove file">
                    <IconButton
                      onClick={clearFile}
                      size="small"
                      sx={{
                        color: "#f44336",
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
            </>
          ) : (
            <>
              <CozyUploadButton
                variant="contained"
                component="label"
                role="button"
                aria-label="Upload files for batch scanning"
                startIcon={<FolderOpenIcon />}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 56,
                  width: "100%",
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
                }}
              >
                Upload Files (Max 10)
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFilesChange}
                  accept="*/*"
                  aria-label="File input for batch upload"
                />
              </CozyUploadButton>

              {files.length > 0 && (
                <CozyFileInfoContainer>
                  <CozyTypography sx={{ mt: 1, mb: 2 }}>
                    Selected Files ({files.length}):
                  </CozyTypography>
                  {files.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <CozySecondaryTypography>
                        {file.name} ({formatFileSize(file.size)})
                      </CozySecondaryTypography>
                      <IconButton
                        size="small"
                        onClick={() => removeFile(index)}
                        sx={{ color: COLORS.text.secondary }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <CozySecondaryButton
                    variant="outlined"
                    onClick={clearFiles}
                    startIcon={<ClearIcon />}
                    sx={{
                      mt: 1,
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(0, 188, 212, 0.2)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Clear All Files
                  </CozySecondaryButton>
                </CozyFileInfoContainer>
              )}
            </>
          )}

          {/* rules info */}
          <Box
            sx={{
              p: 2,
              backgroundColor: "rgba(0, 188, 212, 0.1)",
              borderRadius: 2,
              border: "1px solid rgba(0, 188, 212, 0.2)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <InfoIcon sx={{ color: COLORS.primary.main }} />
              <CozyTypography variant="body1" sx={{ fontWeight: "bold" }}>
                Using Default YARA Rules
              </CozyTypography>
            </Box>
            <CozySecondaryTypography variant="body2">
              CyberSafe uses built-in YARA rules optimized for detecting common
              malware patterns and threats.
            </CozySecondaryTypography>
          </Box>

          {/* scan button */}
          <CozyPrimaryButton
            variant="contained"
            color="primary"
            onClick={batchMode ? handleBatchScan : handleScanFile}
            disabled={
              loading ||
              (!batchMode && !file) ||
              (batchMode && files.length === 0)
            }
            startIcon={
              loading ? (
                <RefreshIcon sx={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <ScannerIcon />
              )
            }
            sx={{
              width: "100%",
              height: 48,
              fontSize: "1rem",
              fontWeight: 600,
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
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          >
            {loading
              ? MESSAGES.scanInProgress
              : batchMode
                ? MESSAGES.scanFiles
                : MESSAGES.scanFile}
          </CozyPrimaryButton>

          {loading && <CozyLinearProgress sx={{ mt: 2 }} />}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* clear result button */}
          {(scanResult || batchScanResult) && (
            <CozySecondaryButton
              variant="outlined"
              onClick={clearAllResults}
              startIcon={<ClearIcon />}
              sx={{
                width: "100%",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 188, 212, 0.2)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Clear Results
            </CozySecondaryButton>
          )}
        </Box>

        {/* Right Panel - Results */}
        <Box
          sx={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            minHeight: { xs: "300px", lg: "70vh" },
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: "rgba(30, 30, 30, 0.95)",
              backdropFilter: "blur(10px)",
              p: 2,
              borderRadius: 2,
              mb: 2,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <CozyTypography variant="h6" sx={{ mb: 1 }}>
              Scan Results
            </CozyTypography>
            <CozySecondaryTypography variant="body2">
              {scanResult || batchScanResult
                ? "Your scan results are displayed below"
                : "Upload a file and click scan to see results here"}
            </CozySecondaryTypography>
          </Box>

          <Box
            sx={{
              flex: "1 1 auto",
              overflow: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0, 188, 212, 0.3)",
                borderRadius: "4px",
                "&:hover": {
                  background: "rgba(0, 188, 212, 0.5)",
                },
              },
            }}
          >
            {scanResult || batchScanResult ? (
              <div>
                {batchMode ? renderBatchScanResult() : renderSingleScanResult()}
              </div>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  minHeight: "400px",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  borderRadius: 2,
                  border: "2px dashed rgba(255, 255, 255, 0.1)",
                }}
              >
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <ScannerIcon
                    sx={{
                      fontSize: 64,
                      color: "rgba(0, 188, 212, 0.3)",
                      mb: 2,
                    }}
                  />
                  <CozyTypography variant="h6" sx={{ mb: 1, opacity: 0.7 }}>
                    No Results Yet
                  </CozyTypography>
                  <CozySecondaryTypography
                    variant="body2"
                    sx={{ opacity: 0.5 }}
                  >
                    Upload a file and start scanning to see detailed results
                  </CozySecondaryTypography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </CozyToolContainer>
  );
};

export default YaraScanner;
