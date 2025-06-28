// API Configuration
export const API_BASE_URL = "http://127.0.0.1:8000";

// Hash Types
export const HASH_TYPES = [
  { label: "MD5", value: "md5" },
  { label: "SHA-1", value: "sha1" },
  { label: "SHA-256", value: "sha256" },
  { label: "SHA-512", value: "sha512" },
  { label: "BLAKE3", value: "blake3" },
];

// Color Palette
export const COLORS = {
  primary: {
    main: "#00c6fb",
    dark: "#005bea",
    light: "#33d1ff",
  },
  secondary: {
    main: "#4caf50",
    dark: "#388e3c",
    light: "#66bb6a",
  },
  background: {
    primary: "#23232b",
    secondary: "rgba(0, 0, 0, 0.3)",
    glass: "rgba(255, 255, 255, 0.1)",
    hover: "rgba(0, 198, 251, 0.1)",
    hoverSecondary: "rgba(0, 91, 234, 0.18)",
  },
  text: {
    primary: "#fff",
    secondary: "#aaa",
  },
  border: {
    primary: "rgba(255, 255, 255, 0.1)",
    light: "#e0e0e0",
  },
};

// Navigation Tabs
export const NAVIGATION_TABS = {
  DASHBOARD: "dashboard",
  HASHING: "hashing",
  FILESCAN: "filescan",
  YARA: "yara",
};

// Sidebar Menu Items
export const SIDEBAR_TOOLS = [
  { id: NAVIGATION_TABS.DASHBOARD, icon: "🏠", label: "Home" },
  { id: NAVIGATION_TABS.HASHING, icon: "#", label: "Hashing" },
  { id: NAVIGATION_TABS.FILESCAN, icon: "📁", label: "File Scan" },
  { id: NAVIGATION_TABS.YARA, icon: "🧬", label: "YARA Scan" },
];

export const SIDEBAR_RESOURCES = [
  {
    id: "virustotal",
    icon: "🌐",
    label: "VirusTotal",
    url: "https://www.virustotal.com",
  },
  {
    id: "hybrid",
    icon: "🔗",
    label: "Hybrid Analysis",
    url: "https://hybrid-analysis.com",
  },
  { id: "anyrun", icon: "🖥️", label: "ANY.RUN", url: "https://any.run" },
  {
    id: "malwarebazaar",
    icon: "💾",
    label: "MalwareBazaar",
    url: "https://bazaar.abuse.ch",
  },
  {
    id: "exploitdb",
    icon: "📚",
    label: "Exploit Database",
    url: "https://www.exploit-db.com",
  },
];

// API Endpoints
export const API_ENDPOINTS = {
  HASH: (type, text) =>
    `${API_BASE_URL}/hash_${type}?text=${encodeURIComponent(text)}`,
  FILETYPE: `${API_BASE_URL}/filetype`,
  YARA: {
    SCAN: `${API_BASE_URL}/yara/scan`,
    VALIDATE: `${API_BASE_URL}/yara/validate-rules`,
    DEFAULT_RULES: `${API_BASE_URL}/yara/default-rules`,
    BATCH_SCAN: `${API_BASE_URL}/yara/batch-scan`,
  },
};

// Common Styles
export const COMMON_STYLES = {
  glassMorphism: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
  },
  buttonPrimary: {
    fontWeight: "bold",
    fontSize: 16,
    borderRadius: 2,
    boxShadow:
      "0 6px 24px 0 rgba(0,198,251,0.18), 0 1.5px 6px 0 rgba(0,91,234,0.10)",
  },
  buttonSecondary: {
    fontWeight: "bold",
    fontSize: 15,
    color: COLORS.primary.main,
    borderRadius: 2,
    background: COLORS.background.hover,
    transition: "all 0.2s",
    "&:hover": {
      background: COLORS.background.hoverSecondary,
      color: COLORS.text.primary,
    },
  },
  textField: {
    "& .MuiInputLabel-root": {
      color: COLORS.text.primary,
      fontWeight: "bold",
    },
    "& .MuiOutlinedInput-root": {
      color: COLORS.text.primary,
      fontWeight: "bold",
      "& fieldset": {
        borderColor: COLORS.border.primary,
      },
      "&:hover fieldset": {
        borderColor: COLORS.primary.main,
      },
      "&.Mui-focused fieldset": {
        borderColor: COLORS.primary.main,
      },
    },
  },
  select: {
    color: COLORS.text.primary,
    fontWeight: "bold",
    background: COLORS.background.primary,
    borderRadius: 1,
  },
  paper: {
    background: COLORS.background.primary,
    color: COLORS.text.primary,
  },
  codeBlock: {
    color: COLORS.text.primary,
    fontWeight: "bold",
    wordBreak: "break-all",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    backgroundColor: COLORS.background.secondary,
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border.primary}`,
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 1.5,
  },
};

// Animation Durations
export const ANIMATIONS = {
  fast: "0.2s",
  normal: "0.3s",
  slow: "0.5s",
};

// Layout Constants
export const LAYOUT = {
  sidebar: {
    width: 280,
  },
  content: {
    maxWidth: 600,
    padding: 24,
    minHeight: {
      hashing: 420,
      filescan: 520,
    },
  },
};

// Messages
export const MESSAGES = {
  copySuccess: "Copied!",
  copyDefault: "Copy",
  uploadFile: "Upload File",
  detectFileType: "Analyze File",
  generateHash: "Generate Hash",
  deselect: "Deselect",
  selectedFile: "Selected:",
  hashingTool: "Hashing Tool",
  yaraScanner: "YARA Scanner",
  scanFile: "Scan File",
  scanFiles: "Scan Files",
  validateRules: "Validate Rules",
  loadDefaultRules: "Load Default Rules",
  clearRules: "Clear Rules",
  scanInProgress: "Scanning...",
  validatingRules: "Validating...",
  clean: "Clean",
  suspicious: "Suspicious",
  error: "Error",
  noMatches: "No threats detected",
  matchesFound: "matches found",
  rulesValid: "Rules are valid",
  rulesInvalid: "Rules contain errors",
  customRules: "Custom YARA Rules",
  scanResults: "Scan Results",
  batchScanResults: "Batch Scan Results",
  useDefaultRules: "Use Default Rules",
  addCustomRules: "Add Custom Rules",
};
