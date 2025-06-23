import { Alert } from "@mui/material";
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
        <CozyFileInfoContainer>
          <CozyTypography sx={{ mt: 1 }}>
            {MESSAGES.selectedFile} {file.name}
          </CozyTypography>
          <CozySecondaryButton
            variant="outlined"
            onClick={handleClearFile}
            sx={{
              mt: 1,
              width: 140,
            }}
            aria-label="Deselect current file"
          >
            ✖ {MESSAGES.deselect}
          </CozySecondaryButton>
        </CozyFileInfoContainer>
      )}

      <CozyPrimaryButton
        variant="contained"
        color="primary"
        onClick={handleDetectFileType}
        disabled={loading || !file}
        sx={{
          mt: 2,
          width: "100%",
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
