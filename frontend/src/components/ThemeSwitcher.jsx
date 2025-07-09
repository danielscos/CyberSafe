import { IconButton, Tooltip } from "@mui/material";
import { LightMode, DarkMode } from "@mui/icons-material";
import { useTheme } from "../hooks/useTheme";

const ThemeSwitcher = () => {
  const { themeMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: "primary.main",
          backgroundColor: "transparent",
          border: "1px solid",
          borderColor: "primary.main",
          borderRadius: "8px",
          padding: "8px",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "action.hover",
            transform: "scale(1.05)",
          },
        }}
        aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
      >
        {themeMode === "dark" ? (
          <LightMode sx={{ fontSize: 20 }} />
        ) : (
          <DarkMode sx={{ fontSize: 20 }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;