import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CozyToolContainer,
  CozyCard,
  CozyTypography,
  CozySecondaryTypography,
  CozyFlexRow,
  CozyFlexColumn,
  CozyPrimaryButton,
  CozyAccent,
} from "./StyledComponents";
import { CardContent, Box, Chip } from "@mui/material";
import { API_BASE_URL } from "../constants/index";

// animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      duration: 0.3,
    },
  },
  hover: {
    y: -6,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

const statVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

const Dashboard = () => {
  const [scanHistory, setScanHistory] = useState([]);
  const [clamavStats, setClamavStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    filesProcessed: 0,
  });
  const [clamavStatus, setClamavStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Helper to show "time ago"
  function timeAgo(timestamp) {
    const now = new Date();
    const scanDate = new Date(timestamp);
    const diffMs = now - scanDate;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Fetch ClamAV scan history and stats
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/clamav/scan-history`);
        const data = await res.json();
        const history = data.scan_history || [];
        setScanHistory(history);
        setClamavStats({
          totalScans: history.length,
          threatsDetected: history.filter((scan) => scan.infected).length,
          filesProcessed: history.reduce(
            (sum, scan) => sum + (scan.file_size || 0),
            0,
          ),
        });
      } catch (err) {
        console.error("Failed to fetch scan history", err);
      }
    };

    // Fetch ClamAV status
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/clamav/status`);
        const data = await res.json();
        setClamavStatus(data.clamav_status);
      } catch (err) {
        console.error("Failed to fetch ClamAV status", err);
      }
    };

    fetchHistory();
    fetchStatus();

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const securityTips = [
    "Keep your antivirus software updated",
    "Use strong, unique passwords for each account",
    "Enable two-factor authentication when available",
    "Regularly backup your important data",
    "Be cautious with email attachments and links",
  ];

  return (
    <CozyToolContainer maxWidth={1200} minHeight={600}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* header */}
        <motion.div variants={cardVariants}>
          <Box mb={4}>
            <CozyTypography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              🏡 Welcome to CyberSafe
            </CozyTypography>
            <CozyAccent />
            <CozySecondaryTypography
              variant="body1"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.95rem",
              }}
            >
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </CozySecondaryTypography>
          </Box>
        </motion.div>

        {/* stats card */}
        <motion.div variants={cardVariants}>
          <CozyFlexRow mb={4} sx={{ gap: 3, flexWrap: "wrap" }}>
            <motion.div variants={cardVariants} whileHover="hover">
              <CozyCard sx={{ minWidth: 220, flex: 1 }}>
                <CardContent>
                  <CozyFlexColumn>
                    <CozySecondaryTypography variant="overline" gutterBottom>
                      Total Scans
                    </CozySecondaryTypography>
                    <motion.div variants={statVariants}>
                      <CozyTypography variant="h4" component="div">
                        {clamavStats.totalScans.toLocaleString()}
                      </CozyTypography>
                    </motion.div>
                  </CozyFlexColumn>
                </CardContent>
              </CozyCard>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <CozyCard sx={{ minWidth: 220, flex: 1 }}>
                <CardContent>
                  <CozyFlexColumn>
                    <CozySecondaryTypography variant="overline" gutterBottom>
                      Threats Detected
                    </CozySecondaryTypography>
                    <motion.div variants={statVariants}>
                      <CozyTypography variant="h4" component="div">
                        {clamavStats.threatsDetected}
                      </CozyTypography>
                    </motion.div>
                  </CozyFlexColumn>
                </CardContent>
              </CozyCard>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <CozyCard sx={{ minWidth: 220, flex: 1 }}>
                <CardContent>
                  <CozyFlexColumn>
                    <CozySecondaryTypography variant="overline" gutterBottom>
                      Total Bytes Scanned
                    </CozySecondaryTypography>
                    <motion.div variants={statVariants}>
                      <CozyTypography variant="h4" component="div">
                        {clamavStats.filesProcessed.toLocaleString()} bytes
                      </CozyTypography>
                    </motion.div>
                  </CozyFlexColumn>
                </CardContent>
              </CozyCard>
            </motion.div>

            <motion.div variants={cardVariants} whileHover="hover">
              <CozyCard sx={{ minWidth: 220, flex: 1 }}>
                <CardContent>
                  <CozyFlexColumn>
                    <CozySecondaryTypography variant="overline" gutterBottom>
                      System Health
                    </CozySecondaryTypography>
                    <motion.div variants={statVariants}>
                      <CozyTypography variant="h4" component="div">
                        {clamavStatus?.available
                          ? "Excellent"
                          : "Issues Detected"}
                      </CozyTypography>
                    </motion.div>
                  </CozyFlexColumn>
                </CardContent>
              </CozyCard>
            </motion.div>
          </CozyFlexRow>
        </motion.div>

        {/* Main Content Row */}
        <CozyFlexRow sx={{ gap: 3, alignItems: "flex-start" }}>
          {/* Recent Activity */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            style={{ flex: 1 }}
          >
            <CozyCard
              sx={{ height: 400, display: "flex", flexDirection: "column" }}
            >
              <CardContent>
                <CozyTypography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  📊 Recent Activity
                </CozyTypography>
                <CozyAccent />
                <Box
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    overflowX: "hidden",
                    pr: 1,
                    maxHeight: "300px",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "4px",
                      margin: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "rgba(0, 188, 212, 0.4)",
                      borderRadius: "4px",
                      "&:hover": {
                        background: "rgba(0, 188, 212, 0.6)",
                      },
                    },
                    // Enhanced scrolling for trackpad/touchpad
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <CozyFlexColumn sx={{ gap: 2 }}>
                    <AnimatePresence>
                      {scanHistory.slice(0, 8).map((scan, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Box
                            sx={{
                              p: 2.5,
                              backgroundColor: "#21262D",
                              borderRadius: 2,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            <CozyTypography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {scan.filename ||
                                scan.file_path ||
                                "Unknown file"}
                            </CozyTypography>
                            <CozySecondaryTypography
                              variant="body2"
                              sx={{
                                color: scan.infected ? "#f44336" : "#00bfae",
                              }}
                            >
                              {scan.infected ? "Threat" : "Clean"}
                            </CozySecondaryTypography>
                            <CozySecondaryTypography
                              variant="caption"
                              sx={{ color: "#aaa" }}
                            >
                              {scan.timestamp ? timeAgo(scan.timestamp) : ""}
                            </CozySecondaryTypography>
                          </Box>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CozyFlexColumn>
                </Box>
              </CardContent>
            </CozyCard>
          </motion.div>

          {/* tips */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            style={{ flex: 1 }}
          >
            <CozyCard sx={{ height: 400 }}>
              <CardContent>
                <CozyTypography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  🛡️ Security Tips
                </CozyTypography>
                <CozyAccent />
                <CozyFlexColumn sx={{ gap: 2 }}>
                  {securityTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          backgroundColor: "#21262D",
                          borderRadius: 1.5,
                          border: "1px solid rgba(48, 54, 61, 0.5)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "#30363D",
                            borderColor: "rgba(0, 188, 212, 0.3)",
                            transform: "translateY(-1px)",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        <CozyTypography
                          variant="body2"
                          sx={{
                            color: "#F0F6FC",
                            fontFamily: '"Inter", sans-serif',
                            lineHeight: 1.6,
                          }}
                        >
                          • {tip}
                        </CozyTypography>
                      </Box>
                    </motion.div>
                  ))}
                </CozyFlexColumn>
              </CardContent>
            </CozyCard>
          </motion.div>
        </CozyFlexRow>
      </motion.div>
    </CozyToolContainer>
  );
};

export default Dashboard;
