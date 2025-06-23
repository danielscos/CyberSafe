import { createTheme } from "@mui/material/styles";

export const cozyTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#DEB887", // Burlywood - warmer primary for dark mode
      light: "#F5DEB3", // Wheat
      dark: "#CD853F", // Peru
      contrastText: "#1A1A1A",
    },
    secondary: {
      main: "#DAA520", // Goldenrod
      light: "#FFD700", // Gold
      dark: "#B8860B", // Dark goldenrod
      contrastText: "#1A1A1A",
    },
    background: {
      default: "#1A1A1A", // Very dark gray with warm undertone
      paper: "#2D2A26", // Dark brown-gray
    },
    surface: {
      main: "#3D3731", // Dark warm gray
      light: "#4A453E", // Lighter warm gray
      dark: "#252219", // Darker warm gray
    },
    text: {
      primary: "#F5DEB3", // Wheat - warm light text
      secondary: "#DEB887", // Burlywood - secondary text
      disabled: "#8D7B6B", // Muted brown-gray
    },
    divider: "#5D4E42", // Dark warm brown divider
    action: {
      hover: "rgba(222, 184, 135, 0.08)", // Burlywood hover
      selected: "rgba(222, 184, 135, 0.12)", // Burlywood selected
      disabled: "rgba(222, 184, 135, 0.26)", // Burlywood disabled
      disabledBackground: "rgba(222, 184, 135, 0.12)",
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
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      color: "#F5DEB3",
      letterSpacing: "-0.01562em",
    },
    h2: {
      fontWeight: 600,
      color: "#F5DEB3",
      letterSpacing: "-0.00833em",
    },
    h3: {
      fontWeight: 600,
      color: "#F5DEB3",
      letterSpacing: "0em",
    },
    h4: {
      fontWeight: 600,
      color: "#F5DEB3",
      letterSpacing: "0.00735em",
    },
    h5: {
      fontWeight: 600,
      color: "#F5DEB3",
      letterSpacing: "0em",
    },
    h6: {
      fontWeight: 600,
      color: "#F5DEB3",
      letterSpacing: "0.0075em",
    },
    body1: {
      color: "#F5DEB3",
      lineHeight: 1.6,
    },
    body2: {
      color: "#DEB887",
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: "none", // Remove uppercase
    },
  },
  shape: {
    borderRadius: 12, // Softer, more rounded corners
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#1A1A1A",
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(222, 184, 135, 0.05) 1px, transparent 0)
          `,
          backgroundSize: "20px 20px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#2D2A26",
          backgroundImage: "none",
          border: "1px solid rgba(222, 184, 135, 0.2)",
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
            boxShadow: "0 2px 8px rgba(222, 184, 135, 0.3)",
            transform: "translateY(-1px)",
            transition: "all 0.2s ease",
          },
        },
        contained: {
          background: "linear-gradient(45deg, #DEB887 30%, #DAA520 90%)",
          color: "#1A1A1A",
          "&:hover": {
            background: "linear-gradient(45deg, #F5DEB3 30%, #DEB887 90%)",
          },
        },
        outlined: {
          borderColor: "#DEB887",
          color: "#DEB887",
          "&:hover": {
            borderColor: "#F5DEB3",
            backgroundColor: "rgba(222, 184, 135, 0.08)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#2D2A26",
          border: "1px solid rgba(222, 184, 135, 0.2)",
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
          backgroundColor: "#1A2332",
          borderColor: "#2196F3",
          color: "#64B5F6",
        },
        standardSuccess: {
          backgroundColor: "#1B2A1B",
          borderColor: "#4CAF50",
          color: "#81C784",
        },
        standardWarning: {
          backgroundColor: "#332A1A",
          borderColor: "#FF9800",
          color: "#FFB74D",
        },
        standardError: {
          backgroundColor: "#331A1A",
          borderColor: "#F44336",
          color: "#E57373",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#3D3731",
            borderRadius: 8,
            color: "#F5DEB3",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#DEB887",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#F5DEB3",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: "#3D3731",
          borderRadius: 12,
          minHeight: 48,
        },
        indicator: {
          backgroundColor: "#DEB887",
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
          color: "#DEB887",
          "&.Mui-selected": {
            color: "#F5DEB3",
          },
          "&:hover": {
            color: "#F5DEB3",
            backgroundColor: "rgba(222, 184, 135, 0.08)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#3D3731",
          color: "#F5DEB3",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#4A453E",
          },
        },
        filled: {
          backgroundColor: "#DEB887",
          color: "#1A1A1A",
          "&:hover": {
            backgroundColor: "#F5DEB3",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: "#4A453E",
          borderRadius: 4,
        },
        bar: {
          backgroundColor: "#DEB887",
          borderRadius: 4,
        },
      },
    },
  },
});

// Additional utility colors for custom components - Dark Theme
export const cozyColors = {
  // Dark theme background colors
  warmCream: "#1A1A1A", // Main dark background
  antiqueWhite: "#2D2A26", // Paper/card background
  wheat: "#3D3731", // Surface color
  cornsilk: "#4A453E", // Light surface

  // Dark theme accent colors
  saddleBrown: "#DEB887", // Primary accent
  sienna: "#F5DEB3", // Light accent
  darkBrown: "#CD853F", // Dark accent
  chocolate: "#DAA520", // Secondary accent
  burlywood: "#FFD700", // Bright accent
  darkGoldenrod: "#B8860B", // Muted accent

  // Dark theme text colors
  textPrimary: "#F5DEB3", // Primary text
  textSecondary: "#DEB887", // Secondary text
  textDisabled: "#8D7B6B", // Disabled text

  // Accent colors for special states
  accent: {
    warm: "#DEB887",
    cozy: "#DAA520",
    comfortable: "#CD853F",
  },

  // Status colors with dark theme adjustments
  status: {
    success: "#81C784",
    warning: "#FFB74D",
    error: "#E57373",
    info: "#64B5F6",
  },
};

export default cozyTheme;
