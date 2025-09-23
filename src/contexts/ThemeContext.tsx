import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Beim ersten Rendering aus localStorage lesen oder Fallback auf "light"
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  useEffect(() => {
    // Theme im DOM aktualisieren
    document.body.classList.toggle("dark", theme === "dark");
    
    // Theme in localStorage speichern
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};