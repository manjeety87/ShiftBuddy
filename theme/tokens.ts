// import { AppTheme } from "./types";

// /**
//  * ═══════════════════════════════════════════════════════════════════════════
//  * ARCHIVED — Original 3 themes (kept for reference only, not in allThemes)
//  * ═══════════════════════════════════════════════════════════════════════════
//  *
//  * export const orchestratorTheme: AppTheme = {
//  *   id: "orchestrator",
//  *   name: "Orchestrator Premium",
//  *   category: "premium",
//  *   tokens: {
//  *     surface_darkest: "#0b0e14", surface_lowest: "#0b0e14", surface: "#10131a",
//  *     surface_container_low: "#191c22", surface_container: "#1d2026",
//  *     surface_container_high: "#272a31", surface_container_highest: "#32353c",
//  *     surface_bright: "#363940", textPrimary: "#e1e2eb", textSecondary: "#c1c6d7",
//  *     textTertiary: "#8b90a0", primary: "#adc6ff", primary_container: "#4b8eff",
//  *     primary_fixed_dim: "#adc6ff", success: "#22c55e", tertiary: "#ffb595",
//  *     tertiary_container: "#ef6719", warning: "#f59e0b", error: "#ffb4ab",
//  *     error_container: "#93000a", outline_variant: "#414755", outline: "#8b90a0",
//  *     shadow: "#000000", ambient_shadow: "rgba(173, 198, 255, 0.1)",
//  *     overlay: "rgba(0, 0, 0, 0.4)", blurTint: "dark", glassOpacity: 0.7,
//  *     spacingBase: 1, radiusScale: 1, accent: "#adc6ff", card: "#1d2026",
//  *     background: "#10131a",
//  *   },
//  * };
//  *
//  * export const lightGlassTheme: AppTheme = {
//  *   id: "light-glass", name: "Liquid Glass Light", category: "glass",
//  *   tokens: {
//  *     surface_darkest: "#f0f2f5", surface_lowest: "#f6f8fb", surface: "#ffffff",
//  *     surface_container_low: "#f1f3f6", surface_container: "#fafbfc",
//  *     surface_container_high: "#f5f7fa", surface_container_highest: "#eef1f5",
//  *     surface_bright: "#ffffff", textPrimary: "#0f172a", textSecondary: "#64748b",
//  *     textTertiary: "#94a3b8", primary: "#3b82f6", primary_container: "#1d4ed8",
//  *     primary_fixed_dim: "#2563eb", success: "#16a34a", tertiary: "#fb923c",
//  *     tertiary_container: "#f97316", warning: "#d97706", error: "#dc2626",
//  *     error_container: "#fecaca", outline_variant: "#cbd5e1", outline: "#94a3b8",
//  *     shadow: "#000000", ambient_shadow: "rgba(59, 130, 246, 0.1)",
//  *     overlay: "rgba(255, 255, 255, 0.22)", blurTint: "light", glassOpacity: 0.72,
//  *     spacingBase: 1, radiusScale: 1, accent: "#3b82f6", card: "#fafbfc",
//  *     background: "#ffffff",
//  *   },
//  * };
//  *
//  * export const githubTheme: AppTheme = {
//  *   id: "github-dark", name: "GitHub Dark", category: "developer",
//  *   tokens: {
//  *     surface_darkest: "#010409", surface_lowest: "#0d1117", surface: "#0d1117",
//  *     surface_container_low: "#161b22", surface_container: "#161b22",
//  *     surface_container_high: "#21262d", surface_container_highest: "#30363d",
//  *     surface_bright: "#e6edf3", textPrimary: "#e6edf3", textSecondary: "#8b949e",
//  *     textTertiary: "#6e7681", primary: "#58a6ff", primary_container: "#1f6feb",
//  *     primary_fixed_dim: "#388bfd", success: "#3fb950", tertiary: "#a371f7",
//  *     tertiary_container: "#79c0ff", warning: "#d29922", error: "#f85149",
//  *     error_container: "#da3633", outline_variant: "#444c56", outline: "#30363d",
//  *     shadow: "#000000", ambient_shadow: "rgba(88, 166, 255, 0.1)",
//  *     overlay: "rgba(13, 17, 23, 0.75)", blurTint: "dark", glassOpacity: 0,
//  *     spacingBase: 1, radiusScale: 1, accent: "#58a6ff", card: "#161b22",
//  *     background: "#0d1117",
//  *   },
//  * };
//  */

// /**
//  * ═══════════════════════════════════════════════════════════════════════════
//  * ACTIVE THEMES — 12 total: 10 Glassmorphism/Liquid-Glass family + 2 Brutalist
//  * ═══════════════════════════════════════════════════════════════════════════
//  * Every theme below satisfies the same ThemeTokens contract (theme/types.ts).
//  * radiusScale + glassOpacity already act as "structural switches": setting
//  * them to 0 turns off rounded corners / blur app-wide with zero component
//  * changes. borderWidth + useGradients are the 2 new optional fields added
//  * for the Brutalist family (see theme/types.ts).
//  */

// // ── 1. Ocean Frost (dark, deep blue + icy cyan glass) — NEW DEFAULT FLAGSHIP
// export const oceanFrostTheme: AppTheme = {
//   id: "ocean-frost",
//   name: "Ocean Frost",
//   category: "glass",
//   tokens: {
//     surface_darkest: "#041019",
//     surface_lowest: "#06151f",
//     surface: "#081826",
//     surface_container_low: "#0d2233",
//     surface_container: "#112b3f",
//     surface_container_high: "#17384f",
//     surface_container_highest: "#1e455f",
//     surface_bright: "#26536e",
//     textPrimary: "#e4f4ff",
//     textSecondary: "#aed4e8",
//     textTertiary: "#7ba3b8",
//     primary: "#7fd8ff",
//     primary_container: "#2f9fd6",
//     primary_fixed_dim: "#7fd8ff",
//     success: "#35d19c",
//     tertiary: "#ffb26b",
//     tertiary_container: "#cc7a2e",
//     warning: "#f4c04d",
//     error: "#ff8080",
//     error_container: "#5c1414",
//     outline_variant: "#23415a",
//     outline: "#7ba3b8",
//     shadow: "#000000",
//     ambient_shadow: "rgba(127, 216, 255, 0.15)",
//     overlay: "rgba(0, 0, 0, 0.45)",
//     blurTint: "dark",
//     glassOpacity: 0.68,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#7fd8ff",
//     card: "#112b3f",
//     background: "#081826",
//   },
// };

// // ── 2. Midnight Amethyst (dark, violet/magenta glass)
// export const midnightAmethystTheme: AppTheme = {
//   id: "midnight-amethyst",
//   name: "Midnight Amethyst",
//   category: "glass",
//   tokens: {
//     surface_darkest: "#0d0817",
//     surface_lowest: "#0d0817",
//     surface: "#120b1f",
//     surface_container_low: "#1b1330",
//     surface_container: "#211638",
//     surface_container_high: "#2c1f47",
//     surface_container_highest: "#392a57",
//     surface_bright: "#40325f",
//     textPrimary: "#ece7f7",
//     textSecondary: "#c3b8dd",
//     textTertiary: "#9284b3",
//     primary: "#b39dff",
//     primary_container: "#7c4dff",
//     primary_fixed_dim: "#b39dff",
//     success: "#4ade80",
//     tertiary: "#ff9ad1",
//     tertiary_container: "#e0409e",
//     warning: "#fbbf24",
//     error: "#ff8a94",
//     error_container: "#7a0026",
//     outline_variant: "#4a3d63",
//     outline: "#9284b3",
//     shadow: "#000000",
//     ambient_shadow: "rgba(179, 157, 255, 0.15)",
//     overlay: "rgba(0, 0, 0, 0.45)",
//     blurTint: "dark",
//     glassOpacity: 0.68,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#b39dff",
//     card: "#211638",
//     background: "#120b1f",
//   },
// };

// // ── 3. Aurora Teal (dark slate, mint/teal glass)
// export const auroraTealTheme: AppTheme = {
//   id: "aurora-teal",
//   name: "Aurora Teal",
//   category: "glass",
//   tokens: {
//     surface_darkest: "#06120f",
//     surface_lowest: "#06120f",
//     surface: "#0b1a17",
//     surface_container_low: "#102420",
//     surface_container: "#143028",
//     surface_container_high: "#1c3d33",
//     surface_container_highest: "#244a3f",
//     surface_bright: "#2c574a",
//     textPrimary: "#e3f5ef",
//     textSecondary: "#a9d4c6",
//     textTertiary: "#7ba594",
//     primary: "#4fe3c1",
//     primary_container: "#14b891",
//     primary_fixed_dim: "#4fe3c1",
//     success: "#22c55e",
//     tertiary: "#ffb37a",
//     tertiary_container: "#d9691f",
//     warning: "#f5b942",
//     error: "#ff8f7a",
//     error_container: "#6e1a10",
//     outline_variant: "#2c473d",
//     outline: "#7ba594",
//     shadow: "#000000",
//     ambient_shadow: "rgba(79, 227, 193, 0.15)",
//     overlay: "rgba(0, 0, 0, 0.45)",
//     blurTint: "dark",
//     glassOpacity: 0.65,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#4fe3c1",
//     card: "#143028",
//     background: "#0b1a17",
//   },
// };

// // ── 4. Sunset Citrus (warm dark charcoal, coral-orange glass)
// export const sunsetCitrusTheme: AppTheme = {
//   id: "sunset-citrus",
//   name: "Sunset Citrus",
//   category: "glass",
//   tokens: {
//     surface_darkest: "#150f0c",
//     surface_lowest: "#150f0c",
//     surface: "#1c1410",
//     surface_container_low: "#251b15",
//     surface_container: "#2c2119",
//     surface_container_high: "#382a20",
//     surface_container_highest: "#453529",
//     surface_bright: "#513f30",
//     textPrimary: "#f7ece3",
//     textSecondary: "#d9bfab",
//     textTertiary: "#ab8a72",
//     primary: "#ff9a5a",
//     primary_container: "#ef6719",
//     primary_fixed_dim: "#ff9a5a",
//     success: "#34d399",
//     tertiary: "#ffd166",
//     tertiary_container: "#c9931c",
//     warning: "#fbbf24",
//     error: "#ff8080",
//     error_container: "#660d0d",
//     outline_variant: "#4a382b",
//     outline: "#ab8a72",
//     shadow: "#000000",
//     ambient_shadow: "rgba(255, 154, 90, 0.15)",
//     overlay: "rgba(0, 0, 0, 0.45)",
//     blurTint: "dark",
//     glassOpacity: 0.7,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#ff9a5a",
//     card: "#2c2119",
//     background: "#1c1410",
//   },
// };

// // ── 5. Graphite Gold (near-black, champagne-gold, minimal "executive" glass)
// export const graphiteGoldTheme: AppTheme = {
//   id: "graphite-gold",
//   name: "Graphite Gold",
//   category: "premium",
//   tokens: {
//     surface_darkest: "#0e0e0e",
//     surface_lowest: "#101010",
//     surface: "#141414",
//     surface_container_low: "#1a1a1a",
//     surface_container: "#1f1f1f",
//     surface_container_high: "#292929",
//     surface_container_highest: "#333333",
//     surface_bright: "#3d3d3d",
//     textPrimary: "#f2ede1",
//     textSecondary: "#c9bfa8",
//     textTertiary: "#8f8570",
//     primary: "#d8b968",
//     primary_container: "#a8843a",
//     primary_fixed_dim: "#d8b968",
//     success: "#4caf6e",
//     tertiary: "#c98a4b",
//     tertiary_container: "#8a521f",
//     warning: "#d8b968",
//     error: "#d16b6b",
//     error_container: "#4a1414",
//     outline_variant: "#34302a",
//     outline: "#8f8570",
//     shadow: "#000000",
//     ambient_shadow: "rgba(216, 185, 104, 0.12)",
//     overlay: "rgba(0, 0, 0, 0.5)",
//     blurTint: "dark",
//     glassOpacity: 0.3,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#d8b968",
//     card: "#1f1f1f",
//     background: "#141414",
//   },
// };

// // ── 6. Cyber Neon (very dark, dual electric cyan + violet accent)
// export const cyberNeonTheme: AppTheme = {
//   id: "cyber-neon",
//   name: "Cyber Neon",
//   category: "fun",
//   tokens: {
//     surface_darkest: "#060610",
//     surface_lowest: "#08081a",
//     surface: "#0b0b1f",
//     surface_container_low: "#12122c",
//     surface_container: "#171736",
//     surface_container_high: "#1f1f47",
//     surface_container_highest: "#292958",
//     surface_bright: "#333369",
//     textPrimary: "#eef0ff",
//     textSecondary: "#b8bcf0",
//     textTertiary: "#7d81b8",
//     primary: "#7df9ff",
//     primary_container: "#3fd0e0",
//     primary_fixed_dim: "#7df9ff",
//     success: "#39ff88",
//     tertiary: "#b06bff",
//     tertiary_container: "#7a2fe0",
//     warning: "#ffd23f",
//     error: "#ff5c7a",
//     error_container: "#520018",
//     outline_variant: "#2c2c52",
//     outline: "#7d81b8",
//     shadow: "#000000",
//     ambient_shadow: "rgba(125, 249, 255, 0.2)",
//     overlay: "rgba(0, 0, 0, 0.5)",
//     blurTint: "dark",
//     glassOpacity: 0.55,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#7df9ff",
//     card: "#171736",
//     background: "#0b0b1f",
//   },
// };

// // ── 7. Rose Quartz Light (light blush, dusty rose glass)
// export const roseQuartzTheme: AppTheme = {
//   id: "rose-quartz",
//   name: "Rose Quartz Light",
//   category: "glass",
//   tokens: {
//     surface_darkest: "#f4dde3",
//     surface_lowest: "#fbf3f5",
//     surface: "#fdf7f8",
//     surface_container_low: "#f8ecee",
//     surface_container: "#f3e2e6",
//     surface_container_high: "#eed7dc",
//     surface_container_highest: "#e6c9d0",
//     surface_bright: "#ffffff",
//     textPrimary: "#3c1626",
//     textSecondary: "#6e3a4d",
//     textTertiary: "#9c6b7c",
//     primary: "#b6467f",
//     primary_container: "#832457",
//     primary_fixed_dim: "#b6467f",
//     success: "#2f9e5c",
//     tertiary: "#d97706",
//     tertiary_container: "#b45309",
//     warning: "#d97706",
//     error: "#c22b3f",
//     error_container: "#ffd9de",
//     outline_variant: "#e0c3cb",
//     outline: "#9c6b7c",
//     shadow: "#000000",
//     ambient_shadow: "rgba(182, 70, 127, 0.12)",
//     overlay: "rgba(255, 255, 255, 0.4)",
//     blurTint: "light",
//     glassOpacity: 0.6,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#b6467f",
//     card: "#f3e2e6",
//     background: "#fdf7f8",
//   },
// };

// // ── 8. Cotton Frost Light (very light lavender-white, pastel glass)
// export const cottonFrostTheme: AppTheme = {
//   id: "cotton-frost",
//   name: "Cotton Frost",
//   category: "glass",
//   tokens: {
//     surface_darkest: "#e4e2f4",
//     surface_lowest: "#f5f4fc",
//     surface: "#f9f8fd",
//     surface_container_low: "#f1f0fa",
//     surface_container: "#ece9f8",
//     surface_container_high: "#e3e0f3",
//     surface_container_highest: "#d8d4ec",
//     surface_bright: "#ffffff",
//     textPrimary: "#221f36",
//     textSecondary: "#514c72",
//     textTertiary: "#857fa3",
//     primary: "#6c63ff",
//     primary_container: "#4b3df0",
//     primary_fixed_dim: "#6c63ff",
//     success: "#22b573",
//     tertiary: "#ff8bb0",
//     tertiary_container: "#e0568c",
//     warning: "#e0a022",
//     error: "#e5484d",
//     error_container: "#ffd9d9",
//     outline_variant: "#d5d1ea",
//     outline: "#857fa3",
//     shadow: "#000000",
//     ambient_shadow: "rgba(108, 99, 255, 0.12)",
//     overlay: "rgba(255, 255, 255, 0.4)",
//     blurTint: "light",
//     glassOpacity: 0.62,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#6c63ff",
//     card: "#ece9f8",
//     background: "#f9f8fd",
//   },
// };

// // ── 9. Liquid Silver (light, chrome/blue-grey glass, sapphire accent)
// export const liquidSilverTheme: AppTheme = {
//   id: "liquid-silver",
//   name: "Liquid Silver",
//   category: "glass",
//   tokens: {
//     surface_darkest: "#e3e7ee",
//     surface_lowest: "#f4f6fb",
//     surface: "#f8f9fc",
//     surface_container_low: "#eff1f6",
//     surface_container: "#e7eaf1",
//     surface_container_high: "#dde1ea",
//     surface_container_highest: "#d0d5e1",
//     surface_bright: "#ffffff",
//     textPrimary: "#10131c",
//     textSecondary: "#454b5c",
//     textTertiary: "#7a8091",
//     primary: "#3b6cf6",
//     primary_container: "#1d4ed8",
//     primary_fixed_dim: "#3b6cf6",
//     success: "#16a34a",
//     tertiary: "#fb923c",
//     tertiary_container: "#c2610f",
//     warning: "#d97706",
//     error: "#dc2626",
//     error_container: "#fde3e3",
//     outline_variant: "#ccd1de",
//     outline: "#7a8091",
//     shadow: "#000000",
//     ambient_shadow: "rgba(59, 108, 246, 0.12)",
//     overlay: "rgba(255, 255, 255, 0.35)",
//     blurTint: "light",
//     glassOpacity: 0.72,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#3b6cf6",
//     card: "#e7eaf1",
//     background: "#f8f9fc",
//   },
// };

// // ── 10. Emerald Noir (dark forest green/black, jade glass)
// export const emeraldNoirTheme: AppTheme = {
//   id: "emerald-noir",
//   name: "Emerald Noir",
//   category: "glass",
//   tokens: {
//     surface_darkest: "#060f0b",
//     surface_lowest: "#081410",
//     surface: "#0b1b15",
//     surface_container_low: "#10241c",
//     surface_container: "#142d23",
//     surface_container_high: "#1b3a2e",
//     surface_container_highest: "#22483a",
//     surface_bright: "#2a5645",
//     textPrimary: "#e6f5ee",
//     textSecondary: "#a9d3c0",
//     textTertiary: "#78a390",
//     primary: "#2ee6a6",
//     primary_container: "#0fa877",
//     primary_fixed_dim: "#2ee6a6",
//     success: "#34d399",
//     tertiary: "#ffd166",
//     tertiary_container: "#c99a1f",
//     warning: "#f4c04d",
//     error: "#ff8a80",
//     error_container: "#5c1414",
//     outline_variant: "#244438",
//     outline: "#78a390",
//     shadow: "#000000",
//     ambient_shadow: "rgba(46, 230, 166, 0.15)",
//     overlay: "rgba(0, 0, 0, 0.45)",
//     blurTint: "dark",
//     glassOpacity: 0.65,
//     spacingBase: 1,
//     radiusScale: 1,
//     borderWidth: 1,
//     useGradients: true,
//     accent: "#2ee6a6",
//     card: "#142d23",
//     background: "#0b1b15",
//   },
// };

// // ── 11. Structural Manifesto (Brutalist Light) — from your design doc
// export const structuralManifestoTheme: AppTheme = {
//   id: "structural-manifesto",
//   name: "Structural Manifesto",
//   category: "custom",
//   tokens: {
//     surface_darkest: "#dadada",
//     surface_lowest: "#ffffff",
//     surface: "#f9f9f9",
//     surface_container_low: "#f2f2f2",
//     surface_container: "#eeeeee",
//     surface_container_high: "#e8e8e8",
//     surface_container_highest: "#e2e2e2",
//     surface_bright: "#ffffff",
//     textPrimary: "#1a1c1c",
//     textSecondary: "#1a1c1c",
//     textTertiary: "#1a1c1c",
//     primary: "#106e00",
//     primary_container: "#39ff14",
//     primary_fixed_dim: "#39ff14",
//     success: "#106e00",
//     tertiary: "#39ff14",
//     tertiary_container: "#106e00",
//     warning: "#b45309",
//     error: "#ba1a1a",
//     error_container: "#ffd9d9",
//     outline_variant: "#1a1c1c",
//     outline: "#1a1c1c",
//     shadow: "#1a1c1c",
//     ambient_shadow: "rgba(0, 0, 0, 0)",
//     overlay: "rgba(255, 255, 255, 0.5)",
//     blurTint: "light",
//     glassOpacity: 0,
//     spacingBase: 1,
//     radiusScale: 0,
//     borderWidth: 5,
//     useGradients: false,
//     accent: "#39ff14",
//     card: "#eeeeee",
//     background: "#f9f9f9",
//   },
// };

// // ── 12. Sovereign Monolith (Brutalist Dark) — from your design doc
// export const sovereignMonolithTheme: AppTheme = {
//   id: "sovereign-monolith",
//   name: "Sovereign Monolith",
//   category: "custom",
//   tokens: {
//     surface_darkest: "#0e0e0e",
//     surface_lowest: "#0e0e0e",
//     surface: "#131313",
//     surface_container_low: "#1c1c1c",
//     surface_container: "#222222",
//     surface_container_high: "#2a2a2a",
//     surface_container_highest: "#353534",
//     surface_bright: "#454544",
//     textPrimary: "#e5e2e1",
//     textSecondary: "#b8b5b3",
//     textTertiary: "#86837f",
//     primary: "#ffb3ad",
//     primary_container: "#ff5451",
//     primary_fixed_dim: "#ffb3ad",
//     success: "#4caf6e",
//     tertiary: "#ff5451",
//     tertiary_container: "#68000a",
//     warning: "#e8a33d",
//     error: "#ff5451",
//     error_container: "#68000a",
//     outline_variant: "#e5e2e1",
//     outline: "#e5e2e1",
//     shadow: "#000000",
//     ambient_shadow: "rgba(0, 0, 0, 0)",
//     overlay: "rgba(0, 0, 0, 0.6)",
//     blurTint: "dark",
//     glassOpacity: 0,
//     spacingBase: 1,
//     radiusScale: 0,
//     borderWidth: 4,
//     useGradients: false,
//     accent: "#ffb3ad",
//     card: "#222222",
//     background: "#131313",
//   },
// };

// /**
//  * All available themes — Ocean Frost is the default/primary (index 0)
//  */
// export const allThemes: AppTheme[] = [
//   oceanFrostTheme,
//   midnightAmethystTheme,
//   auroraTealTheme,
//   sunsetCitrusTheme,
//   graphiteGoldTheme,
//   cyberNeonTheme,
//   roseQuartzTheme,
//   cottonFrostTheme,
//   liquidSilverTheme,
//   emeraldNoirTheme,
//   structuralManifestoTheme,
//   sovereignMonolithTheme,
// ];

// export const themeMap: Record<string, AppTheme> = Object.fromEntries(
//   allThemes.map((theme) => [theme.id, theme]),
// );

import type { AppTheme, ThemeTokens } from "./types";

type ThemePalette = {
  mode: "light" | "dark";

  background: string;
  backgroundSecondary: string;

  gradientStart: string;
  gradientEnd: string;

  blobs: [string, string, string];
  blobOpacity: number;

  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  surfaceSelected: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  primary: string;
  primaryPressed: string;
  primaryGradientEnd: string;

  success: string;
  warning: string;
  error: string;
  conflict: string;

  border: string;
  borderStrong: string;
  shadow: string;

  textOnPrimary?: string;

  glassBackground?: string;
  glassBackgroundStrong?: string;
  glassBorder?: string;
  glassHighlight?: string;
  glassBlur?: number;
};

function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");

  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red},${green},${blue},${alpha})`;
}

function createTokens(palette: ThemePalette): ThemeTokens {
  const isDark = palette.mode === "dark";
  const textOnPrimary = palette.textOnPrimary ?? "#FFFFFF";

  const glassBackground =
    palette.glassBackground ??
    (isDark ? withAlpha(palette.surface, 0.5) : "rgba(255,255,255,0.44)");

  const glassBackgroundStrong =
    palette.glassBackgroundStrong ??
    (isDark
      ? withAlpha(palette.surfaceElevated, 0.74)
      : "rgba(255,255,255,0.70)");

  const glassBorder =
    palette.glassBorder ??
    (isDark ? "rgba(230,240,255,0.16)" : "rgba(255,255,255,0.80)");

  const glassHighlight =
    palette.glassHighlight ??
    (isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.92)");

  const tokens = {
    mode: palette.mode,

    background: palette.background,
    backgroundSecondary: palette.backgroundSecondary,
    backgroundGradientStart: palette.gradientStart,
    backgroundGradientEnd: palette.gradientEnd,

    blobPrimary: palette.blobs[0],
    blobSecondary: palette.blobs[1],
    blobTertiary: palette.blobs[2],
    blobOpacity: palette.blobOpacity,

    surface: palette.surface,
    surfaceElevated: palette.surfaceElevated,
    surfaceMuted: palette.surfaceMuted,
    surfaceSelected: palette.surfaceSelected,
    surfacePressed: withAlpha(palette.primary, isDark ? 0.22 : 0.12),

    glassBackground,
    glassBackgroundStrong,
    glassBorder,
    glassHighlight,
    glassTint: isDark ? "dark" : "light",
    glassBlur: palette.glassBlur ?? 42,
    glassOpacity: 0.7,

    textPrimary: palette.textPrimary,
    textSecondary: palette.textSecondary,
    textTertiary: palette.textTertiary,
    textOnPrimary,
    textOnDanger: "#FFFFFF",

    iconPrimary: palette.textPrimary,
    iconSecondary: palette.textTertiary,
    iconOnPrimary: textOnPrimary,

    primary: palette.primary,
    primaryPressed: palette.primaryPressed,
    primarySoft: withAlpha(palette.primary, isDark ? 0.16 : 0.11),
    primaryGradientStart: palette.primary,
    primaryGradientEnd: palette.primaryGradientEnd,

    success: palette.success,
    successSoft: withAlpha(palette.success, 0.13),

    warning: palette.warning,
    warningSoft: withAlpha(palette.warning, 0.13),

    error: palette.error,
    errorSoft: withAlpha(palette.error, 0.13),

    conflict: palette.conflict,
    conflictSoft: withAlpha(palette.conflict, 0.13),

    border: palette.border,
    borderStrong: palette.borderStrong,
    divider: withAlpha(palette.textSecondary, 0.14),

    overlay: isDark ? "rgba(0,0,0,0.62)" : "rgba(18,29,45,0.36)",

    shadow: palette.shadow,

    ambientShadow: withAlpha(palette.primary, isDark ? 0.2 : 0.14),

    radiusSmall: 10,
    radiusMedium: 16,
    radiusLarge: 22,
    radiusXLarge: 28,
    radiusPill: 999,
  } satisfies Omit<
    ThemeTokens,
    | "surface_darkest"
    | "surface_lowest"
    | "surface_container_low"
    | "surface_container"
    | "surface_container_high"
    | "surface_container_highest"
    | "surface_bright"
    | "primary_container"
    | "primary_fixed_dim"
    | "tertiary"
    | "tertiary_container"
    | "error_container"
    | "outline_variant"
    | "outline"
    | "ambient_shadow"
    | "blurTint"
    | "spacingBase"
    | "radiusScale"
    | "borderWidth"
    | "useGradients"
    | "accent"
    | "card"
    | "gradientStart"
    | "gradientEnd"
    | "highlight"
    | "muted"
  >;

  return {
    ...tokens,

    // Temporary compatibility aliases.
    surface_darkest: tokens.background,
    surface_lowest: tokens.backgroundSecondary,
    surface_container_low: tokens.surfaceMuted,
    surface_container: tokens.surfaceElevated,
    surface_container_high: tokens.surfacePressed,
    surface_container_highest: tokens.surfaceSelected,

    surface_bright: isDark ? tokens.textPrimary : tokens.surfaceElevated,

    primary_container: tokens.primaryPressed,
    primary_fixed_dim: tokens.primary,

    tertiary: tokens.conflict,
    tertiary_container: tokens.conflict,

    error_container: tokens.errorSoft,

    outline_variant: tokens.border,
    outline: tokens.borderStrong,

    ambient_shadow: tokens.ambientShadow,

    blurTint: tokens.glassTint,
    spacingBase: 1,
    radiusScale: 1,
    borderWidth: 1,
    useGradients: true,

    accent: tokens.primary,
    card: tokens.surfaceElevated,

    gradientStart: tokens.primaryGradientStart,
    gradientEnd: tokens.primaryGradientEnd,

    highlight: tokens.primarySoft,
    muted: tokens.textTertiary,
  };
}

function createTheme(
  id: string,
  name: string,
  description: string,
  category: AppTheme["category"],
  palette: ThemePalette,
  isPremium = false,
): AppTheme {
  return {
    id,
    name,
    description,
    category,
    isPremium,
    tokens: createTokens(palette),
  };
}

export const liquidCobaltTheme = createTheme(
  "liquid-cobalt",
  "Liquid Cobalt",
  "Bright cobalt liquid glass inspired by modern productivity apps.",
  "premium",
  {
    mode: "light",

    background: "#F0F4F9",
    backgroundSecondary: "#E8EEFA",

    gradientStart: "#E0E7FF",
    gradientEnd: "#F6F8FC",

    blobs: ["#60A5FA", "#A5B4FC", "#67E8F9"],
    blobOpacity: 0.34,

    surface: "#F7F9FD",
    surfaceElevated: "#FFFFFF",
    surfaceMuted: "#EAF0F8",
    surfaceSelected: "#E3ECFF",

    textPrimary: "#1A1C1E",
    textSecondary: "#526070",
    textTertiary: "#8290A3",

    primary: "#0052FF",
    primaryPressed: "#003EC7",
    primaryGradientEnd: "#003EC7",

    success: "#079669",
    warning: "#C97900",
    error: "#D92D4A",
    conflict: "#E25555",

    border: "#D6DFEC",
    borderStrong: "#AEBED2",
    shadow: "#1F2687",
  },
  true,
);

export const midnightCobaltTheme = createTheme(
  "midnight-cobalt",
  "Midnight Cobalt",
  "Deep navy glass with crisp electric-blue highlights.",
  "developer",
  {
    mode: "dark",

    background: "#07101F",
    backgroundSecondary: "#0B1730",

    gradientStart: "#091327",
    gradientEnd: "#101B34",

    blobs: ["#075DFF", "#4338CA", "#0891B2"],
    blobOpacity: 0.26,

    surface: "#0D1930",
    surfaceElevated: "#13213B",
    surfaceMuted: "#101C33",
    surfaceSelected: "#17386D",

    textPrimary: "#EEF4FF",
    textSecondary: "#B6C5DE",
    textTertiary: "#7F91AE",

    primary: "#4F8CFF",
    primaryPressed: "#2868E8",
    primaryGradientEnd: "#164CCB",

    success: "#38D69C",
    warning: "#F2BD55",
    error: "#FF7288",
    conflict: "#FF8C6B",

    border: "#263B5D",
    borderStrong: "#47658F",
    shadow: "#000000",
  },
  true,
);

export const auroraTealTheme = createTheme(
  "aurora-teal",
  "Aurora Teal",
  "Calm dark glass with teal and mint aurora accents.",
  "premium",
  {
    mode: "dark",

    background: "#061713",
    backgroundSecondary: "#09231D",

    gradientStart: "#061B17",
    gradientEnd: "#0A2822",

    blobs: ["#14B8A6", "#34D399", "#22D3EE"],
    blobOpacity: 0.24,

    surface: "#0A211C",
    surfaceElevated: "#102E27",
    surfaceMuted: "#0D2721",
    surfaceSelected: "#15483C",

    textPrimary: "#E8FFF8",
    textSecondary: "#AFD8CC",
    textTertiary: "#79A99C",
    textOnPrimary: "#03251E",

    primary: "#4FE3C1",
    primaryPressed: "#18B994",
    primaryGradientEnd: "#0FA581",

    success: "#5BE59D",
    warning: "#F6C55A",
    error: "#FF7D88",
    conflict: "#FFA06B",

    border: "#23493F",
    borderStrong: "#477C6E",
    shadow: "#000000",
  },
  true,
);

export const graphiteVioletTheme = createTheme(
  "graphite-violet",
  "Graphite Violet",
  "Graphite glass with refined violet and magenta depth.",
  "developer",
  {
    mode: "dark",

    background: "#101015",
    backgroundSecondary: "#181720",

    gradientStart: "#111119",
    gradientEnd: "#1B1826",

    blobs: ["#7C3AED", "#C026D3", "#4F46E5"],
    blobOpacity: 0.22,

    surface: "#191820",
    surfaceElevated: "#23212C",
    surfaceMuted: "#1D1B25",
    surfaceSelected: "#382B55",

    textPrimary: "#F5F0FF",
    textSecondary: "#C9BDD8",
    textTertiary: "#9486A5",

    primary: "#A97BFF",
    primaryPressed: "#7C4DE4",
    primaryGradientEnd: "#7C3AED",

    success: "#54D89A",
    warning: "#F2BE62",
    error: "#FF7B93",
    conflict: "#F494C8",

    border: "#393444",
    borderStrong: "#625773",
    shadow: "#000000",
  },
  true,
);

export const emberNightTheme = createTheme(
  "ember-night",
  "Ember Night",
  "Warm dark glass with coral and amber energy.",
  "fun",
  {
    mode: "dark",

    background: "#18100E",
    backgroundSecondary: "#241613",

    gradientStart: "#1A100E",
    gradientEnd: "#2A1813",

    blobs: ["#F97316", "#FB7185", "#F59E0B"],
    blobOpacity: 0.22,

    surface: "#251816",
    surfaceElevated: "#31201C",
    surfaceMuted: "#2A1B18",
    surfaceSelected: "#553025",

    textPrimary: "#FFF3EC",
    textSecondary: "#DFC2B5",
    textTertiary: "#A98B7E",
    textOnPrimary: "#2F1008",

    primary: "#FF9A62",
    primaryPressed: "#E66D32",
    primaryGradientEnd: "#E95D2B",

    success: "#5DD69A",
    warning: "#F9C65C",
    error: "#FF7580",
    conflict: "#FFB15F",

    border: "#4C342D",
    borderStrong: "#775344",
    shadow: "#000000",
  },
  true,
);

export const oceanSignalTheme = createTheme(
  "ocean-signal",
  "Ocean Signal",
  "Deep ocean glass with sky-blue and aqua signals.",
  "developer",
  {
    mode: "dark",

    background: "#04151F",
    backgroundSecondary: "#072231",

    gradientStart: "#051722",
    gradientEnd: "#082B3D",

    blobs: ["#0284C7", "#06B6D4", "#38BDF8"],
    blobOpacity: 0.24,

    surface: "#082431",
    surfaceElevated: "#0D3040",
    surfaceMuted: "#0A2937",
    surfaceSelected: "#104A62",

    textPrimary: "#E9F9FF",
    textSecondary: "#AFD6E4",
    textTertiary: "#78A3B2",
    textOnPrimary: "#03222D",

    primary: "#67D5FF",
    primaryPressed: "#22A9DC",
    primaryGradientEnd: "#158AC1",

    success: "#52DAA0",
    warning: "#F1C65A",
    error: "#FF7D8F",
    conflict: "#FF9E70",

    border: "#244B5A",
    borderStrong: "#47788A",
    shadow: "#000000",
  },
  true,
);

export const frostedDaylightTheme = createTheme(
  "frosted-daylight",
  "Frosted Daylight",
  "Airy cool glass with soft cyan highlights.",
  "standard",
  {
    mode: "light",

    background: "#F4F8FB",
    backgroundSecondary: "#EAF4F8",

    gradientStart: "#E6F4FF",
    gradientEnd: "#F7FAFD",

    blobs: ["#7DD3FC", "#A5F3FC", "#C4B5FD"],
    blobOpacity: 0.28,

    surface: "#F9FCFE",
    surfaceElevated: "#FFFFFF",
    surfaceMuted: "#EAF2F6",
    surfaceSelected: "#DDF3FB",

    textPrimary: "#18303A",
    textSecondary: "#536E79",
    textTertiary: "#8198A1",

    primary: "#0789C8",
    primaryPressed: "#056899",
    primaryGradientEnd: "#0574B1",

    success: "#0A9668",
    warning: "#BC7800",
    error: "#D13D59",
    conflict: "#DD674E",

    border: "#D2E2E9",
    borderStrong: "#A8C0CB",
    shadow: "#315C6E",
  },
);

export const warmPaperTheme = createTheme(
  "warm-paper",
  "Warm Paper",
  "Warm cream glass with grounded terracotta accents.",
  "standard",
  {
    mode: "light",

    background: "#F7F1E8",
    backgroundSecondary: "#F1E7DA",

    gradientStart: "#F6E8DC",
    gradientEnd: "#FBF7F0",

    blobs: ["#FDBA74", "#FCA5A5", "#C4B5FD"],
    blobOpacity: 0.24,

    surface: "#FBF7F1",
    surfaceElevated: "#FFFDFC",
    surfaceMuted: "#F0E5D8",
    surfaceSelected: "#F7DDD0",

    textPrimary: "#38261F",
    textSecondary: "#73574A",
    textTertiary: "#9C8072",

    primary: "#C85E3C",
    primaryPressed: "#9F4428",
    primaryGradientEnd: "#B24C2E",

    success: "#3E8D5B",
    warning: "#B47716",
    error: "#C43B4E",
    conflict: "#D4713E",

    border: "#DDCFC2",
    borderStrong: "#BDA797",
    shadow: "#67483A",
  },
);

export const sageFocusTheme = createTheme(
  "sage-focus",
  "Sage Focus",
  "Calm sage glass with clean emerald focus states.",
  "standard",
  {
    mode: "light",

    background: "#EFF5F0",
    backgroundSecondary: "#E4EEE6",

    gradientStart: "#DFF2E5",
    gradientEnd: "#F6F9F6",

    blobs: ["#86EFAC", "#5EEAD4", "#BAE6FD"],
    blobOpacity: 0.25,

    surface: "#F6FAF7",
    surfaceElevated: "#FFFFFF",
    surfaceMuted: "#E4EEE6",
    surfaceSelected: "#D8EBDD",

    textPrimary: "#193129",
    textSecondary: "#506D61",
    textTertiary: "#7D978C",

    primary: "#16845C",
    primaryPressed: "#0E6645",
    primaryGradientEnd: "#0D704C",

    success: "#198754",
    warning: "#B07912",
    error: "#C43D50",
    conflict: "#D87445",

    border: "#CDDDD2",
    borderStrong: "#A6BDAE",
    shadow: "#315B49",
  },
);

export const roseQuartzTheme = createTheme(
  "rose-quartz",
  "Rose Quartz",
  "Soft neutral glass with rose and violet accents.",
  "fun",
  {
    mode: "light",

    background: "#F8F1F5",
    backgroundSecondary: "#F1E6EE",

    gradientStart: "#F7E4EE",
    gradientEnd: "#FAF7FA",

    blobs: ["#FDA4AF", "#C4B5FD", "#F9A8D4"],
    blobOpacity: 0.24,

    surface: "#FCF8FA",
    surfaceElevated: "#FFFFFF",
    surfaceMuted: "#F1E5EC",
    surfaceSelected: "#F2DCE8",

    textPrimary: "#3B2431",
    textSecondary: "#765468",
    textTertiary: "#A07C91",

    primary: "#B7447A",
    primaryPressed: "#8E2B5D",
    primaryGradientEnd: "#8B3FBE",

    success: "#388E61",
    warning: "#B67814",
    error: "#C73855",
    conflict: "#D56A55",

    border: "#E0CFD9",
    borderStrong: "#BEA8B5",
    shadow: "#6B4258",
  },
);

/**
 * Exactly ten built-in themes.
 */
export const allThemes: AppTheme[] = [
  liquidCobaltTheme,
  midnightCobaltTheme,
  auroraTealTheme,
  graphiteVioletTheme,
  emberNightTheme,
  oceanSignalTheme,
  frostedDaylightTheme,
  warmPaperTheme,
  sageFocusTheme,
  roseQuartzTheme,
];

export const themeMap: Record<string, AppTheme> = Object.fromEntries(
  allThemes.map((theme) => [theme.id, theme]),
);

export const defaultTheme = liquidCobaltTheme;
export const darkTheme = midnightCobaltTheme;

/**
 * Temporary alias retained until old imports are removed.
 */
export const oceanFrostTheme = oceanSignalTheme;
