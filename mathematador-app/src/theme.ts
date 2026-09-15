/* eslint-disable max-lines */
// Single source of truth for every style in mathematador-app - colors,
// spacing, radii, typography, text shadows, composed "usage" styles
// shared across otherwise-unrelated screens (a wood-textured card, a
// frosted overlay panel, gold-accent text), and every remaining
// screen/component-specific StyleSheet.create() call, namespaced by file
// below. eslint.config.js enforces this: StyleSheet.create() is banned
// in every other .tsx file in this workspace (see the "Single shared
// stylesheet" block there), so this is the only place a new style can be
// added - either as a new shared usage-style if the look recurs, or as a
// new namespaced entry in the per-file section below if it doesn't.
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
  // The auth/consent gates' card width - identical in both.
  screenCardSm: {
    maxWidth: 420,
    padding: spacing.xl,
  },
  // The settings/history screens' card width - identical in both.
  screenCardMd: {
    maxWidth: 480,
    padding: spacing.xl,
  },
  // Tienda's and Gauntlet's scrollable content padding - identical in both.
  scrollContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  // A layer that fills its parent completely - the intro video and the
  // info-page background image both want exactly this.
  fullBleed: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  // Tienda's and Gauntlet's top header bar - identical in both (unlike
  // ChallengeGameScreen's topBar, which has no back button and a
  // different, timer-focused layout, so isn't merged in here).
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 15,
    paddingBottom: spacing.sm,
    width: "100%",
  },
  // The round back button in that same header - identical in both.
  headerBackButton: {
    padding: spacing.sm,
    backgroundColor: colors.overlay.medium,
    borderRadius: radii.xl,
  },
});

// Per-file styles below - nothing here recurs elsewhere, so each stays
// namespaced to the one file that uses it rather than joining the shared
// usageStyles above.

export const notFoundScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
  },
});

export const adminScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
    color: colors.nearBlack,
  },
  body: {
    fontSize: typography.size.md,
    color: "#555",
    textAlign: "center",
  },
});

export const layoutStyles = StyleSheet.create({
  scroller: usageStyles.fullBleed,
  container: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  fixed: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
});

export const exerciseStyles = StyleSheet.create({
  exerciseWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  exercisePreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    userSelect: "none",
    flexWrap: "wrap",
  },
  exerciseValues: {
    flexDirection: "row",
    alignItems: "center",
    userSelect: "none",
  },
  exerciseValue: {
    flexDirection: "row",
    alignItems: "center",
    userSelect: "none",
  },
});

export const halvingLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  upper: {
    alignItems: "center",
    justifyContent: "center",
  },
  lower: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

export const exerciseValueDropDigitsStyles = StyleSheet.create({
  resultValue: {
    marginLeft: spacing.sm,
  },
});

export const exerciseValuePreviewStyles = StyleSheet.create({
  numberContainer: {
    flexDirection: "row",
  },
});

export const comboRewardBurstStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  particle: {
    position: "absolute",
    top: 0,
    fontSize: 26,
  },
});

export const googleSignInButtonStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
});

export const helloWaveStyles = StyleSheet.create({
  text: {
    fontSize: typography.size.display,
    lineHeight: 32,
    marginTop: -6,
  },
});

export const parallaxScrollViewStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 250,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: spacing.xxxl,
    gap: spacing.lg,
    overflow: "hidden",
  },
});

export const operationSelectionScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  header: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  grid: {
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "flex-start",
    flexDirection: "row",
  },
  operationButton: {
    width: "100%",
    maxWidth: 400,
    minWidth: 200,
  },
  operationLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: "#333",
  },
  operationSymbol: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    color: "#333",
  },
  operationDescription: {
    fontSize: typography.size.base,
    color: "#333",
  },
});

export const chalengeSelectScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  subTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  currentChallengeContainer: {
    marginBottom: spacing.xxl,
    marginTop: spacing.xxl,
  },
  challengeBoxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    flexBasis: "100%",
    flexGrow: 1,
  },
  challengeText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  challengeBox: {
    flex: 1,
    marginBottom: spacing.xl,
    borderRadius: radii.sm,
    minWidth: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

export const challengeResultScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
});

export const animatedImageStyles = StyleSheet.create({
  backgroundImage: {
    position: "absolute",
    // Oversized so the scale/translate wobble never exposes the container's
    // edges. An absolutely-positioned child isn't reliably centered by the
    // parent's flex alignment alone (confirmed live: without these
    // offsets, the image drifted almost entirely below the visible area,
    // leaving only a sliver visible at the bottom) - top/left explicitly
    // center the oversized box: -(120%-100%)/2 and -(110%-100%)/2.
    top: "-5%",
    left: "-10%",
    width: "120%",
    height: "110%",
  },
  container: {
    display: "flex",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  childrenWrapper: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    // Was a semi-transparent white scrim, but the only screens using this
    // background (Home, Auth) put their text inside an opaque card
    // (CenteredDesk), never directly over the image - so it only ever
    // washed the image out once it became visible (see index.tsx's
    // transparentNavigationTheme fix).
    backgroundColor: "transparent",
    display: "flex",
    flex: 1,
    alignContent: "center",
    padding: 0,
    margin: 0,
  },
});

export const centeredDeskStyles = StyleSheet.create({
  container: {
    ...usageStyles.woodPanel,
    color: colors.white,
    width: "100%",
  },
  wrapper: {},
  title: {
    fontSize: typography.size.hero,
    marginBottom: spacing.sm,
    color: colors.white,
    ...cardTextShadow,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.xxxl,
    marginBottom: spacing.xxs,
    color: colors.white,
    ...cardTextShadow,
    textAlign: "center",
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },
  description: {
    fontSize: typography.size.lg,
    marginBottom: spacing.xxs,
    color: colors.white,
    ...cardTextShadow,
    textAlign: "justify",
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },
});

export const draggableKeyboardStyles = StyleSheet.create({
  draggableWrapper: {
    ...usageStyles.woodTile,
    borderColor: colors.wood.dark,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
  },
  keyboardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: "100%",
    height: "100%",
    gap: 0,
  },
});

export const draggableKeyboardDigitStyles = StyleSheet.create({
  draggable: {
    userSelect: "none",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  draggableItem: {
    backgroundColor: colors.wood.base,
    borderRadius: radii.pill,
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedDraggableItem: {
    borderColor: colors.gold,
    backgroundColor: colors.wood.highlight,
  },
  draggableText: {
    color: colors.white,
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
  },
});

export const exerciseDigitStyles = StyleSheet.create({
  unknownDigitContainer: {
    ...usageStyles.woodTile,
    borderColor: colors.white,
    backgroundColor: colors.wood.dark,
    padding: spacing.xs,
    margin: spacing.xxs,
    minWidth: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  digitContainer: {
    ...usageStyles.woodTile,
    padding: spacing.xs,
    margin: spacing.xxs,
    minWidth: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  targetableDigitContainer: {
    borderColor: colors.gold,
  },
  unknownDigit: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.white,
  },
  digit: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.white,
  },
});

export const settingToggleRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.wood.border,
    paddingVertical: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    textAlign: "left",
    ...cardTextShadow,
  },
  description: {
    color: colors.white,
    marginTop: spacing.xs,
    ...cardTextShadow,
  },
});

export const settingHistoryRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.wood.border,
    paddingVertical: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    textAlign: "left",
    ...cardTextShadow,
  },
  date: {
    color: colors.white,
    fontSize: typography.size.sm,
    marginTop: spacing.xs,
    ...cardTextShadow,
  },
  device: {
    color: colors.white,
    fontSize: typography.size.xs,
    marginTop: spacing.xxs,
    ...cardTextShadow,
  },
  value: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
    ...cardTextShadow,
  },
});

export const settingsScreenStyles = StyleSheet.create({
  card: usageStyles.screenCardMd,
  sectionLabel: {
    color: colors.white,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
    alignSelf: "flex-start",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    ...cardTextShadow,
  },
  historyButton: {
    ...usageStyles.goldButton,
    marginTop: spacing.lg,
  },
  historyButtonText: usageStyles.goldButtonText,
});

export const settingsHistoryScreenStyles = StyleSheet.create({
  card: usageStyles.screenCardMd,
  // Layout.tsx's own outer ScrollView constrains its content container to
  // height: "100%" rather than letting it grow, so it can't scroll content
  // taller than the viewport on its own (TiendaScreen works around the same
  // limitation with its own nested ScrollView) - bounded so a long history
  // list scrolls internally instead of clipping rows or pushing the Back
  // button off-screen.
  historyList: {
    maxHeight: 400,
    width: "100%",
  },
  historyListContent: {
    paddingBottom: spacing.sm,
  },
  loadMoreButton: {
    marginTop: spacing.xs,
  },
  loader: {
    marginVertical: spacing.xxxl,
  },
  message: {
    textAlign: "center",
    marginVertical: spacing.xxl,
    ...cardTextShadow,
  },
});

export const infoPageStyles = StyleSheet.create({
  background: usageStyles.fullBleed,
  scrollContent: {
    alignItems: "center",
    padding: spacing.xxl,
  },
  card: {
    maxWidth: 720,
    padding: spacing.xl,
    marginVertical: spacing.huge,
  },
  description: {
    textAlign: "center",
    ...cardTextShadow,
  },
  updatedAt: {
    color: colors.white,
    fontSize: typography.size.sm,
    fontStyle: "italic",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    ...cardTextShadow,
  },
});

// react-native-markdown-display consumes this as a plain object, never
// through StyleSheet.create - it walks ancestor styles itself and expects
// raw style values, not RN's opaque registered-style ids.
export const infoPageMarkdownStyles = {
  body: {
    color: colors.white,
    fontSize: typography.size.md,
    lineHeight: 24,
    textShadowColor: "black",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  heading1: {
    fontSize: typography.size.xxl,
    marginTop: 18,
    marginBottom: spacing.sm,
  },
  heading2: {
    fontSize: typography.size.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading3: { fontSize: typography.size.lg, marginTop: 14, marginBottom: 6 },
  strong: { fontWeight: "bold" as const },
  em: { fontStyle: "italic" as const },
  link: { textDecorationLine: "underline" as const },
  hr: { backgroundColor: colors.wood.border },
  table: { borderColor: colors.wood.border },
  thead: { borderColor: colors.wood.border },
  tr: { borderColor: colors.wood.border },
  th: { borderColor: colors.wood.border },
  td: { borderColor: colors.wood.border },
  blockquote: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderColor: colors.wood.border,
  },
  code_inline: { color: colors.nearBlack },
  code_block: { color: colors.nearBlack },
  fence: { color: colors.nearBlack },
};

export const authScreenStyles = StyleSheet.create({
  card: usageStyles.screenCardSm,
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.white,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: colors.wood.dark,
    paddingVertical: 14,
    borderRadius: radii.xxl,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.md,
  },
  linkText: {
    color: colors.white,
    textAlign: "center",
    marginTop: spacing.lg,
    textDecorationLine: "underline",
  },
  dividerText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});

export const consentScreenStyles = StyleSheet.create({
  card: usageStyles.screenCardSm,
  acceptButton: {
    backgroundColor: colors.wood.dark,
    paddingVertical: 14,
    borderRadius: radii.xxl,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.md,
  },
  declineLink: {
    color: colors.white,
    textAlign: "center",
    marginTop: spacing.lg,
    textDecorationLine: "underline",
  },
  declineText: {
    color: colors.danger,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
});

export const introScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: usageStyles.fullBleed,
  skipButton: {
    position: "absolute",
    bottom: spacing.huge,
    right: spacing.xxl,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: radii.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  skipText: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.md,
  },
});

export const comboMeterStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  label: {
    color: "#FFB347",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.overlay.medium,
  },
});

export const comboPopupStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 150,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  text: {
    ...usageStyles.goldText,
    fontSize: 30,
    fontWeight: typography.weight.black,
    ...textShadows.soft,
  },
});

export const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: colors.wood.dark,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xxl,
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  text: {},
});

// ThemedText's variant map - the closest thing to a typography-variant
// abstraction in this codebase. Exported already StyleSheet.create()'d
// (not raw objects) so ThemedText.tsx itself never needs its own
// StyleSheet.create call, and `keyof typeof themedTextVariants` there
// still gives it the same variant-name type safety it always had.
export const themedTextVariants = StyleSheet.create({
  title: {
    color: colors.white,
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  subtitle: {
    color: colors.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  description: {
    color: "#333",
    fontSize: typography.size.base,
  },
});

export const animatedNumberStyles = StyleSheet.create({
  whiteText: {
    color: colors.white,
  },
});

export const policyLinksStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: spacing.md,
    rowGap: spacing.xs,
    marginBottom: spacing.lg,
  },
  link: {
    color: colors.white,
    fontSize: typography.size.base,
    textDecorationLine: "underline",
  },
});

export const mathChallengeStyles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: "center",
  },
  question: {
    fontSize: typography.size.xxxl,
    marginBottom: spacing.lg,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radii.sm,
    padding: spacing.sm,
    fontSize: typography.size.lg,
    textAlign: "center",
  },
});

export const gauntletScreenStyles = StyleSheet.create({
  header: usageStyles.screenHeader,
  backBtn: usageStyles.headerBackButton,
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.white,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },
  scrollContainer: usageStyles.scrollContainer,
  glassPanel: {
    ...usageStyles.overlayCardSubtle,
    ...usageStyles.cardDropShadow,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  loadoutGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loadoutItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    marginHorizontal: spacing.xs,
  },
  loadoutLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginBottom: 4,
  },
  loadoutValue: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  activeCosmetic: {
    color: colors.gold,
  },
  modeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  modeTitle: {
    color: colors.white,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  modeSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    marginTop: 2,
  },
  rulesText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: typography.size.sm,
    marginVertical: spacing.sm,
  },
  startButton: {
    ...usageStyles.goldButton,
    paddingVertical: spacing.md,
    borderRadius: radii.xxl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  startButtonText: {
    ...usageStyles.goldButtonText,
    fontSize: typography.size.base,
    letterSpacing: 1,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.overlay.subtle,
  },
  rank: {
    width: 30,
    fontSize: typography.size.md,
    color: colors.white,
    fontWeight: typography.weight.bold,
  },
  player: {
    flex: 1,
    color: colors.white,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  score: {
    color: colors.gold,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  myRow: {
    backgroundColor: colors.overlay.subtle,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 0,
  },
});

export const tiendaScreenStyles = StyleSheet.create({
  header: usageStyles.screenHeader,
  backBtn: usageStyles.headerBackButton,
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.white,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },
  coinsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radii.xl,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    boxShadow: [
      { offsetX: 0, offsetY: 0, blurRadius: 5, color: "rgba(255,215,0,0.3)" },
    ],
  },
  coinsEmoji: {
    fontSize: typography.size.lg,
    marginRight: 4,
  },
  coinsCount: {
    color: colors.gold,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.md,
  },
  tabBar: {
    flexDirection: "row",
    ...usageStyles.overlayCardSubtle,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.sm,
    borderRadius: radii.xxl,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radii.xl,
  },
  tabActive: {
    backgroundColor: colors.overlay.strong,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 3,
        color: "rgba(255,255,255,0.1)",
      },
    ],
  },
  tabText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.sm,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: colors.white,
  },
  scrollContainer: usageStyles.scrollContainer,
  loader: {
    marginTop: spacing.giant,
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    marginTop: spacing.giant,
    fontSize: typography.size.md,
  },
  card: {
    ...usageStyles.overlayCardSubtle,
    ...usageStyles.cardDropShadow,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardEquipped: {
    borderColor: colors.gold,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    boxShadow: [
      { offsetX: 0, offsetY: 4, blurRadius: 8, color: "rgba(255,215,0,0.1)" },
    ],
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlay.subtle,
  },
  cardInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  cardTitle: {
    color: colors.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  lockText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 4,
    fontWeight: typography.weight.medium,
  },
  unlockedText: {
    color: colors.success,
    fontSize: 13,
    marginTop: 4,
    fontWeight: typography.weight.medium,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: spacing.md,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinSymbol: {
    fontSize: typography.size.lg,
    marginRight: 4,
  },
  priceText: {
    color: colors.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  btnBuy: usageStyles.goldButton,
  btnEquip: {
    backgroundColor: colors.overlay.strong,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  btnEquipped: {
    backgroundColor: colors.success,
  },
  btnDisabled: {
    backgroundColor: colors.overlay.subtle,
    borderColor: colors.overlay.subtle,
  },
  btnText: {
    ...usageStyles.goldButtonText,
    fontSize: typography.size.base,
  },
});

export const challengeGameScreenStyles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 15,
    paddingBottom: spacing.sm,
    width: "100%",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    ...usageStyles.overlayCardMedium,
    borderRadius: radii.xl,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  timerText: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    marginLeft: 6,
    fontSize: typography.size.md,
  },
  frozenText: {
    color: colors.cyan,
  },
  lowTimeText: {
    color: colors.danger,
  },
  inspirationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
  inspirationText: {
    color: colors.gold,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    marginLeft: 4,
  },
  toroPanel: {
    ...usageStyles.overlayCardSubtle,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.sm,
    borderRadius: radii.lg,
    padding: 14,
  },
  inspiredPanel: {
    borderColor: colors.gold,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
  },
  toroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  toroEmoji: {
    fontSize: typography.size.hero,
  },
  toroTitle: {
    color: colors.white,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    marginBottom: 4,
  },
  coopBar: {
    height: spacing.xs,
    borderRadius: radii.xs,
    backgroundColor: colors.overlay.medium,
  },
  toroActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toroBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay.strong,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    marginHorizontal: spacing.xs,
  },
  toroBtnDisabled: {
    opacity: 0.4,
  },
  toroBtnText: {
    color: colors.white,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    marginLeft: 6,
  },
  gameContainer: {
    flex: 1,
    paddingTop: spacing.sm,
  },
});

// GameHeader's own light-theme palette (white bar, dark text) is
// deliberately distinct from the rest of the app's dark/wood aesthetic -
// none of these colors match any shared token, so they stay literal here
// rather than forcing new tokens into existence for a one-off style.
export const gameHeaderStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  statsContainer: { flex: 1, paddingHorizontal: spacing.md },
  level: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: "#333",
  },
  progressBar: { height: 6, borderRadius: 3, marginVertical: spacing.xs },
  xpText: { fontSize: typography.size.sm, color: "#666" },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 60,
  },
});
