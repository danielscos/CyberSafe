import { useState } from "react";
import { CssBaseline, ThemeProvider, Alert } from "@mui/material";
import {
  CozyTypography,
  CozyToolContainer,
} from "./components/StyledComponents";
import { cozyTheme } from "./theme/cozyTheme";
import HashingTool from "./components/HashingTool";
import FileScanTool from "./components/FileScanTool";
import YaraScanner from "./components/YaraScanner";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import FloatingParticles from "./components/FloatingParticles";
import { useLocalStorage } from "./hooks/useApi";
import { NAVIGATION_TABS, MESSAGES } from "./constants";
import "./App.css";
import ClamAVScanner from "./components/ClamAVScanner";

// Use cozy cottage theme
const theme = cozyTheme;

// error boundary component
const ErrorFallback = ({ error, resetError }) => (
  <CozyToolContainer>
    <Alert severity="error" sx={{ mb: 2 }}>
      <CozyTypography variant="h6" gutterBottom>
        Something went wrong
      </CozyTypography>
      <CozyTypography variant="body2">{error.message}</CozyTypography>
    </Alert>
    <button
      onClick={resetError}
      style={{
        padding: "8px 16px",
        background: "#00c6fb",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Try again
    </button>
  </CozyToolContainer>
);

// main app component
function App() {
  // use localStorage to persist the active tab
  const [activeTab, setActiveTab] = useLocalStorage(
    "cyberSafeActiveTab",
    NAVIGATION_TABS.DASHBOARD,
  );
  const [error, setError] = useState(null);
  // error boundary functionality
  const resetError = () => setError(null);

  // handle tab changes
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setError(null); // clear any existing errors when switching tabs
  };

  // render the appropriate tool component based on active tab
  const renderActiveComponent = () => {
    if (error) {
      return <ErrorFallback error={error} resetError={resetError} />;
    }

    try {
      switch (activeTab) {
        case NAVIGATION_TABS.HASHING:
          return <HashingTool />;
        case NAVIGATION_TABS.FILESCAN:
          return <FileScanTool />;
        case NAVIGATION_TABS.YARA:
          return <YaraScanner />;
        case NAVIGATION_TABS.CLAMAV:
          return <ClamAVScanner />;
        case NAVIGATION_TABS.DASHBOARD:
        default:
          return <Dashboard />;
      }
    } catch (err) {
      setError(err);
      return <ErrorFallback error={err} resetError={resetError} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="main-bg">
        <FloatingParticles />
        <div className="dashboard-container">
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
          <main className="main-content" role="main">
            {renderActiveComponent()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
