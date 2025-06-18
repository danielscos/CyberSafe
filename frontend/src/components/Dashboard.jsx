import { Alert } from "@mui/material";
import {
  WhiteTypography,
  SecondaryTypography,
  GlassPaper,
  ToolContainer,
  FlexRow,
  FlexColumn,
} from "./StyledComponents";
import { COLORS } from "../constants";

const DashboardCard = ({ label, value, icon }) => (
  <GlassPaper
    sx={{
      minWidth: 200,
      textAlign: "center",
      padding: 3,
      background: `linear-gradient(135deg, ${COLORS.background.primary}aa, ${COLORS.background.secondary}aa)`,
      backdropFilter: "blur(10px)",
      border: `1px solid ${COLORS.border.primary}`,
      borderRadius: 3,
      transition: "transform 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
      },
    }}
  >
    {icon && <div style={{ fontSize: "2rem", marginBottom: 8 }}>{icon}</div>}
    <SecondaryTypography variant="body2" sx={{ fontSize: "0.875rem", mb: 1 }}>
      {label}
    </SecondaryTypography>
    <WhiteTypography variant="h6" sx={{ fontSize: "1.25rem" }}>
      {value}
    </WhiteTypography>
  </GlassPaper>
);

const NewsPlaceholder = () => (
  <GlassPaper
    sx={{
      minHeight: 180,
      padding: 3,
      background: `linear-gradient(135deg, ${COLORS.background.primary}aa, ${COLORS.background.secondary}aa)`,
      backdropFilter: "blur(10px)",
      border: `1px solid ${COLORS.border.primary}`,
      borderRadius: 3,
    }}
  >
    <WhiteTypography variant="h5" sx={{ mb: 2, fontSize: "1.5rem" }}>
      Cybersecurity News
    </WhiteTypography>
    <FlexColumn>
      <Alert severity="info" sx={{ mb: 2 }}>
        News feed integration coming soon. Stay tuned for the latest
        cybersecurity updates!
      </Alert>
      <SecondaryTypography variant="body2">
        This section will feature:
      </SecondaryTypography>
      <ul
        style={{
          color: COLORS.text.secondary,
          paddingLeft: 20,
          margin: "8px 0",
        }}
      >
        <li>Latest security vulnerabilities</li>
        <li>Threat intelligence updates</li>
        <li>Industry news and insights</li>
        <li>Security tool releases</li>
      </ul>
    </FlexColumn>
  </GlassPaper>
);

const Dashboard = () => {
  // In a real application, this data would come from system APIs or monitoring services

  const systemInfo = [
    {
      label: "Operating System",
      value: (() => {
        if (navigator.userAgentData?.platform) {
          return navigator.userAgentData.platform;
        }
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes("win")) return "Windows";
        if (ua.includes("mac")) return "macOS";
        if (ua.includes("linux")) return "Linux";
        if (ua.includes("android")) return "Android";
        if (ua.includes("iphone") || ua.includes("ipad")) return "iOS";
        return "Unknown";
      })(),
      icon: "💻",
    },
    {
      label: "Browser",
      value: navigator.userAgent.split(" ")[0] || "Unknown",
      icon: "🌐",
    },
    {
      label: "Screen Resolution",
      value: `${screen.width}x${screen.height}`,
      icon: "📺",
    },
    { label: "Language", value: navigator.language || "Unknown", icon: "🌍" },
    {
      label: "Online Status",
      value: navigator.onLine ? "Connected" : "Offline",
      icon: navigator.onLine ? "🟢" : "🔴",
    },
    {
      label: "Current Time",
      value: new Date().toLocaleTimeString(),
      icon: "🕐",
    },
  ];

  return (
    <ToolContainer>
      <WhiteTypography
        variant="h4"
        gutterBottom
        sx={{ mb: 4, textAlign: "center" }}
      >
        CyberSafe Dashboard
      </WhiteTypography>

      <FlexColumn sx={{ gap: 4 }}>
        {/* System Information Cards */}
        <div>
          <WhiteTypography variant="h6" sx={{ mb: 2 }}>
            System Information
          </WhiteTypography>
          <FlexRow
            sx={{
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
              "@media (max-width: 768px)": {
                flexDirection: "column",
                alignItems: "center",
              },
            }}
          >
            {systemInfo.map((info, index) => (
              <DashboardCard
                key={index}
                label={info.label}
                value={info.value}
                icon={info.icon}
              />
            ))}
          </FlexRow>
        </div>

        {/* Quick Stats */}
        <div>
          <WhiteTypography variant="h6" sx={{ mb: 2 }}>
            Quick Stats
          </WhiteTypography>
          <FlexRow
            sx={{
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
              "@media (max-width: 768px)": {
                flexDirection: "column",
                alignItems: "center",
              },
            }}
          >
            <DashboardCard label="Hashes Generated" value="0" icon="🔐" />
            <DashboardCard label="Files Scanned" value="0" icon="📄" />
            <DashboardCard label="Threats Detected" value="0" icon="🛡️" />
          </FlexRow>
        </div>

        {/* News Section */}
        <div>
          <NewsPlaceholder />
        </div>

        {/* Welcome Message */}
        <GlassPaper
          sx={{
            textAlign: "center",
            padding: 3,
            background: `linear-gradient(135deg, ${COLORS.primary.main}22, ${COLORS.primary.dark}22)`,
          }}
        >
          <WhiteTypography variant="h6" sx={{ mb: 2 }}>
            Welcome to CyberSafe
          </WhiteTypography>
          <SecondaryTypography variant="body1">
            Your comprehensive cybersecurity analysis toolkit. Use the sidebar
            to navigate between different tools and resources.
          </SecondaryTypography>
        </GlassPaper>
      </FlexColumn>
    </ToolContainer>
  );
};

export default Dashboard;
