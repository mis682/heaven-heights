import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const DEFAULT_COLOR = "#F97316";

function hexToRgbTriplet(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function shade(hex, percent) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const adjust = (channel) => {
    const amount = Math.round(channel * percent);
    return Math.max(0, Math.min(255, channel + amount));
  };
  return `${adjust(r)} ${adjust(g)} ${adjust(b)}`;
}

function applyThemeColor(hex) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", hexToRgbTriplet(hex));
  root.style.setProperty("--color-primary-light", shade(hex, 0.65));
  root.style.setProperty("--color-primary-dark", shade(hex, -0.2));
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem("hh_theme") === "dark");
  const [themeColor, setThemeColorState] = useState(() => localStorage.getItem("hh_theme_color") || DEFAULT_COLOR);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("hh_theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    applyThemeColor(themeColor);
    localStorage.setItem("hh_theme_color", themeColor);
  }, [themeColor]);

  const setThemeColor = (hex) => setThemeColorState(hex);
  const getThemeColor = () => themeColor;

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d), themeColor, setThemeColor, getThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
