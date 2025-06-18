import { styled } from '@mui/material/styles';
import {
  LinearProgress,
  Button,
  Paper,
  Typography,
  TextField,
  Select,
  FormControl,
} from '@mui/material';
import { COLORS, COMMON_STYLES, ANIMATIONS } from '../constants';

// Progress Indicator
export const ModernLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'light' ? COLORS.border.light : COLORS.background.primary,
  boxShadow: '0 6px 24px 0 rgba(0,0,0,0.18), 0 1.5px 6px 0 rgba(0,0,0,0.10)',
  overflow: 'hidden',
  '& .MuiLinearProgress-bar': {
    borderRadius: 8,
    background: `linear-gradient(90deg, ${COLORS.primary.main} 0%, ${COLORS.primary.dark} 100%)`,
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.22), 0 1.5px 6px 0 rgba(0,0,0,0.10)',
  },
}));

// Primary Action Button
export const PrimaryButton = styled(Button)({
  ...COMMON_STYLES.buttonPrimary,
  '&:disabled': {
    opacity: 0.6,
  },
});

// Secondary Action Button
export const SecondaryButton = styled(Button)({
  ...COMMON_STYLES.buttonSecondary,
  padding: '12px 24px',
  letterSpacing: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

// Clear/Reset Button
export const ClearButton = styled(Button)({
  fontWeight: 700,
  letterSpacing: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  color: COLORS.primary.main,
  borderRadius: 2,
  background: COLORS.background.hover,
  transition: `all ${ANIMATIONS.fast}`,
  '&:hover': {
    background: COLORS.background.hoverSecondary,
    color: COLORS.text.primary,
  },
});

// Copy Button with Success State
export const CopyButton = styled(Button)(({ copySuccess }) => ({
  minWidth: 100,
  height: 32,
  fontWeight: 'bold',
  fontSize: 12,
  color: copySuccess ? COLORS.secondary.main : COLORS.primary.main,
  borderColor: copySuccess ? COLORS.secondary.main : COLORS.primary.main,
  backgroundColor: copySuccess
    ? 'rgba(76, 175, 80, 0.1)'
    : COLORS.background.hover,
  transition: `all ${ANIMATIONS.normal} ease`,
  '&:hover': {
    backgroundColor: copySuccess
      ? 'rgba(76, 175, 80, 0.2)'
      : 'rgba(0, 198, 251, 0.2)',
    borderColor: copySuccess ? COLORS.secondary.light : COLORS.primary.dark,
  },
}));

// Glass Morphism Paper Component
export const GlassPaper = styled(Paper)({
  ...COMMON_STYLES.glassMorphism,
  padding: 16,
});

// Result Display Paper
export const ResultPaper = styled(Paper)({
  ...COMMON_STYLES.paper,
  padding: 16,
  marginTop: 16,
});

// Styled TextField with consistent theming
export const StyledTextField = styled(TextField)({
  ...COMMON_STYLES.textField,
  '& .MuiInputBase-input': {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
});

// Styled Select with consistent theming
export const StyledSelect = styled(Select)({
  ...COMMON_STYLES.select,
});

// Styled FormControl
export const StyledFormControl = styled(FormControl)({
  '& .MuiInputLabel-root': {
    color: COLORS.text.primary,
    fontWeight: 'bold',
  },
  '& .MuiSelect-icon': {
    color: COLORS.text.primary,
  },
});

// White Bold Typography
export const WhiteTypography = styled(Typography)({
  color: COLORS.text.primary,
  fontWeight: 'bold',
});

// Secondary Text Typography
export const SecondaryTypography = styled(Typography)({
  color: COLORS.text.secondary,
  fontStyle: 'italic',
  marginBottom: 8,
});

// Code Block Typography
export const CodeTypography = styled(Typography)({
  ...COMMON_STYLES.codeBlock,
});

// Tool Content Container
export const ToolContainer = styled('div')(({ maxWidth = 600, minHeight = 420 }) => ({
  maxWidth,
  margin: '0 auto',
  paddingTop: 24,
  minHeight,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
}));

// Flex Row Container
export const FlexRow = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
});

// Flex Column Container
export const FlexColumn = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

// Button Group Container
export const ButtonGroup = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 16,
  gap: 16,
});

// File Info Container
export const FileInfoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: 8,
});

// Result Header Container
export const ResultHeader = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 12,
});

// Minimum Height Container for consistent layout
export const MinHeightContainer = styled('div')(({ minHeight }) => ({
  minHeight: minHeight || 120,
}));

// Icon Container for consistent icon styling
export const IconContainer = styled('span')({
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// SVG Icon Wrapper
export const SvgIcon = styled('svg')({
  width: 18,
  height: 18,
  fill: 'currentColor',
});

// Upload Button styled as file input
export const UploadButton = styled(Button)({
  ...COMMON_STYLES.buttonPrimary,
  width: '100%',
  marginTop: 16,
});

// Sidebar Brand Title
export const BrandTitle = styled(Typography)({
  color: COLORS.text.primary,
  fontWeight: 'bold',
  fontSize: '1.5rem',
  marginBottom: 24,
  textAlign: 'center',
});

// Sidebar Section Title
export const SidebarSectionTitle = styled(Typography)({
  color: COLORS.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 'bold',
  letterSpacing: 1,
  marginBottom: 12,
  textTransform: 'uppercase',
});

// Sidebar Button
export const SidebarButton = styled('li')(({ active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px',
  borderRadius: 8,
  cursor: 'pointer',
  transition: `all ${ANIMATIONS.fast}`,
  color: active ? COLORS.text.primary : COLORS.text.secondary,
  backgroundColor: active ? COLORS.background.hover : 'transparent',
  fontWeight: active ? 'bold' : 'normal',
  '&:hover': {
    backgroundColor: COLORS.background.hover,
    color: COLORS.text.primary,
  },
}));
