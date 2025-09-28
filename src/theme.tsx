import React from "react";
import { useTheme } from "../src/context/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button onClick={toggle} aria-label="Toggle theme" className="fixed top-20 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-300 dark:hover:bg-gray-700 transition">
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};