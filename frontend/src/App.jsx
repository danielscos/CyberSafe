import { useState } from "react";
import { CssBaseline, ThemeProvider, createTheme, Alert } from "@mui/material";
import { WhiteTypography, ToolContainer } from "./components/StyledComponents";
import HashingTool from "./components/HashingTool";
import FileScanTool from "./components/FileScanTool";
import Dashboard from "./components/Dashboard";
import Sidebar from "./components/Sidebar";
import { useLocalStorage } from "./hooks/useApi";
import { NAVIGATION_TABS, MESSAGES } from "./constants";
import "./App.css";

// create Material-UI theme
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00c6fb",
    },
    secondary: {
      main: "#4caf50",
    },
  },
});

// YARA tool plaeholder component
const YaraTool = () => (
  <ToolContainer>
    <WhiteTypography variant="h5" gutterBottom>
      YARA Scan (Coming Soon)
    </WhiteTypography>
    <Alert severity="info">{MESSAGES.yaraComingSoon}</Alert>
  </ToolContainer>
);

// error boundary component
const ErrorFallback = ({ error, resetError }) => (
  <ToolContainer>
    <Alert severity="error" sx={{ mb: 2 }}>
      <WhiteTypography variant="h6" gutterBottom>
        Something went wrong
      </WhiteTypography>
      <WhiteTypography variant="body2">{error.message}</WhiteTypography>
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
  </ToolContainer>
);

// Main App Component
function App() {
  // use localStorage to persist the active tab
  const [activeTab, setActiveTab] = useLocalStorage(
    "cyberSafeActiveTab",
    NAVIGATION_TABS.DASHBOARD,
  );
  const [error, setError] = useState(null);

  // error boundary functionality
  const resetError = () => setError(null);

  // Handle tab changes
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
          return <YaraTool />;
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
