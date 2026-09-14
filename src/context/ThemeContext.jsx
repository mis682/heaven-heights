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

// percent > 0 blends the channel toward white (a pale tint, e.g. the "light"
// background used behind active nav items); percent < 0 blends toward black
// (a shade, e.g. a hover/darker variant). Blending toward the far endpoint —
// rather than scaling each channel by its own value — keeps the result a
// true tint/shade of the original hue instead of skewing towards whichever
// channel started out largest (an orange lightened by scaling each channel
// by itself turns a saturated gold, not a soft peach).
function shade(hex, percent) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const target = percent >= 0 ? 255 : 0;
  const ratio = Math.abs(percent);
  const adjust = (channel) => Math.round(channel + (target - channel) * ratio);
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
