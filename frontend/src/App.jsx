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
      <div className="main-bg">
        <div className="dashboard-container">
          <aside className="sidebar-glass">
            <h1 className="brand-title">CyberSafe</h1>
            <div className="sidebar-section">
              <h2>TOOLS</h2>
              <ul>
                <li className="sidebar-btn active"><span className="icon">#</span> Hashing</li>
                <li className="sidebar-btn"><span className="icon">📁</span> File Scan</li>
                <li className="sidebar-btn"><span className="icon">🧬</span> YARA Scan</li>
              </ul>
            </div>
            <div className="sidebar-section">
              <h2>RESOURCES</h2>
              <ul>
                <li className="sidebar-btn"><span className="icon">🌐</span> VirusTotal</li>
                <li className="sidebar-btn"><span className="icon">🔗</span> Hybrid Analysis</li>
                <li className="sidebar-btn"><span className="icon">🖥️</span> ANY.RUN</li>
                <li className="sidebar-btn"><span className="icon">💾</span> MalwareBazaar</li>
                <li className="sidebar-btn"><span className="icon">📚</span> Exploit Database</li>
              </ul>
            </div>
          </aside>
          <main className="main-content">
            <div className="dashboard-row">
              <div className="dashboard-card">
                <div className="card-label">CPU</div>
                <div className="card-value">Intel Core i7–12700H</div>
              </div>
              <div className="dashboard-card">
                <div className="card-label">Memory</div>
                <div className="card-value">16 GB</div>
              </div>
            </div>
            <div className="dashboard-news">
              <h2>Cybersecurity News</h2>
              <div className="news-placeholder">
                {/* News content here */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App