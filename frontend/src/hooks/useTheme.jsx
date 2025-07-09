import { createContext, useContext, useState, useEffect } from "react";
import { createCozyTheme } from "../theme/cozyTheme";

// Create theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to dark
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("cyberSafeTheme");
      const initialTheme = savedTheme || "dark";
      // Set the initial data-theme attribute
      document.documentElement.setAttribute("data-theme", initialTheme);
      return initialTheme;
    } catch (error) {
      console.error("Error reading theme from localStorage:", error);
      document.documentElement.setAttribute("data-theme", "dark");
      return "dark";
    }
  });

  // Create theme instance based on current mode
  const theme = createCozyTheme(themeMode);

  // Toggle theme function
  const toggleTheme = () => {
    const newMode = themeMode === "dark" ? "light" : "dark";
    setThemeMode(newMode);
  };

  // Save theme to localStorage and update document attribute when it changes
  useEffect(() => {
    try {
      localStorage.setItem("cyberSafeTheme", themeMode);
      // Update the document's data-theme attribute for CSS custom properties
      document.documentElement.setAttribute("data-theme", themeMode);
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
    }
  }, [themeMode]);

  const value = {
    themeMode,
    theme,
    toggleTheme,
    isDarkMode: themeMode === "dark",
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};