import { createTheme } from "@mui/material/styles";

// Create theme function that accepts mode parameter
export const createCozyTheme = (mode = "dark") => createTheme({
  palette: {
    mode,
    primary: {
      main: "#00BCD4", // Cyan - main color
      light: "#4DD0E1", // Light cyan
      dark: "#00838F", // Dark cyan
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#26C6DA", // Bright cyan
      light: "#80DEEA", // Very light cyan
      dark: "#0097A7", // Deep cyan
      contrastText: "#FFFFFF",
    },
    background: {
      default: mode === "dark" ? "#0D1117" : "#FFFFFF", // GitHub-like dark background or white
      paper: mode === "dark" ? "#161B22" : "#F8F9FA", // Slightly lighter dark gray or very light gray
    },
    surface: {
      main: mode === "dark" ? "#21262D" : "#E9ECEF", // Medium dark surface or light gray
      light: mode === "dark" ? "#30363D" : "#F8F9FA", // Light surface
      dark: mode === "dark" ? "#0D1117" : "#DEE2E6", // Darkest surface or darker gray
    },
    text: {
      primary: mode === "dark" ? "#F0F6FC" : "#212529", // Very light gray or dark text
      secondary: mode === "dark" ? "#8B949E" : "#6C757D", // Medium gray
      disabled: mode === "dark" ? "#484F58" : "#ADB5BD", // Muted gray
    },
    divider: mode === "dark" ? "#30363D" : "#DEE2E6", // Clean divider color
    action: {
      hover: mode === "dark" ? "rgba(0, 188, 212, 0.08)" : "rgba(0, 188, 212, 0.04)", // Cyan hover
      selected: mode === "dark" ? "rgba(0, 188, 212, 0.12)" : "rgba(0, 188, 212, 0.08)", // Cyan selected
      disabled: mode === "dark" ? "rgba(139, 148, 158, 0.26)" : "rgba(108, 117, 125, 0.26)", // Gray disabled
      disabledBackground: mode === "dark" ? "rgba(139, 148, 158, 0.12)" : "rgba(108, 117, 125, 0.12)",
    },
    error: {
      main: "#D32F2F",
      light: "#EF5350",
      dark: "#C62828",
    },
    warning: {
      main: "#F57C00",
      light: "#FF9800",
      dark: "#E65100",
    },
    info: {
      main: "#1976D2",
      light: "#2196F3",
      dark: "#0D47A1",
    },
    success: {
      main: "#388E3C",
      light: "#4CAF50",
      dark: "#2E7D32",
    },
  },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontFamily:
        '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
      fontWeight: 700,
      color: mode === "dark" ? "#F0F6FC" : "#212529",
      letterSpacing: "-0.02em",
      fontSize: "2.5rem",
    },
    h2: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 700,
      color: mode === "dark" ? "#F0F6FC" : "#212529",
      letterSpacing: "-0.01em",
      fontSize: "2rem",
    },
    h3: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 600,
      color: mode === "dark" ? "#F0F6FC" : "#212529",
      letterSpacing: "-0.005em",
      fontSize: "1.75rem",
    },
    h4: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 600,
      color: mode === "dark" ? "#F0F6FC" : "#212529",
      letterSpacing: "0em",
      fontSize: "1.5rem",
    },
    h5: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 600,
      color: mode === "dark" ? "#F0F6FC" : "#212529",
      letterSpacing: "0.005em",
      fontSize: "1.25rem",
    },
    h6: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 600,
      color: mode === "dark" ? "#F0F6FC" : "#212529",
      letterSpacing: "0.01em",
      fontSize: "1.125rem",
    },
    body1: {
      fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
      color: mode === "dark" ? "#F0F6FC" : "#212529",
      lineHeight: 1.6,
      fontSize: "1rem",
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
      color: mode === "dark" ? "#8B949E" : "#6C757D",
      lineHeight: 1.5,
      fontSize: "0.875rem",
      fontWeight: 400,
    },
    caption: {
      fontFamily:
        '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
      color: mode === "dark" ? "#8B949E" : "#6C757D",
      fontSize: "0.75rem",
      fontWeight: 500,
      letterSpacing: "0.03em",
    },
    overline: {
      fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: mode === "dark" ? "#8B949E" : "#6C757D",
    },
    button: {
      fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.02em",
    },
  },
  shape: {
    borderRadius: 12, // Softer, more rounded corners
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === "dark" ? "#0D1117" : "#FFFFFF",
          backgroundImage: mode === "dark" 
            ? `radial-gradient(circle at 1px 1px, rgba(0, 188, 212, 0.05) 1px, transparent 0)`
            : `radial-gradient(circle at 1px 1px, rgba(0, 188, 212, 0.02) 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: mode === "dark" ? "#161B22" : "#F8F9FA",
          backgroundImage: "none",
          border: mode === "dark" ? "1px solid rgba(48, 54, 61, 0.5)" : "1px solid rgba(222, 226, 230, 0.5)",
          boxShadow: mode === "dark" ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
        elevation1: {
          boxShadow: mode === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.25)" : "0 2px 8px rgba(0, 0, 0, 0.08)",
        },
        elevation2: {
          boxShadow: mode === "dark" ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
        elevation3: {
          boxShadow: mode === "dark" ? "0 6px 16px rgba(0, 0, 0, 0.35)" : "0 6px 16px rgba(0, 0, 0, 0.12)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0, 188, 212, 0.3)",
            transform: "translateY(-1px)",
            transition: "all 0.2s ease",
          },
        },
        contained: {
          background: "linear-gradient(45deg, #00BCD4 30%, #26C6DA 90%)",
          color: "#FFFFFF",
          "&:hover": {
            background: "linear-gradient(45deg, #00ACC1 30%, #00BCD4 90%)",
          },
        },
        outlined: {
          borderColor: "#00BCD4",
          color: "#00BCD4",
          "&:hover": {
            borderColor: "#4DD0E1",
            backgroundColor: "rgba(0, 188, 212, 0.08)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: mode === "dark" ? "#161B22" : "#F8F9FA",
          border: mode === "dark" ? "1px solid rgba(48, 54, 61, 0.5)" : "1px solid rgba(222, 226, 230, 0.5)",
          borderRadius: 16,
          boxShadow: mode === "dark" ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: mode === "dark" ? "0 6px 20px rgba(0, 0, 0, 0.4)" : "0 6px 20px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid",
        },
        standardInfo: {
          backgroundColor: mode === "dark" ? "#0D1B26" : "#E7F3FF",
          borderColor: "#00BCD4",
          color: mode === "dark" ? "#4DD0E1" : "#0066CC",
        },
        standardSuccess: {
          backgroundColor: mode === "dark" ? "#0A1F0A" : "#E8F5E8",
          borderColor: "#4CAF50",
          color: mode === "dark" ? "#81C784" : "#2E7D32",
        },
        standardWarning: {
          backgroundColor: mode === "dark" ? "#2D1F0A" : "#FFF8E1",
          borderColor: "#FF9800",
          color: mode === "dark" ? "#FFB74D" : "#E65100",
        },
        standardError: {
          backgroundColor: mode === "dark" ? "#2D0A0A" : "#FFEBEE",
          borderColor: "#F44336",
          color: mode === "dark" ? "#E57373" : "#C62828",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: mode === "dark" ? "#21262D" : "#FFFFFF",
            borderRadius: 8,
            color: mode === "dark" ? "#F0F6FC" : "#212529",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00BCD4",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#4DD0E1",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: mode === "dark" ? "#21262D" : "#E9ECEF",
          borderRadius: 12,
          minHeight: 48,
        },
        indicator: {
          backgroundColor: "#00BCD4",
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          color: mode === "dark" ? "#8B949E" : "#6C757D",
          "&.Mui-selected": {
            color: "#00BCD4",
          },
          "&:hover": {
            color: "#4DD0E1",
            backgroundColor: "rgba(0, 188, 212, 0.08)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: mode === "dark" ? "#21262D" : "#E9ECEF",
          color: mode === "dark" ? "#F0F6FC" : "#212529",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: mode === "dark" ? "#30363D" : "#DEE2E6",
          },
        },
        filled: {
          backgroundColor: "#00BCD4",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#4DD0E1",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: mode === "dark" ? "#30363D" : "#E9ECEF",
          borderRadius: 4,
        },
        bar: {
          backgroundColor: "#00BCD4",
          borderRadius: 4,
        },
      },
    },
  },
});

// Additional utility colors for custom components - Dynamic based on mode
export const getCozyColors = (mode = "dark") => ({
  // Background colors
  warmCream: mode === "dark" ? "#0D1117" : "#FFFFFF", // Main background
  antiqueWhite: mode === "dark" ? "#161B22" : "#F8F9FA", // Paper/card background
  wheat: mode === "dark" ? "#21262D" : "#E9ECEF", // Surface color
  cornsilk: mode === "dark" ? "#30363D" : "#DEE2E6", // Light surface

  // Cyan theme accent colors (same for both modes)
  saddleBrown: "#00BCD4", // Primary cyan accent
  sienna: "#4DD0E1", // Light cyan accent
  darkBrown: "#00838F", // Dark cyan accent
  chocolate: "#26C6DA", // Secondary cyan accent
  burlywood: "#80DEEA", // Bright cyan accent
  darkGoldenrod: "#0097A7", // Deep cyan accent

  // Text colors
  textPrimary: mode === "dark" ? "#F0F6FC" : "#212529", // Primary text
  textSecondary: mode === "dark" ? "#8B949E" : "#6C757D", // Secondary text
  textDisabled: mode === "dark" ? "#484F58" : "#ADB5BD", // Disabled text

  // Accent colors for special states
  accent: {
    warm: "#00BCD4",
    cozy: "#26C6DA",
    comfortable: "#4DD0E1",
  },

  // Status colors with mode adjustments
  status: {
    success: mode === "dark" ? "#81C784" : "#2E7D32",
    warning: mode === "dark" ? "#FFB74D" : "#E65100",
    error: mode === "dark" ? "#E57373" : "#C62828",
    info: mode === "dark" ? "#4DD0E1" : "#0066CC",
  },
});

// Default dark theme instance (for backwards compatibility)
export const cozyTheme = createCozyTheme("dark");

// Legacy cozyColors export (for backwards compatibility)
export const cozyColors = getCozyColors("dark");

export default cozyTheme;
