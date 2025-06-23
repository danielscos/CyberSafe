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

// Cozy color palette
const cozyColors = {
  warmCream: "#FDF5E6",
  antiqueWhite: "#FAEBD7",
  wheat: "#F5DEB3",
  cornsilk: "#FFF8DC",
  saddleBrown: "#8B4513",
  sienna: "#A0522D",
  darkBrown: "#654321",
  chocolate: "#D2691E",
  burlywood: "#DEB887",
  textPrimary: "#3E2723",
  textSecondary: "#5D4037",
  textDisabled: "#8D6E63",
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
  boxShadow: "inset 0 2px 4px rgba(139, 69, 19, 0.1)",
  overflow: "hidden",
  border: `1px solid ${cozyColors.burlywood}`,
  "& .MuiLinearProgress-bar": {
    borderRadius: 12,
    background: `linear-gradient(90deg, ${cozyColors.saddleBrown} 0%, ${cozyColors.chocolate} 50%, ${cozyColors.sienna} 100%)`,
    boxShadow: "0 1px 3px rgba(139, 69, 19, 0.3)",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "50%",
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
      borderRadius: "12px 12px 0 0",
    },
  },
}));

// Primary Cozy Button
export const CozyPrimaryButton = styled(Button)({
  background: `linear-gradient(135deg, ${cozyColors.saddleBrown} 0%, ${cozyColors.chocolate} 100%)`,
  color: "#FFFFFF",
  fontWeight: 600,
  borderRadius: 12,
  padding: "12px 32px",
  textTransform: "none",
  fontSize: "1rem",
  boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
  border: "none",
  transition: `all ${animations.normal} cubic-bezier(0.4, 0, 0.2, 1)`,
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
    borderRadius: "12px 12px 0 0",
  },
  "&:hover": {
    background: `linear-gradient(135deg, ${cozyColors.darkBrown} 0%, ${cozyColors.saddleBrown} 100%)`,
    boxShadow: "0 6px 20px rgba(139, 69, 19, 0.4)",
    transform: "translateY(-2px)",
  },
  "&:active": {
    transform: "translateY(0px)",
    boxShadow: "0 2px 8px rgba(139, 69, 19, 0.3)",
  },
  "&:disabled": {
    background: cozyColors.textDisabled,
    color: "#FFFFFF",
    opacity: 0.6,
    boxShadow: "none",
    transform: "none",
  },
});

// Secondary Cozy Button
export const CozySecondaryButton = styled(Button)({
  background: "transparent",
  color: cozyColors.saddleBrown,
  fontWeight: 600,
  borderRadius: 12,
  padding: "12px 24px",
  textTransform: "none",
  fontSize: "1rem",
  border: `2px solid ${cozyColors.saddleBrown}`,
  transition: `all ${animations.normal} cubic-bezier(0.4, 0, 0.2, 1)`,
  display: "flex",
  alignItems: "center",
  gap: 8,
  "&:hover": {
    background: cozyColors.saddleBrown,
    color: "#FFFFFF",
    boxShadow: "0 4px 12px rgba(139, 69, 19, 0.2)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(0px)",
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
  border: `1px solid ${cozyColors.burlywood}`,
  transition: `all ${animations.fast}`,
  display: "flex",
  alignItems: "center",
  gap: 6,
  "&:hover": {
    background: cozyColors.burlywood,
    borderColor: cozyColors.saddleBrown,
    color: cozyColors.saddleBrown,
  },
});

// Copy Button with Success State
export const CozyCopyButton = styled(Button)(({ copySuccess }) => ({
  minWidth: 100,
  height: 36,
  fontWeight: 500,
  fontSize: "0.875rem",
  borderRadius: 8,
  color: copySuccess ? "#2E7D32" : cozyColors.saddleBrown,
  borderColor: copySuccess ? "#4CAF50" : cozyColors.saddleBrown,
  backgroundColor: copySuccess ? "#E8F5E8" : cozyColors.cornsilk,
  border: `1px solid`,
  transition: `all ${animations.normal} ease`,
  "&:hover": {
    backgroundColor: copySuccess ? "#C8E6C9" : cozyColors.wheat,
    borderColor: copySuccess ? "#2E7D32" : cozyColors.darkBrown,
    transform: "translateY(-1px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
}));

// Cozy Glass Paper Component
export const CozyGlassPaper = styled(Paper)({
  backgroundColor: cozyColors.antiqueWhite,
  backdropFilter: "blur(10px)",
  border: `1px solid ${cozyColors.burlywood}`,
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 32px rgba(139, 69, 19, 0.12)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    background: `linear-gradient(90deg, transparent 0%, ${cozyColors.burlywood} 50%, transparent 100%)`,
  },
});

// Result Display Paper
export const CozyResultPaper = styled(Paper)({
  backgroundColor: cozyColors.cornsilk,
  border: `1px solid ${cozyColors.wheat}`,
  borderRadius: 12,
  padding: 20,
  marginTop: 16,
  boxShadow: "0 4px 16px rgba(139, 69, 19, 0.08)",
  transition: `all ${animations.normal}`,
  "&:hover": {
    boxShadow: "0 6px 24px rgba(139, 69, 19, 0.12)",
  },
});

// Cozy TextField
export const CozyTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: cozyColors.cornsilk,
    borderRadius: 12,
    transition: `all ${animations.fast}`,
    "& fieldset": {
      borderColor: cozyColors.burlywood,
      borderWidth: 1,
    },
    "&:hover fieldset": {
      borderColor: cozyColors.saddleBrown,
    },
    "&.Mui-focused fieldset": {
      borderColor: cozyColors.saddleBrown,
      borderWidth: 2,
      boxShadow: `0 0 0 3px rgba(139, 69, 19, 0.1)`,
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
    borderColor: cozyColors.burlywood,
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
  color: cozyColors.textPrimary,
  fontWeight: 500,
  lineHeight: 1.6,
});

// Secondary Text Typography
export const CozySecondaryTypography = styled(Typography)({
  color: cozyColors.textSecondary,
  fontStyle: "normal",
  marginBottom: 8,
  lineHeight: 1.5,
});

// Code Block Typography
export const CozyCodeTypography = styled(Typography)({
  fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
  backgroundColor: cozyColors.wheat,
  color: cozyColors.textPrimary,
  padding: "12px 16px",
  borderRadius: 8,
  border: `1px solid ${cozyColors.burlywood}`,
  fontSize: "0.875rem",
  lineHeight: 1.5,
  wordBreak: "break-all",
  boxShadow: "inset 0 1px 3px rgba(139, 69, 19, 0.1)",
});

// Tool Container with cozy styling
export const CozyToolContainer = styled(Box)(
  ({ maxWidth = 600, minHeight = 420 }) => ({
    maxWidth,
    margin: "0 auto",
    paddingTop: 32,
    minHeight,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    position: "relative",
  }),
);

// Cozy Card Component
export const CozyCard = styled(Card)({
  backgroundColor: cozyColors.antiqueWhite,
  border: `1px solid ${cozyColors.burlywood}`,
  borderRadius: 20,
  boxShadow: "0 8px 24px rgba(139, 69, 19, 0.12)",
  transition: `all ${animations.normal} cubic-bezier(0.4, 0, 0.2, 1)`,
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: `linear-gradient(90deg, ${cozyColors.saddleBrown} 0%, ${cozyColors.chocolate} 50%, ${cozyColors.saddleBrown} 100%)`,
  },
  "&:hover": {
    boxShadow: "0 12px 32px rgba(139, 69, 19, 0.16)",
    transform: "translateY(-4px)",
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
  border: `1px solid ${cozyColors.burlywood}`,
});

// Result Header Container
export const CozyResultHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: `2px solid ${cozyColors.wheat}`,
});

// Upload Button
export const CozyUploadButton = styled(Button)({
  background: `linear-gradient(135deg, ${cozyColors.burlywood} 0%, ${cozyColors.wheat} 100%)`,
  color: cozyColors.textPrimary,
  fontWeight: 600,
  borderRadius: 12,
  padding: "16px 32px",
  width: "100%",
  marginTop: 16,
  textTransform: "none",
  fontSize: "1rem",
  border: `2px dashed ${cozyColors.saddleBrown}`,
  transition: `all ${animations.normal}`,
  "&:hover": {
    background: `linear-gradient(135deg, ${cozyColors.wheat} 0%, ${cozyColors.cornsilk} 100%)`,
    borderColor: cozyColors.chocolate,
    borderStyle: "solid",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 16px rgba(139, 69, 19, 0.2)",
  },
});

// Sidebar Brand Title
export const CozyBrandTitle = styled(Typography)({
  color: cozyColors.saddleBrown,
  fontWeight: 700,
  fontSize: "1.75rem",
  marginBottom: 32,
  textAlign: "center",
  textShadow: "0 1px 2px rgba(139, 69, 19, 0.1)",
});

// Sidebar Section Title
export const CozySidebarSectionTitle = styled(Typography)({
  color: cozyColors.textSecondary,
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: 1.5,
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
  gap: 12,
  padding: "14px 20px",
  borderRadius: 12,
  cursor: "pointer",
  transition: `all ${animations.normal} cubic-bezier(0.4, 0, 0.2, 1)`,
  color: active ? "#FFFFFF" : cozyColors.saddleBrown,
  backgroundColor: active
    ? `linear-gradient(135deg, ${cozyColors.saddleBrown} 0%, ${cozyColors.chocolate} 100%)`
    : "rgba(139, 69, 19, 0.05)",
  fontWeight: active ? 600 : 500,
  fontSize: "0.95rem",
  margin: "2px 8px",
  position: "relative",
  overflow: "hidden",
  border: active ? "none" : `1px solid rgba(139, 69, 19, 0.1)`,
  "&::before": active
    ? {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "50%",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
        borderRadius: "12px 12px 0 0",
      }
    : {},
  "&:hover": {
    backgroundColor: active
      ? `linear-gradient(135deg, ${cozyColors.darkBrown} 0%, ${cozyColors.saddleBrown} 100%)`
      : `rgba(139, 69, 19, 0.12)`,
    color: active ? "#FFFFFF" : cozyColors.darkBrown,
    transform: "translateX(4px)",
    boxShadow: active
      ? "0 4px 12px rgba(139, 69, 19, 0.3)"
      : "0 2px 8px rgba(139, 69, 19, 0.15)",
    borderColor: active ? "transparent" : "rgba(139, 69, 19, 0.2)",
  },
}));

// Decorative accent for headers
export const CozyAccent = styled(Box)({
  width: 60,
  height: 3,
  background: `linear-gradient(90deg, ${cozyColors.saddleBrown} 0%, ${cozyColors.chocolate} 100%)`,
  borderRadius: 2,
  margin: "8px 0 16px 0",
});
