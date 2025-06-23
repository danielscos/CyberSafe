import { useState } from "react";
import { MenuItem, Alert } from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  CozyTextField,
  CozySelect,
  CozyFormControl,
  CozyPrimaryButton,
  CozyClearButton,
  CozyCopyButton,
  CozyTypography,
  CozyResultPaper,
  CozyCodeTypography,
  CozyToolContainer,
  CozyButtonGroup,
  CozyResultHeader,
  CozyLinearProgress,
  CozyAccent,
  CozyFlexColumn,
  CozyFlexRow,
} from "./StyledComponents";
import { useHash, useCopyToClipboard } from "../hooks/useApi";
import { HASH_TYPES, MESSAGES } from "../constants";

// animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const resultVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const HashingTool = () => {
  const [hashInput, setHashInput] = useState("");
  const [hashType, setHashType] = useState("md5");

  const { hashResult, loading, error, generateHash, clearHash } = useHash();
  const { copySuccess, copyToClipboard } = useCopyToClipboard();

  const handleGenerateHash = async () => {
    try {
      await generateHash(hashInput, hashType);
    } catch (err) {
      console.error("Hash generation failed:", err);
    }
  };

  const handleClearAll = () => {
    setHashInput("");
    clearHash();
  };

  const handleCopyHash = () => {
    if (hashResult?.hash) {
      copyToClipboard(hashResult.hash);
    }
  };

  return (
    <CozyToolContainer maxWidth={700} minHeight={500}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <CozyTypography variant="h4" component="h1" gutterBottom>
            🔐 Hash Generator
          </CozyTypography>
          <CozyAccent />
          <CozyTypography variant="body1" sx={{ mb: 3, opacity: 0.8 }}>
            Generate secure cryptographic hashes for your text or data
          </CozyTypography>
        </motion.div>

        {/* Input Section */}
        <motion.div variants={itemVariants}>
          <CozyFlexColumn sx={{ gap: 3, mb: 3 }}>
            <CozyTextField
              label="Enter text to hash"
              multiline
              rows={4}
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Type or paste your text here..."
              fullWidth
              variant="outlined"
            />

            <CozyFlexRow sx={{ gap: 2, alignItems: "center" }}>
              <CozyFormControl sx={{ minWidth: 200 }}>
                <CozySelect
                  value={hashType}
                  onChange={(e) => setHashType(e.target.value)}
                  displayEmpty
                >
                  {HASH_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </CozySelect>
              </CozyFormControl>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CozyPrimaryButton
                  onClick={handleGenerateHash}
                  disabled={!hashInput.trim() || loading}
                  sx={{ minWidth: 140 }}
                >
                  {loading ? "🔄 Hashing..." : "🔐 Generate Hash"}
                </CozyPrimaryButton>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CozyClearButton
                  onClick={handleClearAll}
                  disabled={!hashInput && !hashResult}
                >
                  🧹 Clear
                </CozyClearButton>
              </motion.div>
            </CozyFlexRow>
          </CozyFlexColumn>
        </motion.div>

        {/* Loading Progress */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CozyLinearProgress sx={{ mb: 2 }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Section */}
        <AnimatePresence mode="wait">
          {hashResult && (
            <motion.div
              key="result"
              variants={resultVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CozyResultPaper>
                <CozyResultHeader>
                  <CozyFlexColumn sx={{ flex: 1 }}>
                    <CozyTypography variant="h6" gutterBottom>
                      ✅ Hash Generated Successfully
                    </CozyTypography>
                    <CozyTypography variant="body2" sx={{ opacity: 0.7 }}>
                      Algorithm:{" "}
                      {hashResult.algorithm?.toUpperCase() ||
                        hashType.toUpperCase()}
                    </CozyTypography>
                  </CozyFlexColumn>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CozyCopyButton
                      copySuccess={copySuccess}
                      onClick={handleCopyHash}
                      variant="outlined"
                      size="small"
                    >
                      {copySuccess ? "✅ Copied!" : "📋 Copy"}
                    </CozyCopyButton>
                  </motion.div>
                </CozyResultHeader>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <CozyCodeTypography variant="body2" component="div">
                    {hashResult.hash}
                  </CozyCodeTypography>
                </motion.div>

                {/* Hash Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <CozyFlexRow sx={{ mt: 2, gap: 2, flexWrap: "wrap" }}>
                    <CozyTypography
                      variant="caption"
                      sx={{
                        background: "#21262D",
                        padding: "4px 8px",
                        borderRadius: 1,
                        border: "1px solid #00BCD4",
                        color: "#F0F6FC",
                      }}
                    >
                      Length: {hashResult.hash?.length || 0} characters
                    </CozyTypography>
                    <CozyTypography
                      variant="caption"
                      sx={{
                        background: "#21262D",
                        padding: "4px 8px",
                        borderRadius: 1,
                        border: "1px solid #00BCD4",
                        color: "#F0F6FC",
                      }}
                    >
                      Input size: {hashInput.length} characters
                    </CozyTypography>
                  </CozyFlexRow>
                </motion.div>
              </CozyResultPaper>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </CozyToolContainer>
  );
};

export default HashingTool;
