import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserSettings, saveUserSettings } from "../services/userSettingService";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // initial state from localStorage (fallback)
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("theme") as Theme) || "light");

  // Track current logged-in uid (if any)
  const uidRef = useRef<string | null>(null);

  // Debounce timer for saving settings to Firestore
  const saveTimer = useRef<number | null>(null);

  // Listen for auth changes and load user settings when a user logs in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid ?? null;
      uidRef.current = uid;

      if (uid) {
        try {
          const settings = await getUserSettings(uid);
          if (settings && (settings.theme === "dark" || settings.theme === "light")) {
            setTheme(settings.theme);
            // keep localStorage in sync
            localStorage.setItem("theme", settings.theme);
          }
        } catch (err) {
          // if loading fails, we keep existing theme (localStorage fallback)
          console.error("Failed to load user settings:", err);
        }
      }
    });

    return () => {
      unsub();
    };
  }, []);

  // Apply theme to DOM and persist locally and to Firestore (debounced)
  useEffect(() => {
    // Update DOM class
    document.body.classList.toggle("dark", theme === "dark");

    // Persist to localStorage immediately
    localStorage.setItem("theme", theme);

    // Persist to Firestore if user is logged in (debounced to avoid rapid writes)
    const uid = uidRef.current;
    if (uid) {
      // clear existing timer
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }

      // schedule save after 800ms
      // window.setTimeout returns number in browser
      saveTimer.current = window.setTimeout(() => {
        saveUserSettings(uid, { theme }).catch((e) => console.error("Failed to save user settings:", e));
        saveTimer.current = null;
      }, 800) as unknown as number;
    }

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};