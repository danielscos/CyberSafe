import { createTheme } from "@mui/material/styles";

export const cozyTheme = createTheme({
  palette: {
    mode: "dark",
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
      default: "#0D1117", // GitHub-like dark background
      paper: "#161B22", // Slightly lighter dark gray
    },
    surface: {
      main: "#21262D", // Medium dark surface
      light: "#30363D", // Light surface
      dark: "#0D1117", // Darkest surface
    },
    text: {
      primary: "#F0F6FC", // Very light gray - excellent contrast
      secondary: "#8B949E", // Medium gray - good contrast
      disabled: "#484F58", // Muted gray
    },
    divider: "#30363D", // Clean divider color
    action: {
      hover: "rgba(0, 188, 212, 0.08)", // Cyan hover
      selected: "rgba(0, 188, 212, 0.12)", // Cyan selected
      disabled: "rgba(139, 148, 158, 0.26)", // Gray disabled
      disabledBackground: "rgba(139, 148, 158, 0.12)",
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
      color: "#F0F6FC",
      letterSpacing: "-0.02em",
      fontSize: "2.5rem",
    },
    h2: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 700,
      color: "#F0F6FC",
      letterSpacing: "-0.01em",
      fontSize: "2rem",
    },
    h3: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 600,
      color: "#F0F6FC",
      letterSpacing: "-0.005em",
      fontSize: "1.75rem",
    },
    h4: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 600,
      color: "#F0F6FC",
      letterSpacing: "0em",
      fontSize: "1.5rem",
    },
    h5: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 600,
      color: "#F0F6FC",
      letterSpacing: "0.005em",
      fontSize: "1.25rem",
    },
    h6: {
      fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
      fontWeight: 600,
      color: "#F0F6FC",
      letterSpacing: "0.01em",
      fontSize: "1.125rem",
    },
    body1: {
      fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
      color: "#F0F6FC",
      lineHeight: 1.6,
      fontSize: "1rem",
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
      color: "#8B949E",
      lineHeight: 1.5,
      fontSize: "0.875rem",
      fontWeight: 400,
    },
    caption: {
      fontFamily:
        '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
      color: "#8B949E",
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
      color: "#8B949E",
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
          backgroundColor: "#0D1117",
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(0, 188, 212, 0.05) 1px, transparent 0)
          `,
          backgroundSize: "20px 20px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#161B22",
          backgroundImage: "none",
          border: "1px solid rgba(48, 54, 61, 0.5)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
        },
        elevation2: {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        },
        elevation3: {
          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.35)",
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
          backgroundColor: "#161B22",
          border: "1px solid rgba(48, 54, 61, 0.5)",
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
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
          backgroundColor: "#0D1B26",
          borderColor: "#00BCD4",
          color: "#4DD0E1",
        },
        standardSuccess: {
          backgroundColor: "#0A1F0A",
          borderColor: "#4CAF50",
          color: "#81C784",
        },
        standardWarning: {
          backgroundColor: "#2D1F0A",
          borderColor: "#FF9800",
          color: "#FFB74D",
        },
        standardError: {
          backgroundColor: "#2D0A0A",
          borderColor: "#F44336",
          color: "#E57373",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#21262D",
            borderRadius: 8,
            color: "#F0F6FC",
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
          backgroundColor: "#21262D",
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
          color: "#8B949E",
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
          backgroundColor: "#21262D",
          color: "#F0F6FC",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#30363D",
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
          backgroundColor: "#30363D",
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

// Additional utility colors for custom components - Dark + Cyan Theme
export const cozyColors = {
  // Dark theme background colors
  warmCream: "#0D1117", // Main dark background
  antiqueWhite: "#161B22", // Paper/card background
  wheat: "#21262D", // Surface color
  cornsilk: "#30363D", // Light surface

  // Cyan theme accent colors
  saddleBrown: "#00BCD4", // Primary cyan accent
  sienna: "#4DD0E1", // Light cyan accent
  darkBrown: "#00838F", // Dark cyan accent
  chocolate: "#26C6DA", // Secondary cyan accent
  burlywood: "#80DEEA", // Bright cyan accent
  darkGoldenrod: "#0097A7", // Deep cyan accent

  // Dark theme text colors
  textPrimary: "#F0F6FC", // Primary text - high contrast
  textSecondary: "#8B949E", // Secondary text - medium contrast
  textDisabled: "#484F58", // Disabled text - low contrast

  // Accent colors for special states
  accent: {
    warm: "#00BCD4",
    cozy: "#26C6DA",
    comfortable: "#4DD0E1",
  },

  // Status colors with dark theme adjustments
  status: {
    success: "#81C784",
    warning: "#FFB74D",
    error: "#E57373",
    info: "#4DD0E1",
  },
};

export default cozyTheme;
