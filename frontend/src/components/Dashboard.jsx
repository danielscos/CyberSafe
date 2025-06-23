import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
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

const Dashboard = () => {
  const [stats, _setStats] = useState({
    totalScans: 1247,
    threatsDetected: 23,
    filesProcessed: 8934,
    systemHealth: "Excellent",
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

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

  const recentActivity = [
    { type: "Scan", file: "document.pdf", status: "Clean", time: "2 min ago" },
    { type: "Hash", file: "image.jpg", status: "Verified", time: "5 min ago" },
    { type: "Scan", file: "archive.zip", status: "Threat", time: "12 min ago" },
    { type: "Hash", file: "video.mp4", status: "Clean", time: "18 min ago" },
  ];

  return (
    <CozyToolContainer maxWidth={1200} minHeight={600}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
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

        {/* Stats Cards Row */}
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
                      {stats.totalScans.toLocaleString()}
                    </CozyTypography>
                  </motion.div>
                  <Chip
                    label="↗ +12% this week"
                    size="small"
                    variant="outlined"
                    sx={{
                      backgroundColor: "rgba(129, 199, 132, 0.1)",
                      color: "#81C784",
                      borderColor: "rgba(129, 199, 132, 0.3)",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      alignSelf: "flex-start",
                      mt: 1,
                      height: 24,
                    }}
                  />
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
                      {stats.threatsDetected}
                    </CozyTypography>
                  </motion.div>
                  <Chip
                    label="🛡️ All resolved"
                    size="small"
                    variant="outlined"
                    sx={{
                      backgroundColor: "rgba(255, 183, 77, 0.1)",
                      color: "#FFB74D",
                      borderColor: "rgba(255, 183, 77, 0.3)",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      alignSelf: "flex-start",
                      mt: 1,
                      height: 24,
                    }}
                  />
                </CozyFlexColumn>
              </CardContent>
            </CozyCard>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover">
            <CozyCard sx={{ minWidth: 220, flex: 1 }}>
              <CardContent>
                <CozyFlexColumn>
                  <CozySecondaryTypography variant="overline" gutterBottom>
                    Files Processed
                  </CozySecondaryTypography>
                  <motion.div variants={statVariants}>
                    <CozyTypography variant="h4" component="div">
                      {stats.filesProcessed.toLocaleString()}
                    </CozyTypography>
                  </motion.div>
                  <Chip
                    label="🔄 Processing"
                    size="small"
                    variant="outlined"
                    sx={{
                      backgroundColor: "rgba(77, 208, 225, 0.1)",
                      color: "#4DD0E1",
                      borderColor: "rgba(77, 208, 225, 0.3)",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      alignSelf: "flex-start",
                      mt: 1,
                      height: 24,
                    }}
                  />
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
                      {stats.systemHealth}
                    </CozyTypography>
                  </motion.div>
                  <Chip
                    label="✅ All systems operational"
                    size="small"
                    variant="outlined"
                    sx={{
                      backgroundColor: "rgba(129, 199, 132, 0.1)",
                      color: "#81C784",
                      borderColor: "rgba(129, 199, 132, 0.3)",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      alignSelf: "flex-start",
                      mt: 1,
                      height: 24,
                    }}
                  />
                </CozyFlexColumn>
              </CardContent>
            </CozyCard>
          </motion.div>
        </CozyFlexRow>

        {/* Main Content Row */}
        <CozyFlexRow sx={{ gap: 3, alignItems: "flex-start" }}>
          {/* Recent Activity */}
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
                  📊 Recent Activity
                </CozyTypography>
                <CozyAccent />
                <CozyFlexColumn sx={{ gap: 2 }}>
                  <AnimatePresence>
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
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
                          <CozyFlexRow sx={{ alignItems: "center" }}>
                            <Box sx={{ flex: 1 }}>
                              <CozyTypography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: "#F0F6FC",
                                  fontFamily: '"Inter", sans-serif',
                                }}
                              >
                                {activity.type}: {activity.file}
                              </CozyTypography>
                              <CozySecondaryTypography
                                variant="caption"
                                sx={{
                                  color: "#8B949E",
                                  fontFamily: '"JetBrains Mono", monospace',
                                }}
                              >
                                {activity.time}
                              </CozySecondaryTypography>
                            </Box>
                            <Chip
                              label={activity.status}
                              size="small"
                              variant="outlined"
                              sx={{
                                backgroundColor:
                                  activity.status === "Clean"
                                    ? "rgba(129, 199, 132, 0.1)"
                                    : activity.status === "Threat"
                                      ? "rgba(229, 115, 115, 0.1)"
                                      : "rgba(77, 208, 225, 0.1)",
                                color:
                                  activity.status === "Clean"
                                    ? "#81C784"
                                    : activity.status === "Threat"
                                      ? "#E57373"
                                      : "#4DD0E1",
                                borderColor:
                                  activity.status === "Clean"
                                    ? "rgba(129, 199, 132, 0.3)"
                                    : activity.status === "Threat"
                                      ? "rgba(229, 115, 115, 0.3)"
                                      : "rgba(77, 208, 225, 0.3)",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                height: 22,
                              }}
                            />
                          </CozyFlexRow>
                        </Box>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CozyFlexColumn>
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

        {/* quick act */}
        <motion.div variants={cardVariants} style={{ marginTop: 24 }}>
          <CozyCard>
            <CardContent>
              <CozyTypography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                🚀 Quick Actions
              </CozyTypography>
              <CozyAccent />
              <CozyFlexRow sx={{ gap: 2, flexWrap: "wrap", mt: 2 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CozyPrimaryButton>Start Full System Scan</CozyPrimaryButton>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CozyPrimaryButton>
                    Update Virus Definitions
                  </CozyPrimaryButton>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CozyPrimaryButton>
                    Generate Security Report
                  </CozyPrimaryButton>
                </motion.div>
              </CozyFlexRow>
            </CardContent>
          </CozyCard>
        </motion.div>
      </motion.div>
    </CozyToolContainer>
  );
};

export default Dashboard;
