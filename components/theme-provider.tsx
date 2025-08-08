"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Defer rendering until mounted to avoid SSR/client mismatch of data-theme
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
