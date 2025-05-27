import React, { useState } from 'react'
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, TextField, Typography, Paper, Alert, MenuItem, Select, FormControl, InputLabel, CssBaseline, ThemeProvider, createTheme, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import './App.css'

const theme = createTheme();

const HASH_TYPES = [
  { label: 'MD5', value: 'md5' },
  { label: 'SHA-1', value: 'sha1' },
  { label: 'SHA-256', value: 'sha256' },
  { label: 'SHA-512', value: 'sha512' },
  { label: 'BLAKE3', value: 'blake3' },
];

const ModernLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'light' ? '#e0e0e0' : '#23232b',
  boxShadow: '0 6px 24px 0 rgba(0,0,0,0.18), 0 1.5px 6px 0 rgba(0,0,0,0.10)',
  overflow: 'hidden',
  '& .MuiLinearProgress-bar': {
    borderRadius: 8,
    background: 'linear-gradient(90deg, #00c6fb 0%, #005bea 100%)',
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.22), 0 1.5px 6px 0 rgba(0,0,0,0.10)',
  },
}));

function App() {
  const [hashInput, setHashInput] = useState('');
  const [hashType, setHashType] = useState('md5');
  const [hashResult, setHashResult] = useState(null);
  const [file, setFile] = useState(null);
  const [fileTypeResult, setFileTypeResult] = useState(null);
  const [hashLoading, setHashLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);

  const handleHash = async () => {
    setHashLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/hash_${hashType}?text=${encodeURIComponent(hashInput)}`
      );
      await new Promise(res => setTimeout(res, 2000));
      setHashResult(response.data);
    } catch (error) {
      setHashResult({ error: error.message });
    } finally {
      setHashLoading(false);
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
    formData.append('file', file);
    try {
      const response = await axios.post('http://127.0.0.1:8000/filetype', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await new Promise(res => setTimeout(res, 1000)); // <-- Add this line for demo
      setFileTypeResult(response.data);
    } catch (error) {
      setFileTypeResult({ error: error.message });
    }
    setFileLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="cybersafe-bg">
        <motion.div
          className="cybersafe-window"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <Typography variant="h3" align="center" className="cybersafe-title">
            CyberSafe
          </Typography>

          {/* Hashing Feature */}
          <Paper elevation={3} className="cybersafe-card">
            <Typography variant="h5" gutterBottom>Hash a String</Typography>
            <div className="cybersafe-row">
              <FormControl variant="outlined" size="small" style={{ minWidth: 110 }}>
                <InputLabel id="hash-type-label" style={{ color: '#fff' }}>Type</InputLabel>
                <Select
                  labelId="hash-type-label"
                  value={hashType}
                  onChange={e => setHashType(e.target.value)}
                  label="Type"
                  className="cybersafe-select"
                  style={{ color: '#fff', borderColor: '#444' }}
                >
                  {HASH_TYPES.map(ht => (
                    <MenuItem key={ht.value} value={ht.value}>{ht.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Text to hash"
                variant="outlined"
                value={hashInput}
                onChange={e => {
                  setHashInput(e.target.value);
                  setHashResult(null);
                }}
                fullWidth
                autoFocus
              />
              <Button
                variant="outlined"
                className={`cybersafe-btn${hashLoading ? ' cybersafe-btn--wide' : ''}`}
                onClick={handleHash}
                disabled={hashLoading || !hashInput.trim()}
              >
                {hashLoading ? 'Hashing...' : 'Hash'}
              </Button>
            </div>
            <div className="cybersafe-result">
              {hashLoading && <ModernLinearProgress style={{ marginBottom: 12, width: '100%' }} />}
              <AnimatePresence>
                {hashResult && !hashResult.error && (
                  <motion.div
                    key="hash-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Alert severity="success" className="cybersafe-alert">
                      <div><strong>Hash Type:</strong> {hashResult.hash_type}</div>
                      <div><strong>Hash:</strong> <code>{hashResult.hash}</code></div>
                    </Alert>
                  </motion.div>
                )}
                {hashResult && hashResult.error && (
                  <motion.div
                    key="hash-error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Alert severity="error" className="cybersafe-alert">
                      Error: {hashResult.error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Paper>

          {/* Filetype Feature */}
          <Paper elevation={3} className="cybersafe-card">
            <Typography variant="h5" gutterBottom>Detect File Type</Typography>
            <div className="cybersafe-row">
              <Button
                variant="outlined"
                component="label"
                className="cybersafe-btn"
              >
                Select File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <Typography className="cybersafe-filename">
                {file ? file.name : 'No file selected'}
              </Typography>
              <Button
                variant="outlined"
                className="cybersafe-btn"
                onClick={handleFileType}
                disabled={!file || fileLoading}
              >
                {fileLoading ? 'Detecting...' : 'Detect'}
              </Button>
            </div>
            <div className="cybersafe-result">
              {fileLoading && <ModernLinearProgress style={{ marginBottom: 12, width: '100%' }} />}
              <AnimatePresence>
                {fileTypeResult && !fileTypeResult.error && (
                  <motion.div
                    key="filetype-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Alert severity="success" className="cybersafe-alert">
                      <div><strong>File:</strong> {fileTypeResult.filename}</div>
                      <div><strong>Type:</strong> {fileTypeResult.file_type} ({fileTypeResult.mime_type})</div>
                      <div>
                        <strong>Size:</strong> {(fileTypeResult.filesize / (1024 * 1024)).toFixed(2)} MB
                      </div>
                      <div>
                        <strong>SHA-256:</strong> <code>{fileTypeResult.sha256}</code>
                      </div>
                      <div>
                        <strong>MD5:</strong> <code>{fileTypeResult.md5}</code>
                      </div>
                      <div>
                        <strong>Entropy:</strong> {fileTypeResult.entropy}
                        <span style={{ marginLeft: 8, fontWeight: 600 }}>
                          {fileTypeResult.entropy_label && `(${fileTypeResult.entropy_label})`}
                        </span>
                      </div>
                      {fileTypeResult.entropy_explanation && (
                        <div style={{ color: "#b2dfdb", marginBottom: 6, marginLeft: 2 }}>
                          {fileTypeResult.entropy_explanation}
                        </div>
                      )}
                      <div style={{ marginTop: 8 }}>
                        <strong>Description:</strong> {fileTypeResult.description}
                      </div>
                    </Alert>
                  </motion.div>
                )}
                {fileTypeResult && fileTypeResult.error && (
                  <motion.div
                    key="filetype-error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Alert severity="error" className="cybersafe-alert">
                      Error: {fileTypeResult.error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Paper>
        </motion.div>
      </div>
    </ThemeProvider>
  )
}

export default App