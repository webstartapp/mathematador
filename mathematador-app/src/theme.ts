// Single source of truth for this app's shared visual language - colors,
// spacing, radii, typography and text shadows, plus composed "usage"
// styles built from them (a wood-textured card, a frosted overlay panel,
// gold-accent text, etc). Organized by what a style is FOR, not by which
// screen/component happens to use it today - multiple unrelated screens
// reach for the same "wood card" or "frosted overlay" look independently.
// Nothing in this file is wired into any screen yet; screens/components
// migrate to import from here one at a time (see issue #78).
import { StyleSheet } from "react-native";

import { createTextShadow } from "@/helpers/createTextShadow";

// The tan/gold "wood" ramp: the exercise-digit / draggable-keyboard tile
// look and CenteredDesk's big card look both come from this same palette,
// previously re-typed independently (with inconsistent casing) in four
// separate files.
export const colors = {
  wood: {
    base: "#d49b57",
    light: "#E4Ab67",
    border: "#B47b37",
    dark: "#744b17",
    highlight: "#e8b06f",
  },
  gold: "#FFD700",
  magenta: "#E6007A",
  white: "#fff",
  nearBlack: "#1a1a1a",
  danger: "#FF3B30",
  success: "#4CD964",
  cyan: "#00FFFF",
  // The recurring white-on-dark "frosted card" backgrounds. subtle unifies
  // what were two near-identical drifted values (0.05 and 0.06) into one.
  overlay: {
    subtle: "rgba(255, 255, 255, 0.05)",
    medium: "rgba(255, 255, 255, 0.1)",
    strong: "rgba(255, 255, 255, 0.15)",
  },
  // The drop-shadow color under those same cards - not a border color,
  // despite living near the overlay family (easy to conflate the two).
  shadowDark: "rgba(0, 0, 0, 0.15)",
} as const;

// Covers the real spacing values found across the app; the rarer odd ones
// (5, 6, 10, 14, 15, 25, 30) snap to their nearest neighbor during
// migration rather than each keeping its own one-off step.
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 50,
} as const;

// Same snapping approach for the rare one-offs (3 -> xs, 10 -> sm,
// 21 -> xl, 30 -> xxl).
export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 25,
  pill: 50,
} as const;

export const typography = {
  size: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
    xxxl: 24,
    display: 28,
    hero: 32,
  },
  // Numeric strings, not the "bold" keyword - React Native already treats
  // "bold" as equivalent to weight 700 under the hood, so mapping every
  // existing "bold" literal to "700" is a zero-visual-risk normalization
  // that also matches RN's own FontWeight type.
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    black: "900",
  },
} as const;

// The de facto standard - six files independently declared this exact
// call before this file existed. `soft` is ComboPopup's one deliberate
// outlier (a softer, more diffuse glow for its animated popup text).
export const textShadows = {
  standard: createTextShadow("black", 2, 2, 5),
  soft: createTextShadow("rgba(0, 0, 0, 0.75)", -1, 1, 10),
};

// Spread this directly (`...cardTextShadow`), matching how every existing
// call site already uses its own local copy of the same value.
export const cardTextShadow = textShadows.standard;

// Composed, ready-to-spread styles built from the primitives above -
// still a good idea to override structural props per call site (radius,
// width, etc) but the color/shadow identity comes from here.
export const usageStyles = StyleSheet.create({
  // CenteredDesk's big card chrome.
  woodPanel: {
    backgroundColor: colors.wood.base,
    borderColor: colors.wood.light,
    borderWidth: 5,
    borderRadius: radii.sm,
    boxShadow: [
      { offsetX: 2, offsetY: 2, blurRadius: 0, color: colors.wood.border },
    ],
  },
  // The small interactive digit-tile variant (draggable keyboard, exercise
  // digits) - same palette, smaller radius, no card-level shadow.
  woodTile: {
    backgroundColor: colors.wood.base,
    borderColor: colors.wood.light,
    borderWidth: 5,
    borderRadius: radii.xs,
  },
  overlayCardSubtle: {
    backgroundColor: colors.overlay.subtle,
    borderWidth: 1,
    borderColor: colors.overlay.medium,
    borderRadius: radii.lg,
  },
  overlayCardMedium: {
    backgroundColor: colors.overlay.medium,
    borderRadius: radii.lg,
  },
  overlayCardStrong: {
    backgroundColor: colors.overlay.strong,
    borderRadius: radii.lg,
  },
  // The soft drop shadow under a frosted overlay card (TiendaScreen's shop
  // cards, e.g.) - a separate composed piece since not every overlay card
  // wants it (e.g. small pill buttons don't).
  cardDropShadow: {
    boxShadow: [
      { offsetX: 0, offsetY: 4, blurRadius: 10, color: colors.shadowDark },
    ],
  },
  goldButton: {
    backgroundColor: colors.gold,
  },
  goldButtonText: {
    color: colors.nearBlack,
    fontWeight: typography.weight.bold,
  },
  // Gold-colored value/label text that ISN'T sitting on a gold button
  // background (combo popup, prices, stat values).
  goldText: {
    color: colors.gold,
    fontWeight: typography.weight.bold,
  },
  dangerText: {
    color: colors.danger,
  },
  successText: {
    color: colors.success,
  },
});
