import { createTheme } from "@mui/material/styles";

export const cozyTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8B4513", // Saddle brown
      light: "#A0522D", // Sienna
      dark: "#654321", // Dark brown
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#D2691E", // Chocolate
      light: "#DEB887", // Burlywood
      dark: "#B8860B", // Dark goldenrod
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FDF5E6", // Old lace - warm cream background
      paper: "#FAEBD7", // Antique white
    },
    surface: {
      main: "#F5DEB3", // Wheat
      light: "#FFF8DC", // Cornsilk
      dark: "#DDD0B8", // Darker wheat
    },
    text: {
      primary: "#3E2723", // Dark brown
      secondary: "#5D4037", // Medium brown
      disabled: "#8D6E63", // Light brown
    },
    divider: "#BCAAA4", // Light brown divider
    action: {
      hover: "rgba(139, 69, 19, 0.08)", // Brown hover
      selected: "rgba(139, 69, 19, 0.12)", // Brown selected
      disabled: "rgba(139, 69, 19, 0.26)", // Brown disabled
      disabledBackground: "rgba(139, 69, 19, 0.12)",
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
      color: "#3E2723",
      letterSpacing: "-0.01562em",
    },
    h2: {
      fontWeight: 600,
      color: "#3E2723",
      letterSpacing: "-0.00833em",
    },
    h3: {
      fontWeight: 600,
      color: "#3E2723",
      letterSpacing: "0em",
    },
    h4: {
      fontWeight: 600,
      color: "#3E2723",
      letterSpacing: "0.00735em",
    },
    h5: {
      fontWeight: 600,
      color: "#3E2723",
      letterSpacing: "0em",
    },
    h6: {
      fontWeight: 600,
      color: "#3E2723",
      letterSpacing: "0.0075em",
    },
    body1: {
      color: "#3E2723",
      lineHeight: 1.6,
    },
    body2: {
      color: "#5D4037",
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
          backgroundColor: "#FDF5E6",
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(139, 69, 19, 0.03) 1px, transparent 0)
          `,
          backgroundSize: "20px 20px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FAEBD7",
          backgroundImage: "none",
          border: "1px solid rgba(139, 69, 19, 0.12)",
          boxShadow: "0 4px 12px rgba(139, 69, 19, 0.1)",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(139, 69, 19, 0.08)",
        },
        elevation2: {
          boxShadow: "0 4px 12px rgba(139, 69, 19, 0.1)",
        },
        elevation3: {
          boxShadow: "0 6px 16px rgba(139, 69, 19, 0.12)",
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
            boxShadow: "0 2px 8px rgba(139, 69, 19, 0.2)",
            transform: "translateY(-1px)",
            transition: "all 0.2s ease",
          },
        },
        contained: {
          background: "linear-gradient(45deg, #8B4513 30%, #A0522D 90%)",
          "&:hover": {
            background: "linear-gradient(45deg, #654321 30%, #8B4513 90%)",
          },
        },
        outlined: {
          borderColor: "#8B4513",
          color: "#8B4513",
          "&:hover": {
            borderColor: "#654321",
            backgroundColor: "rgba(139, 69, 19, 0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FAEBD7",
          border: "1px solid rgba(139, 69, 19, 0.12)",
          borderRadius: 16,
          boxShadow: "0 4px 12px rgba(139, 69, 19, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(139, 69, 19, 0.15)",
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
          backgroundColor: "#E3F2FD",
          borderColor: "#BBDEFB",
          color: "#0D47A1",
        },
        standardSuccess: {
          backgroundColor: "#E8F5E8",
          borderColor: "#C8E6C9",
          color: "#2E7D32",
        },
        standardWarning: {
          backgroundColor: "#FFF3E0",
          borderColor: "#FFCC02",
          color: "#E65100",
        },
        standardError: {
          backgroundColor: "#FFEBEE",
          borderColor: "#FFCDD2",
          color: "#C62828",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#FFF8DC",
            borderRadius: 8,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#A0522D",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#8B4513",
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          backgroundColor: "#F5DEB3",
          borderRadius: 12,
          minHeight: 48,
        },
        indicator: {
          backgroundColor: "#8B4513",
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
          color: "#5D4037",
          "&.Mui-selected": {
            color: "#8B4513",
          },
          "&:hover": {
            color: "#8B4513",
            backgroundColor: "rgba(139, 69, 19, 0.04)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#F5DEB3",
          color: "#3E2723",
          fontWeight: 500,
          "&:hover": {
            backgroundColor: "#DDD0B8",
          },
        },
        filled: {
          backgroundColor: "#8B4513",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#654321",
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: "#DDD0B8",
          borderRadius: 4,
        },
        bar: {
          backgroundColor: "#8B4513",
          borderRadius: 4,
        },
      },
    },
  },
});

// Additional utility colors for custom components
export const cozyColors = {
  warmCream: "#FDF5E6",
  antiqueWhite: "#FAEBD7",
  wheat: "#F5DEB3",
  cornsilk: "#FFF8DC",
  saddleBrown: "#8B4513",
  sienna: "#A0522D",
  darkBrown: "#654321",
  chocolate: "#D2691E",
  burlywood: "#DEB887",
  darkGoldenrod: "#B8860B",
  textPrimary: "#3E2723",
  textSecondary: "#5D4037",
  textDisabled: "#8D6E63",

  // Accent colors for special states
  accent: {
    warm: "#DEB887",
    cozy: "#F4A460",
    comfortable: "#CD853F",
  },

  // Status colors with warm undertones
  status: {
    success: "#228B22",
    warning: "#DAA520",
    error: "#B22222",
    info: "#4682B4",
  },
};

export default cozyTheme;
