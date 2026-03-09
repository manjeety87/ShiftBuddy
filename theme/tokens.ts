import type { AppTheme } from "@/types";

// ─── Helper ─────────────────────────────────────────────────────────
const t = (
  id: string,
  name: string,
  category: AppTheme["category"],
  tokens: AppTheme["tokens"],
  isPremium = false,
): AppTheme => ({ id, name, category, tokens, isPremium });

// ─── Standard Themes ────────────────────────────────────────────────

export const lightTheme = t("light", "Light", "standard", {
  background: "#F8F9FB",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  textPrimary: "#1A1D21",
  textSecondary: "#6B7280",
  accent: "#3B82F6",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  border: "#E5E7EB",
  shadow: "#00000014",
  overlay: "#00000033",
  blurTint: "light",
  glassOpacity: 0,
  radiusScale: 1,
});

export const darkTheme = t("dark", "Dark", "standard", {
  background: "#0F1117",
  surface: "#1A1D27",
  card: "#1E2230",
  textPrimary: "#F1F3F5",
  textSecondary: "#9BA1AE",
  accent: "#60A5FA",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  border: "#2A2F3E",
  shadow: "#00000040",
  overlay: "#00000066",
  blurTint: "dark",
  glassOpacity: 0,
  radiusScale: 1,
});

export const midnightTheme = t("midnight", "Midnight", "standard", {
  background: "#07080D",
  surface: "#0E1018",
  card: "#141722",
  textPrimary: "#E8EAF0",
  textSecondary: "#7F879A",
  accent: "#818CF8",
  success: "#34D399",
  warning: "#FCD34D",
  error: "#FB7185",
  border: "#1E2235",
  shadow: "#00000050",
  overlay: "#00000077",
  blurTint: "dark",
  glassOpacity: 0,
  radiusScale: 1,
});

export const oceanTheme = t("ocean", "Ocean", "standard", {
  background: "#0B1628",
  surface: "#112240",
  card: "#172A4A",
  textPrimary: "#CCD6F6",
  textSecondary: "#8892B0",
  accent: "#64FFDA",
  success: "#64FFDA",
  warning: "#FFD166",
  error: "#FF6B6B",
  border: "#1E3A5F",
  shadow: "#00000050",
  overlay: "#00000066",
  blurTint: "dark",
  glassOpacity: 0,
  radiusScale: 1,
});

// ─── Developer Themes ───────────────────────────────────────────────

export const githubDarkTheme = t("github-dark", "GitHub Dark", "developer", {
  background: "#0D1117",
  surface: "#161B22",
  card: "#21262D",
  textPrimary: "#E6EDF3",
  textSecondary: "#8B949E",
  accent: "#58A6FF",
  success: "#3FB950",
  warning: "#D29922",
  error: "#F85149",
  border: "#30363D",
  shadow: "#00000040",
  overlay: "#00000066",
  blurTint: "dark",
  glassOpacity: 0,
  radiusScale: 1,
});

export const vscodeDarkTheme = t("vscode-dark", "VSCode Dark", "developer", {
  background: "#1E1E1E",
  surface: "#252526",
  card: "#2D2D2D",
  textPrimary: "#D4D4D4",
  textSecondary: "#808080",
  accent: "#569CD6",
  success: "#6A9955",
  warning: "#CE9178",
  error: "#F44747",
  border: "#3C3C3C",
  shadow: "#00000040",
  overlay: "#00000066",
  blurTint: "dark",
  glassOpacity: 0,
  radiusScale: 1,
});

export const claudeTheme = t("claude", "Claude", "developer", {
  background: "#1A1510",
  surface: "#2A2318",
  card: "#332B1E",
  textPrimary: "#EDE6D5",
  textSecondary: "#A89B84",
  accent: "#D4A574",
  success: "#7DB88A",
  warning: "#E0B455",
  error: "#D47272",
  border: "#3D3428",
  shadow: "#00000050",
  overlay: "#00000066",
  blurTint: "dark",
  glassOpacity: 0,
  radiusScale: 1,
});

export const terminalGreenTheme = t(
  "terminal-green",
  "Terminal Green",
  "developer",
  {
    background: "#0C0C0C",
    surface: "#141414",
    card: "#1A1A1A",
    textPrimary: "#33FF33",
    textSecondary: "#1A9E1A",
    accent: "#33FF33",
    success: "#33FF33",
    warning: "#FFD700",
    error: "#FF3333",
    border: "#2A2A2A",
    shadow: "#00000050",
    overlay: "#00000066",
    blurTint: "dark",
    glassOpacity: 0,
    radiusScale: 1,
  },
);

// ─── Premium / Glass Themes ─────────────────────────────────────────

export const glassmorphismLightTheme = t(
  "glass-light",
  "Glassmorphism Light",
  "premium",
  {
    background: "#EFF3F8",
    surface: "#FFFFFF",
    card: "#FFFFFFCC", // translucent white
    textPrimary: "#1A1D21",
    textSecondary: "#6B7280",
    accent: "#6366F1",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    border: "#FFFFFF66",
    shadow: "#00000018",
    overlay: "#FFFFFF44",
    blurTint: "light",
    glassOpacity: 0.55,
    radiusScale: 1.3,
  },
  true,
);

export const glassmorphismDarkTheme = t(
  "glass-dark",
  "Glassmorphism Dark",
  "premium",
  {
    background: "#0B0E14",
    surface: "#14182199",
    card: "#1E223088",
    textPrimary: "#F1F3F5",
    textSecondary: "#9BA1AE",
    accent: "#818CF8",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    border: "#FFFFFF18",
    shadow: "#00000060",
    overlay: "#00000055",
    blurTint: "dark",
    glassOpacity: 0.45,
    radiusScale: 1.3,
  },
  true,
);

export const liquidGlassBlueTheme = t(
  "liquid-blue",
  "Liquid Glass Blue",
  "premium",
  {
    background: "#0A1628",
    surface: "#0F1F3D",
    card: "#1A2F55CC",
    textPrimary: "#E0EAFF",
    textSecondary: "#8AA2D0",
    accent: "#60A5FA",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    border: "#60A5FA33",
    shadow: "#60A5FA22",
    overlay: "#0A162899",
    blurTint: "dark",
    glassOpacity: 0.5,
    radiusScale: 1.4,
  },
  true,
);

export const liquidGlassAuroraTheme = t(
  "liquid-aurora",
  "Liquid Glass Aurora",
  "premium",
  {
    background: "#0A0F1A",
    surface: "#111827",
    card: "#162033CC",
    textPrimary: "#F0FDF4",
    textSecondary: "#94A3B8",
    accent: "#A78BFA",
    success: "#6EE7B7",
    warning: "#FDE68A",
    error: "#FCA5A5",
    border: "#A78BFA33",
    shadow: "#A78BFA22",
    overlay: "#0A0F1A99",
    blurTint: "dark",
    glassOpacity: 0.48,
    radiusScale: 1.4,
  },
  true,
);

export const frostedMidnightTheme = t(
  "frosted-midnight",
  "Frosted Midnight",
  "premium",
  {
    background: "#05060B",
    surface: "#0D101A",
    card: "#15192888",
    textPrimary: "#E2E8F0",
    textSecondary: "#64748B",
    accent: "#38BDF8",
    success: "#2DD4BF",
    warning: "#FACC15",
    error: "#FB7185",
    border: "#38BDF822",
    shadow: "#00000050",
    overlay: "#05060B99",
    blurTint: "dark",
    glassOpacity: 0.42,
    radiusScale: 1.35,
  },
  true,
);

// ─── Fun Themes ─────────────────────────────────────────────────────

export const cyberpunkTheme = t("cyberpunk", "Cyberpunk", "fun", {
  background: "#0A0A12",
  surface: "#12121D",
  card: "#1A1A2E",
  textPrimary: "#F5F5FF",
  textSecondary: "#9D9DAA",
  accent: "#FF2D95",
  success: "#00FF88",
  warning: "#FFD600",
  error: "#FF0055",
  border: "#FF2D9533",
  shadow: "#FF2D9522",
  overlay: "#0A0A1299",
  blurTint: "dark",
  glassOpacity: 0,
  radiusScale: 0.8,
});

export const neonTheme = t("neon", "Neon", "fun", {
  background: "#0A0A0A",
  surface: "#121212",
  card: "#1A1A1A",
  textPrimary: "#FFFFFF",
  textSecondary: "#AAAAAA",
  accent: "#00F0FF",
  success: "#39FF14",
  warning: "#FFE600",
  error: "#FF3131",
  border: "#00F0FF33",
  shadow: "#00F0FF22",
  overlay: "#0A0A0A99",
  blurTint: "dark",
  glassOpacity: 0,
  radiusScale: 1,
});

export const retroTerminalTheme = t("retro-terminal", "Retro Terminal", "fun", {
  background: "#1A0A00",
  surface: "#221200",
  card: "#2C1A06",
  textPrimary: "#FFB347",
  textSecondary: "#CC8030",
  accent: "#FFB347",
  success: "#FFB347",
  warning: "#FF6600",
  error: "#FF3333",
  border: "#FFB34733",
  shadow: "#00000050",
  overlay: "#1A0A0099",
  blurTint: "dark",
  glassOpacity: 0,
  radiusScale: 0.9,
});

// ─── Aggregated map ─────────────────────────────────────────────────

export const allThemes: AppTheme[] = [
  // Standard
  lightTheme,
  darkTheme,
  midnightTheme,
  oceanTheme,
  // Developer
  githubDarkTheme,
  vscodeDarkTheme,
  claudeTheme,
  terminalGreenTheme,
  // Premium
  glassmorphismLightTheme,
  glassmorphismDarkTheme,
  liquidGlassBlueTheme,
  liquidGlassAuroraTheme,
  frostedMidnightTheme,
  // Fun
  cyberpunkTheme,
  neonTheme,
  retroTerminalTheme,
];

export const themeMap: Record<string, AppTheme> = Object.fromEntries(
  allThemes.map((t) => [t.id, t]),
);
