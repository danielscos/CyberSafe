import { styled } from "@mui/material/styles";
import {
  LinearProgress,
  Button,
  Paper,
  Typography,
  TextField,
  Select,
  FormControl,
  Card,
  Box,
} from "@mui/material";

// Dark Cyan color palette
const cozyColors = {
  warmCream: "#0D1117",
  antiqueWhite: "#161B22",
  wheat: "#21262D",
  cornsilk: "#30363D",
  saddleBrown: "#00BCD4",
  sienna: "#4DD0E1",
  darkBrown: "#00838F",
  chocolate: "#26C6DA",
  burlywood: "#80DEEA",
  textPrimary: "#F0F6FC",
  textSecondary: "#8B949E",
  textDisabled: "#484F58",
};

// Animation constants
const animations = {
  fast: "0.15s",
  normal: "0.3s",
  slow: "0.5s",
};

// Cozy Progress Indicator with warm colors
export const CozyLinearProgress = styled(LinearProgress)(() => ({
  height: 12,
  borderRadius: 12,
  backgroundColor: cozyColors.wheat,
  boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
  overflow: "hidden",
  border: `1px solid ${cozyColors.saddleBrown}`,
  "& .MuiLinearProgress-bar": {
    borderRadius: 12,
    background: `linear-gradient(90deg, ${cozyColors.saddleBrown} 0%, ${cozyColors.chocolate} 50%, ${cozyColors.sienna} 100%)`,
    boxShadow: "0 1px 3px rgba(0, 188, 212, 0.3)",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "50%",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
      borderRadius: "12px 12px 0 0",
    },
  },
}));

// Modern Primary Button
export const CozyPrimaryButton = styled(Button)({
  fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
  background: cozyColors.saddleBrown,
  color: "#FFFFFF",
  fontWeight: 600,
  borderRadius: 8,
  padding: "12px 24px",
  textTransform: "none",
  fontSize: "0.95rem",
  boxShadow: "none",
  border: "none",
  transition: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
  position: "relative",
  overflow: "hidden",
  letterSpacing: "0.02em",
  "&::before": {
    display: "none",
  },
  "&:hover": {
    background: cozyColors.sienna,
    boxShadow: "0 2px 8px rgba(0, 188, 212, 0.2)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0px)",
    boxShadow: "none",
  },
  "&:disabled": {
    background: cozyColors.textDisabled,
    color: "#FFFFFF",
    opacity: 0.6,
    boxShadow: "none",
    transform: "none",
  },
});

// Modern Secondary Button
export const CozySecondaryButton = styled(Button)({
  fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
  background: "transparent",
  color: cozyColors.saddleBrown,
  fontWeight: 500,
  borderRadius: 8,
  padding: "10px 20px",
  textTransform: "none",
  fontSize: "0.9rem",
  border: `1px solid rgba(0, 188, 212, 0.3)`,
  transition: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
  display: "flex",
  alignItems: "center",
  gap: 6,
  letterSpacing: "0.02em",
  "&:hover": {
    background: "rgba(0, 188, 212, 0.08)",
    color: cozyColors.sienna,
    borderColor: "rgba(0, 188, 212, 0.5)",
    transform: "none",
  },
  "&:active": {
    transform: "none",
  },
});

// Gentle Clear Button
export const CozyClearButton = styled(Button)({
  background: cozyColors.wheat,
  color: cozyColors.textPrimary,
  fontWeight: 500,
  borderRadius: 8,
  padding: "8px 16px",
  textTransform: "none",
  fontSize: "0.875rem",
  border: `1px solid ${cozyColors.saddleBrown}`,
  transition: `all ${animations.fast}`,
  display: "flex",
  alignItems: "center",
  gap: 6,
  "&:hover": {
    background: cozyColors.cornsilk,
    borderColor: cozyColors.sienna,
    color: cozyColors.sienna,
  },
});

// Copy Button with Success State
export const CozyCopyButton = styled(Button)(({ copySuccess }) => ({
  minWidth: 100,
  height: 36,
  fontWeight: 500,
  fontSize: "0.875rem",
  borderRadius: 8,
  color: copySuccess ? "#81C784" : cozyColors.saddleBrown,
  borderColor: copySuccess ? "#4CAF50" : cozyColors.saddleBrown,
  backgroundColor: copySuccess ? "#0A1F0A" : cozyColors.cornsilk,
  border: `1px solid`,
  transition: `all ${animations.normal} ease`,
  "&:hover": {
    backgroundColor: copySuccess ? "#1B2A1B" : cozyColors.wheat,
    borderColor: copySuccess ? "#4CAF50" : cozyColors.sienna,
    transform: "translateY(-1px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
}));

// Cozy Glass Paper Component
export const CozyGlassPaper = styled(Paper)({
  backgroundColor: cozyColors.antiqueWhite,
  backdropFilter: "blur(10px)",
  border: `1px solid ${cozyColors.saddleBrown}`,
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: `linear-gradient(90deg, transparent 0%, ${cozyColors.saddleBrown} 50%, transparent 100%)`,
  },
});

// Modern Result Paper
export const CozyResultPaper = styled(Paper)({
  backgroundColor: cozyColors.cornsilk,
  border: `1px solid rgba(48, 54, 61, 0.3)`,
  borderRadius: 10,
  padding: 20,
  marginTop: 16,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  transition: `all 0.2s ease`,
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    borderColor: "rgba(0, 188, 212, 0.2)",
  },
});

// Cozy TextField
export const CozyTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: cozyColors.cornsilk,
    borderRadius: 12,
    transition: `all ${animations.fast}`,
    "& fieldset": {
      borderColor: cozyColors.saddleBrown,
      borderWidth: 1,
    },
    "&:hover fieldset": {
      borderColor: cozyColors.saddleBrown,
    },
    "&.Mui-focused fieldset": {
      borderColor: cozyColors.saddleBrown,
      borderWidth: 2,
      boxShadow: `0 0 0 3px rgba(222, 184, 135, 0.1)`,
    },
  },
  "& .MuiInputBase-input": {
    color: cozyColors.textPrimary,
    fontWeight: 500,
    "&::placeholder": {
      color: cozyColors.textSecondary,
      opacity: 0.7,
    },
  },
  "& .MuiFormLabel-root": {
    color: cozyColors.textSecondary,
    fontWeight: 500,
    "&.Mui-focused": {
      color: cozyColors.saddleBrown,
    },
  },
});

// Cozy Select
export const CozySelect = styled(Select)({
  backgroundColor: cozyColors.cornsilk,
  borderRadius: 12,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: cozyColors.saddleBrown,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: cozyColors.saddleBrown,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: cozyColors.saddleBrown,
    borderWidth: 2,
  },
  "& .MuiSelect-select": {
    color: cozyColors.textPrimary,
    fontWeight: 500,
  },
});

// Cozy FormControl
export const CozyFormControl = styled(FormControl)({
  "& .MuiInputLabel-root": {
    color: cozyColors.textSecondary,
    fontWeight: 500,
    "&.Mui-focused": {
      color: cozyColors.saddleBrown,
    },
  },
  "& .MuiSelect-icon": {
    color: cozyColors.textSecondary,
  },
});

// Warm Typography
export const CozyTypography = styled(Typography)({
  fontFamily: '"Inter", "SF Pro Display", "Segoe UI", sans-serif',
  color: cozyColors.textPrimary,
  fontWeight: 500,
  lineHeight: 1.6,
});

// Secondary Text Typography
export const CozySecondaryTypography = styled(Typography)({
  fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
  color: cozyColors.textSecondary,
  fontStyle: "normal",
  marginBottom: 8,
  lineHeight: 1.5,
});

// Code Block Typography
export const CozyCodeTypography = styled(Typography)({
  fontFamily:
    '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
  backgroundColor: cozyColors.wheat,
  color: cozyColors.textPrimary,
  padding: "12px 16px",
  borderRadius: 8,
  border: `1px solid ${cozyColors.saddleBrown}`,
  fontSize: "0.875rem",
  fontWeight: 500,
  lineHeight: 1.5,
  wordBreak: "break-all",
  boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.2)",
  letterSpacing: "0.01em",
});

// Tool Container with cozy styling
export const CozyToolContainer = styled(Box)(
  ({ maxWidth = 600, minHeight = 420 }) => ({
    maxWidth,
    margin: "0 auto",
    minHeight,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
  }),
);

// Modern Card Component
export const CozyCard = styled(Card)({
  backgroundColor: cozyColors.antiqueWhite,
  border: `1px solid rgba(48, 54, 61, 0.3)`,
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  transition: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
  overflow: "hidden",
  position: "relative",
  "&::before": {
    display: "none",
  },
  "&:hover": {
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-2px)",
    borderColor: "rgba(0, 188, 212, 0.2)",
  },
});

// Flex Row Container
export const CozyFlexRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
});

// Flex Column Container
export const CozyFlexColumn = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

// Button Group Container
export const CozyButtonGroup = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 20,
  gap: 16,
  flexWrap: "wrap",
});

// File Info Container
export const CozyFileInfoContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  marginTop: 12,
  padding: "12px 16px",
  backgroundColor: cozyColors.wheat,
  borderRadius: 8,
  border: `1px solid ${cozyColors.saddleBrown}`,
});

// Result Header Container
export const CozyResultHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: `2px solid ${cozyColors.saddleBrown}`,
});

// Modern Upload Button
export const CozyUploadButton = styled(Button)({
  fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
  background: cozyColors.wheat,
  color: cozyColors.textPrimary,
  fontWeight: 600,
  borderRadius: 10,
  padding: "16px 24px",
  width: "100%",
  marginTop: 16,
  textTransform: "none",
  fontSize: "0.95rem",
  border: `2px dashed rgba(0, 188, 212, 0.4)`,
  transition: `all 0.2s ease`,
  letterSpacing: "0.02em",
  "&:hover": {
    background: cozyColors.cornsilk,
    borderColor: cozyColors.saddleBrown,
    borderStyle: "solid",
    transform: "translateY(-1px)",
    boxShadow: "0 2px 8px rgba(0, 188, 212, 0.1)",
  },
});

// Sidebar Brand Title
export const CozyBrandTitle = styled(Typography)({
  fontFamily:
    '"JetBrains Mono", "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
  color: cozyColors.saddleBrown,
  fontWeight: 700,
  fontSize: "1.75rem",
  marginBottom: 32,
  textAlign: "center",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  letterSpacing: "-0.02em",
});

// Sidebar Section Title
export const CozySidebarSectionTitle = styled(Typography)({
  fontFamily: '"Inter", "SF Pro Text", "Segoe UI", sans-serif',
  color: cozyColors.chocolate,
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  marginBottom: 16,
  marginTop: 24,
  textTransform: "uppercase",
  paddingLeft: 16,
});

// Sidebar Button
export const CozySidebarButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})(({ active }) => ({
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "12px 16px",
  borderRadius: 10,
  cursor: "pointer",
  transition: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
  color: active ? cozyColors.saddleBrown : cozyColors.textSecondary,
  backgroundColor: active ? "rgba(0, 188, 212, 0.15)" : "transparent",
  fontWeight: active ? 600 : 500,
  fontSize: "0.95rem",
  margin: "4px 0",
  position: "relative",
  overflow: "hidden",
  borderLeft: active
    ? `3px solid ${cozyColors.saddleBrown}`
    : "3px solid transparent",
  paddingLeft: active ? "13px" : "16px",
  letterSpacing: "0.025em",
  "&::before": {
    display: "none",
  },
  "&:hover": {
    backgroundColor: active
      ? "rgba(0, 188, 212, 0.2)"
      : "rgba(0, 188, 212, 0.08)",
    color: active ? cozyColors.sienna : cozyColors.saddleBrown,
    transform: "none",
  },
}));

// Decorative accent for headers
export const CozyAccent = styled(Box)({
  width: 40,
  height: 2,
  background: cozyColors.saddleBrown,
  borderRadius: 1,
  margin: "8px 0 20px 0",
  opacity: 0.6,
});
