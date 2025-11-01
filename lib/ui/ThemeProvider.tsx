import { light, Palette } from "@/styles/theme";
import * as SystemUI from "expo-system-ui";
import { createContext, useContext, useEffect, useMemo } from "react";

type ThemeCtx = {
  palette: Palette;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Keep system bars readable
    SystemUI.setBackgroundColorAsync(light.background);
  }, []);

  const value = useMemo(
    () => ({
      palette: light,
    }),
    []
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
