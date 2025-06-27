import { Alert, Box, Chip, IconButton, Tooltip } from "@mui/material";
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

  return (
    <CozyToolContainer>
      <CozyTypography variant="h5" gutterBottom>
        File Type Scanner
      </CozyTypography>

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
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
              onClick={handleClearFile}
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
          mt: 3,
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
        aria-label="Detect file type of uploaded file"
      >
        {loading ? "Analyzing..." : MESSAGES.detectFileType}
      </CozyPrimaryButton>

      {loading && <CozyLinearProgress sx={{ mt: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <div style={{ minHeight: 120 }}>
        {fileTypeResult && !error && (
          <CozyResultPaper>
            <CozyTypography variant="body1" sx={{ mb: 1 }}>
              <strong>Filename:</strong> {fileTypeResult.filename}
            </CozyTypography>
            <CozyTypography variant="body1" sx={{ mb: 1 }}>
              <strong>Type:</strong> {fileTypeResult.file_type}
            </CozyTypography>

            <CozyTypography variant="body1" sx={{ mb: 1 }}>
              <strong>MIME Type:</strong> {fileTypeResult.mime_type}
            </CozyTypography>

            <CozyTypography variant="body1" sx={{ mb: 1 }}>
              <strong>Size:</strong> {formatFileSize(fileTypeResult.filesize)}
            </CozyTypography>

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

            <CozyTypography variant="body1" sx={{ mb: 1 }}>
              <strong>Entropy:</strong> {fileTypeResult.entropy} (
              {fileTypeResult.entropy_label})
            </CozyTypography>

            {fileTypeResult.entropy_explanation && (
              <CozySecondaryTypography variant="body2" sx={{ mb: 2 }}>
                {fileTypeResult.entropy_explanation}
              </CozySecondaryTypography>
            )}

            <CozyTypography variant="body1" sx={{ mt: 2 }}>
              <strong>Description:</strong> {fileTypeResult.description}
            </CozyTypography>
          </CozyResultPaper>
        )}
      </div>
    </CozyToolContainer>
  );
};

export default FileScanTool;
