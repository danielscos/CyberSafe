import { Alert } from '@mui/material';
import {
  PrimaryButton,
  SecondaryButton,
  WhiteTypography,
  SecondaryTypography,
  ResultPaper,
  ToolContainer,
  FileInfoContainer,
  MinHeightContainer,
  ModernLinearProgress,
  UploadButton,
} from './StyledComponents';
import { useFileType, useFileUpload } from '../hooks/useApi';
import { MESSAGES, LAYOUT } from '../constants';

const FileScanTool = () => {
  const { file, handleFileChange, clearFile } = useFileUpload();
  const { fileTypeResult, loading, error, detectFileType, clearFileType } = useFileType();

  const handleDetectFileType = async () => {
    try {
      await detectFileType(file);
    } catch (err) {
      console.error('File type detection failed:', err);
    }
  };

  const handleClearFile = () => {
    clearFile();
    clearFileType();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ToolContainer minHeight={LAYOUT.content.minHeight.filescan}>
      <WhiteTypography variant="h5" gutterBottom>
        File Type Scanner
      </WhiteTypography>

      <UploadButton
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
      </UploadButton>

      {file && (
        <FileInfoContainer>
          <WhiteTypography sx={{ mt: 1 }}>
            {MESSAGES.selectedFile} {file.name}
          </WhiteTypography>
          <SecondaryButton
            variant="outlined"
            onClick={handleClearFile}
            sx={{
              mt: 1,
              width: 140,
            }}
            aria-label="Deselect current file"
          >
            ✖ {MESSAGES.deselect}
          </SecondaryButton>
        </FileInfoContainer>
      )}

      <PrimaryButton
        variant="contained"
        color="primary"
        onClick={handleDetectFileType}
        disabled={loading || !file}
        sx={{
          mt: 2,
          width: '100%',
        }}
        aria-label="Detect file type of uploaded file"
      >
        {loading ? 'Analyzing...' : MESSAGES.detectFileType}
      </PrimaryButton>

      {loading && <ModernLinearProgress sx={{ mt: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <MinHeightContainer minHeight={220}>
        {fileTypeResult && !error && (
          <ResultPaper>
            <WhiteTypography variant="body1" sx={{ mb: 1 }}>
              <strong>Filename:</strong> {fileTypeResult.filename}
            </WhiteTypography>

            <WhiteTypography variant="body1" sx={{ mb: 1 }}>
              <strong>Type:</strong> {fileTypeResult.file_type}
            </WhiteTypography>

            <WhiteTypography variant="body1" sx={{ mb: 1 }}>
              <strong>MIME Type:</strong> {fileTypeResult.mime_type}
            </WhiteTypography>

            <WhiteTypography variant="body1" sx={{ mb: 1 }}>
              <strong>Size:</strong> {formatFileSize(fileTypeResult.filesize)}
            </WhiteTypography>

            <WhiteTypography
              variant="body1"
              sx={{
                mb: 1,
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              <strong>SHA-256:</strong> {fileTypeResult.sha256}
            </WhiteTypography>

            <WhiteTypography
              variant="body1"
              sx={{
                mb: 1,
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}
            >
              <strong>MD5:</strong> {fileTypeResult.md5}
            </WhiteTypography>

            <WhiteTypography variant="body1" sx={{ mb: 1 }}>
              <strong>Entropy:</strong> {fileTypeResult.entropy} ({fileTypeResult.entropy_label})
            </WhiteTypography>

            {fileTypeResult.entropy_explanation && (
              <SecondaryTypography variant="body2" sx={{ mb: 2 }}>
                {fileTypeResult.entropy_explanation}
              </SecondaryTypography>
            )}

            <WhiteTypography variant="body1" sx={{ mt: 2 }}>
              <strong>Description:</strong> {fileTypeResult.description}
            </WhiteTypography>
          </ResultPaper>
        )}
      </MinHeightContainer>
    </ToolContainer>
  );
};

export default FileScanTool;
