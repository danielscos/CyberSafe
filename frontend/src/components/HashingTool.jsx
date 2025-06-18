import { useState } from 'react';
import { MenuItem, Alert } from '@mui/material';
import {
  StyledTextField,
  StyledSelect,
  StyledFormControl,
  PrimaryButton,
  ClearButton,
  CopyButton,
  WhiteTypography,
  ResultPaper,
  CodeTypography,
  ToolContainer,
  ButtonGroup,
  ResultHeader,
  MinHeightContainer,
  ModernLinearProgress,
  SvgIcon,
  IconContainer,
} from './StyledComponents';
import { useHash, useCopyToClipboard } from '../hooks/useApi';
import { HASH_TYPES, MESSAGES } from '../constants';

const HashingTool = () => {
  const [hashInput, setHashInput] = useState('');
  const [hashType, setHashType] = useState('md5');

  const { hashResult, loading, error, generateHash, clearHash } = useHash();
  const { copySuccess, copyToClipboard } = useCopyToClipboard();

  const handleGenerateHash = async () => {
    try {
      await generateHash(hashInput, hashType);
    } catch (err) {
      // Error is handled by the hook
      console.error('Hash generation failed:', err);
    }
  };

  const handleClearAll = () => {
    setHashInput('');
    clearHash();
  };

  const handleCopyHash = () => {
    if (hashResult?.hash) {
      copyToClipboard(hashResult.hash);
    }
  };

  const CopyIcon = () => (
    <SvgIcon viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" />
    </SvgIcon>
  );

  const ClearIcon = () => (
    <SvgIcon viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </SvgIcon>
  );

  const CheckIcon = () => (
    <IconContainer>✓</IconContainer>
  );

  return (
    <ToolContainer>
      <WhiteTypography variant="h5" gutterBottom>
        {MESSAGES.hashingTool || 'Hashing Tool'}
      </WhiteTypography>

      <StyledTextField
        label="Text to Hash"
        value={hashInput}
        onChange={(e) => setHashInput(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={3}
        placeholder="Enter the text you want to hash..."
        slotProps={{
          input: {
            'aria-label': 'Text to hash input field',
          },
        }}
      />

      <StyledFormControl fullWidth margin="normal" sx={{ mb: 2 }}>
        <StyledSelect
          value={hashType}
          onChange={(e) => setHashType(e.target.value)}
          displayEmpty
          inputProps={{
            'aria-label': 'Hash type selection',
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                background: '#23232b',
                color: '#fff',
                '& .MuiMenuItem-root': {
                  color: '#fff',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 198, 251, 0.1)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 198, 251, 0.2)',
                  },
                },
              },
            },
          }}
        >
          {HASH_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </StyledSelect>
      </StyledFormControl>

      <ButtonGroup>
        <PrimaryButton
          variant="contained"
          color="primary"
          onClick={handleGenerateHash}
          disabled={loading || !hashInput.trim()}
          sx={{ flex: 1 }}
          aria-label="Generate hash from input text"
        >
          {loading ? 'Generating...' : MESSAGES.generateHash}
        </PrimaryButton>

        <ClearButton
          variant="text"
          onClick={handleClearAll}
          sx={{ ml: 2, px: 3, py: 1.5 }}
          aria-label="Clear input and results"
        >
          <ClearIcon />
          {MESSAGES.deselect}
        </ClearButton>
      </ButtonGroup>

      {loading && <ModernLinearProgress sx={{ mt: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <MinHeightContainer minHeight={120}>
        {hashResult && !error && (
          <ResultPaper>
            <ResultHeader>
              <WhiteTypography variant="body2" sx={{ fontSize: 14 }}>
                <strong>
                  Result ({hashResult.hash_type?.toUpperCase()}):
                </strong>
              </WhiteTypography>

              <CopyButton
                variant="outlined"
                size="small"
                onClick={handleCopyHash}
                copySuccess={copySuccess}
                startIcon={copySuccess ? <CheckIcon /> : <CopyIcon />}
                aria-label={copySuccess ? 'Hash copied to clipboard' : 'Copy hash to clipboard'}
              >
                {copySuccess ? MESSAGES.copySuccess : MESSAGES.copyDefault}
              </CopyButton>
            </ResultHeader>

            <CodeTypography variant="body1" component="pre">
              {hashResult.hash}
            </CodeTypography>
          </ResultPaper>
        )}
      </MinHeightContainer>
    </ToolContainer>
  );
};

export default HashingTool;
