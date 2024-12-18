"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="${DEFAULT_THEME}"
      enableSystem={${ENABLE_SYSTEM_THEME}}
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}