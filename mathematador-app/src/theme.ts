/* eslint-disable max-lines */
// Single source of truth for every style in mathematador-app. `styles` is
// the one flat exported stylesheet - every key lives directly on it (no
// per-screen/per-component nesting), so two unrelated screens that happen
// to both want a "card" or a "title" get distinctly-named flat keys
// (settingsCard vs authCard) rather than two same-named keys buried in
// two different nested objects. `colors`/`spacing`/`radii`/`typography`/
// `textShadows` stay separate: they're raw design tokens consumed inline
// (e.g. an Ionicons `color` prop), not styles themselves.
// eslint.config.js enforces this: StyleSheet.create() is banned in every
// other .tsx file in this workspace (see its "Single shared stylesheet"
// block), so a new style has nowhere to go but a new flat key here.
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
// (5, 6, 10, 14, 15, 25, 30) snap to their nearest neighbor rather than
// each keeping its own one-off step.
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

// Not exported - a brevity alias used only while building the styles
// below (nothing outside this file needs the fragment on its own).
const cardTextShadow = textShadows.standard;

// react-native-markdown-display consumes this as a plain object with a
// fixed, library-dictated shape (body/heading1/.../fence) - never through
// StyleSheet.create, and its keys can't be renamed to fit the flat
// `styles` object below without info/[slug].tsx reconstructing that exact
// shape at the call site anyway. Kept as its own small export for that
// reason, not because it's exempt from the "one stylesheet" rule in spirit.
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

// The one flat stylesheet - every key below is a direct, top-level key on
// this single object. Shared cross-screen patterns come first (reused by
// more than one screen/component); everything after is prefixed by the
// screen/component it belongs to, so same-shaped concepts ("a card", "a
// title") never collide across unrelated screens.
export const styles = StyleSheet.create({
  // ---- Shared across multiple screens/components ----
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
  // The soft drop shadow under a frosted overlay card (Tienda's shop
  // cards, e.g.) - separate since not every overlay card wants it.
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
    paddingBottom: spacing.huge,
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

  // ---- app/+not-found.tsx ----
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  notFoundLink: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
  },

  // ---- app/admin/index.tsx ----
  adminContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    backgroundColor: colors.white,
  },
  adminTitle: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
    color: colors.nearBlack,
  },
  adminBody: {
    fontSize: typography.size.md,
    color: "#555",
    textAlign: "center",
  },

  // ---- components/common/Layout.tsx ----
  layoutScroller: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  layoutContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  layoutFixed: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },

  // ---- components/minigames/components/Exercise.tsx ----
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

  // ---- components/minigames/components/HalvingLayout.tsx ----
  halvingContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  halvingUpper: {
    alignItems: "center",
    justifyContent: "center",
  },
  halvingLower: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  // ---- components/minigames/components/ExerciseValueDropDigits.tsx ----
  exerciseDropResultValue: {
    marginLeft: spacing.sm,
  },

  // ---- components/minigames/components/ExerciseValuePreview.tsx ----
  valuePreviewNumberContainer: {
    flexDirection: "row",
  },

  // ---- components/toro/ComboRewardBurst.tsx ----
  comboBurstOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  comboBurstParticle: {
    position: "absolute",
    top: 0,
    fontSize: 26,
  },

  // ---- components/auth/GoogleSignInButton.tsx ----
  googleSignInContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  // ---- components/HelloWave.tsx ----
  helloWaveText: {
    fontSize: typography.size.display,
    lineHeight: 32,
    marginTop: -6,
  },

  // ---- components/ParallaxScrollView.tsx ----
  parallaxContainer: {
    flex: 1,
  },
  parallaxHeader: {
    height: 250,
    overflow: "hidden",
  },
  parallaxContent: {
    flex: 1,
    padding: spacing.xxxl,
    gap: spacing.lg,
    overflow: "hidden",
  },

  // ---- screens/OperationSelectionScreen.tsx ----
  opSelectContainer: {
    flex: 1,
    width: "100%",
  },
  opSelectHeader: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  opSelectGrid: {
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "flex-start",
    flexDirection: "row",
  },
  opSelectButton: {
    width: "100%",
    maxWidth: 400,
    minWidth: 200,
  },
  opSelectLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: "#333",
  },
  opSelectSymbol: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    color: "#333",
  },
  opSelectDescription: {
    fontSize: typography.size.base,
    color: "#333",
  },

  // ---- screens/ChalengeSelectScreen.tsx ----
  chalengeSelectContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  chalengeSelectTitle: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  chalengeSelectSubTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  chalengeSelectCurrentContainer: {
    marginBottom: spacing.xxl,
    marginTop: spacing.xxl,
  },
  chalengeSelectBoxContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    flexBasis: "100%",
    flexGrow: 1,
  },
  chalengeSelectText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  chalengeSelectBox: {
    flex: 1,
    marginBottom: spacing.xl,
    borderRadius: radii.sm,
    minWidth: 200,
    justifyContent: "center",
    alignItems: "center",
  },

  // ---- screens/ChallengeResultScreen.tsx ----
  challengeResultContainer: {
    flex: 1,
    padding: spacing.lg,
  },

  // ---- providers/animations/AnimatedImage.tsx ----
  animatedImageBackground: {
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
  animatedImageContainer: {
    display: "flex",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  animatedImageChildrenWrapper: {
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

  // ---- components/layouts/CenteredDesk.tsx ----
  // No separate "container" key here - it's styles.woodPanel plus two
  // small overrides, composed directly at the call site instead of
  // duplicating woodPanel's fields under a near-identical new name.
  centeredDeskWrapper: {},
  centeredDeskTitle: {
    fontSize: typography.size.hero,
    marginBottom: spacing.sm,
    color: colors.white,
    ...cardTextShadow,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },
  centeredDeskSubtitle: {
    fontSize: typography.size.xxxl,
    marginBottom: spacing.xs,
    color: colors.white,
    ...cardTextShadow,
    textAlign: "center",
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },
  centeredDeskDescription: {
    fontSize: typography.size.lg,
    marginBottom: spacing.xs,
    color: colors.white,
    ...cardTextShadow,
    textAlign: "justify",
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
  },

  // ---- components/minigames/components/DraggableKeyboard.tsx ----
  draggableKeyboardWrapper: {
    backgroundColor: colors.wood.base,
    borderColor: colors.wood.dark,
    borderWidth: 5,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
  },
  draggableKeyboardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: "100%",
    height: "100%",
    gap: 0,
  },

  // ---- components/minigames/components/DraggableKeyboardDigit.tsx ----
  draggableDigitWrapper: {
    userSelect: "none",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  draggableDigitItem: {
    backgroundColor: colors.wood.base,
    borderRadius: radii.pill,
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
    borderWidth: 3,
    borderColor: "transparent",
  },
  draggableDigitSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.wood.highlight,
  },
  draggableDigitText: {
    color: colors.white,
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
  },

  // ---- components/minigames/components/ExerciseDigit.tsx ----
  exerciseDigitUnknownContainer: {
    backgroundColor: colors.wood.dark,
    borderColor: colors.white,
    borderWidth: 5,
    borderRadius: radii.xs,
    padding: spacing.xs,
    margin: spacing.xxs,
    minWidth: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseDigitContainer: {
    backgroundColor: colors.wood.base,
    borderColor: colors.wood.light,
    borderWidth: 5,
    borderRadius: radii.xs,
    padding: spacing.xs,
    margin: spacing.xxs,
    minWidth: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseDigitTargetable: {
    borderColor: colors.gold,
  },
  exerciseDigitUnknownText: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.white,
  },
  exerciseDigitText: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.white,
  },

  // ---- components/common/SettingToggleRow.tsx ----
  settingToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.wood.border,
    paddingVertical: spacing.md,
  },
  settingToggleTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingToggleLabel: {
    textAlign: "left",
    ...cardTextShadow,
  },
  settingToggleDescription: {
    color: colors.white,
    marginTop: spacing.xs,
    ...cardTextShadow,
  },

  // ---- components/common/SettingHistoryRow.tsx ----
  settingHistoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: colors.wood.border,
    paddingVertical: spacing.md,
  },
  settingHistoryTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingHistoryLabel: {
    textAlign: "left",
    ...cardTextShadow,
  },
  settingHistoryDate: {
    color: colors.white,
    fontSize: typography.size.sm,
    marginTop: spacing.xs,
    ...cardTextShadow,
  },
  settingHistoryDevice: {
    color: colors.white,
    fontSize: typography.size.xs,
    marginTop: spacing.xxs,
    ...cardTextShadow,
  },
  settingHistoryValue: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
    ...cardTextShadow,
  },

  // ---- screens/SettingsScreen.tsx ----
  settingsCard: {
    maxWidth: 480,
    padding: spacing.xl,
  },
  settingsSectionLabel: {
    color: colors.white,
    // Not typography.size.sm (12) - this is a distinct 13px value shared
    // with info page's updatedAt below, not close enough to any step in
    // the scale to snap without a visible 1px shrink.
    fontSize: 13,
    fontWeight: typography.weight.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
    alignSelf: "flex-start",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    ...cardTextShadow,
  },
  settingsHistoryButton: {
    backgroundColor: colors.gold,
    marginTop: spacing.lg,
  },
  settingsHistoryButtonText: {
    color: colors.nearBlack,
    fontWeight: typography.weight.bold,
  },

  // ---- screens/SettingsHistoryScreen.tsx ----
  settingsHistoryCard: {
    maxWidth: 480,
    padding: spacing.xl,
  },
  // Layout.tsx's own outer ScrollView constrains its content container to
  // height: "100%" rather than letting it grow, so it can't scroll content
  // taller than the viewport on its own (TiendaScreen works around the same
  // limitation with its own nested ScrollView) - bounded so a long history
  // list scrolls internally instead of clipping rows or pushing the Back
  // button off-screen.
  settingsHistoryList: {
    maxHeight: 400,
    width: "100%",
  },
  settingsHistoryListContent: {
    paddingBottom: spacing.sm,
  },
  settingsHistoryLoadMore: {
    marginTop: spacing.xs,
  },
  settingsHistoryLoader: {
    marginVertical: spacing.xxxl,
  },
  settingsHistoryMessage: {
    textAlign: "center",
    marginVertical: spacing.xxl,
    ...cardTextShadow,
  },

  // ---- app/info/[slug].tsx ----
  // No separate "background" key - it's identical to styles.fullBleed
  // above, referenced directly at the call site instead of duplicated.
  infoPageScrollContent: {
    alignItems: "center",
    padding: spacing.xxl,
  },
  infoPageCard: {
    maxWidth: 720,
    padding: spacing.xl,
    marginVertical: spacing.huge,
  },
  infoPageDescription: {
    textAlign: "center",
    ...cardTextShadow,
  },
  infoPageUpdatedAt: {
    color: colors.white,
    // See settingsSectionLabel above - same distinct 13px value.
    fontSize: 13,
    fontStyle: "italic",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    ...cardTextShadow,
  },

  // ---- screens/AuthScreen.tsx ----
  authCard: {
    maxWidth: 420,
    padding: spacing.xl,
  },
  authFieldGroup: {
    marginBottom: spacing.lg,
  },
  authFieldLabel: {
    color: colors.white,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  authInput: {
    height: 48,
    backgroundColor: colors.white,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
  },
  authErrorText: {
    color: colors.danger,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  authSubmitButton: {
    backgroundColor: colors.wood.dark,
    paddingVertical: 14,
    borderRadius: radii.xxl,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authSubmitButtonText: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.md,
  },
  authLinkText: {
    color: colors.white,
    textAlign: "center",
    marginTop: spacing.lg,
    textDecorationLine: "underline",
  },
  authDividerText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  // ---- screens/ConsentScreen.tsx ----
  consentCard: {
    maxWidth: 420,
    padding: spacing.xl,
  },
  consentAcceptButton: {
    backgroundColor: colors.wood.dark,
    paddingVertical: 14,
    borderRadius: radii.xxl,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  consentButtonDisabled: {
    opacity: 0.6,
  },
  consentAcceptButtonText: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.md,
  },
  consentDeclineLink: {
    color: colors.white,
    textAlign: "center",
    marginTop: spacing.lg,
    textDecorationLine: "underline",
  },
  consentDeclineText: {
    color: colors.danger,
    marginBottom: spacing.lg,
    textAlign: "center",
  },

  // ---- screens/IntroScreen.tsx ----
  introContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  // No separate "video" key - it's identical to styles.fullBleed above,
  // referenced directly at the call site instead of duplicated.
  introSkipButton: {
    position: "absolute",
    bottom: spacing.huge,
    right: spacing.xxl,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: radii.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  introSkipText: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.md,
  },

  // ---- components/toro/ComboMeter.tsx ----
  comboMeterContainer: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  comboMeterLabel: {
    color: "#FFB347",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  comboMeterBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.overlay.medium,
  },

  // ---- components/toro/ComboPopup.tsx ----
  comboPopupOverlay: {
    position: "absolute",
    top: 150,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  comboPopupText: {
    color: colors.gold,
    fontWeight: typography.weight.black,
    fontSize: 30,
    ...textShadows.soft,
  },

  // ---- components/common/Button.tsx ----
  button: {
    backgroundColor: colors.wood.dark,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.xxl,
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  buttonText: {},

  // ---- components/texts/ThemedText.tsx ----
  themedTextTitle: {
    color: colors.white,
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  themedTextSubtitle: {
    color: colors.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  themedTextDescription: {
    color: "#333",
    fontSize: typography.size.base,
  },

  // ---- components/AnimatedNumber.tsx ----
  animatedNumberText: {
    color: colors.white,
  },

  // ---- components/auth/PolicyLinks.tsx ----
  policyLinksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: spacing.md,
    rowGap: spacing.xs,
    marginBottom: spacing.lg,
  },
  policyLinksLink: {
    color: colors.white,
    fontSize: typography.size.base,
    textDecorationLine: "underline",
  },

  // ---- components/game/MathChallenge.tsx ----
  mathChallengeContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  mathChallengeQuestion: {
    fontSize: typography.size.xxxl,
    marginBottom: spacing.lg,
  },
  mathChallengeInput: {
    width: "80%",
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radii.sm,
    padding: spacing.sm,
    fontSize: typography.size.lg,
    textAlign: "center",
  },

  // ---- screens/GauntletScreen.tsx ----
  gauntletTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.white,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },
  gauntletGlassPanel: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  gauntletSectionTitle: {
    color: colors.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  gauntletLoadoutGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gauntletLoadoutItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    marginHorizontal: spacing.xs,
  },
  gauntletLoadoutLabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    marginBottom: 4,
  },
  gauntletLoadoutValue: {
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  gauntletActiveCosmetic: {
    color: colors.gold,
  },
  gauntletModeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  gauntletModeTitle: {
    color: colors.white,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
  },
  gauntletModeSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    marginTop: 2,
  },
  gauntletRulesText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: typography.size.sm,
    marginVertical: spacing.sm,
  },
  gauntletStartButton: {
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    borderRadius: radii.xxl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  gauntletStartButtonText: {
    color: colors.nearBlack,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
    letterSpacing: 1,
  },
  gauntletBtnDisabled: {
    opacity: 0.5,
  },
  gauntletLeaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.overlay.subtle,
  },
  gauntletRank: {
    width: 30,
    fontSize: typography.size.md,
    color: colors.white,
    fontWeight: typography.weight.bold,
  },
  gauntletPlayer: {
    flex: 1,
    color: colors.white,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  gauntletScore: {
    color: colors.gold,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
  },
  gauntletMyRow: {
    backgroundColor: colors.overlay.subtle,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 0,
  },

  // ---- screens/TiendaScreen.tsx ----
  tiendaTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.white,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },
  tiendaCoinsWrapper: {
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
  tiendaCoinsEmoji: {
    fontSize: typography.size.lg,
    marginRight: 4,
  },
  tiendaCoinsCount: {
    color: colors.gold,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.md,
  },
  tiendaTabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.xl,
    marginVertical: spacing.sm,
    borderRadius: radii.xxl,
    padding: 4,
  },
  tiendaTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radii.xl,
  },
  tiendaTabActive: {
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
  tiendaTabText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.sm,
    letterSpacing: 1,
  },
  tiendaTabTextActive: {
    color: colors.white,
  },
  tiendaLoader: {
    marginTop: spacing.giant,
  },
  tiendaEmptyText: {
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    marginTop: spacing.giant,
    fontSize: typography.size.md,
  },
  tiendaCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  tiendaCardEquipped: {
    borderColor: colors.gold,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    boxShadow: [
      { offsetX: 0, offsetY: 4, blurRadius: 8, color: "rgba(255,215,0,0.1)" },
    ],
  },
  tiendaCardLocked: {
    opacity: 0.6,
  },
  tiendaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  tiendaIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlay.subtle,
  },
  tiendaCardInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  tiendaCardTitle: {
    color: colors.white,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  tiendaLockText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 4,
    fontWeight: typography.weight.medium,
  },
  tiendaUnlockedText: {
    color: colors.success,
    fontSize: 13,
    marginTop: 4,
    fontWeight: typography.weight.medium,
  },
  tiendaCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: spacing.md,
  },
  tiendaPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tiendaCoinSymbol: {
    fontSize: typography.size.lg,
    marginRight: 4,
  },
  tiendaPriceText: {
    color: colors.white,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  tiendaActionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  tiendaBtnBuy: {
    backgroundColor: colors.gold,
  },
  tiendaBtnEquip: {
    backgroundColor: colors.overlay.strong,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  tiendaBtnEquipped: {
    backgroundColor: colors.success,
  },
  tiendaBtnDisabled: {
    backgroundColor: colors.overlay.subtle,
    borderColor: colors.overlay.subtle,
  },
  tiendaBtnText: {
    color: colors.nearBlack,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },

  // ---- screens/ChallengeGameScreen.tsx ----
  challengeTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 15,
    paddingBottom: spacing.sm,
    width: "100%",
  },
  challengeTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.xl,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  challengeTimerText: {
    color: colors.white,
    fontWeight: typography.weight.bold,
    marginLeft: 6,
    fontSize: typography.size.md,
  },
  challengeFrozenText: {
    color: colors.cyan,
  },
  challengeLowTimeText: {
    color: colors.danger,
  },
  challengeInspirationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  challengeInspirationText: {
    color: colors.gold,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    marginLeft: 4,
  },
  challengeToroPanel: {
    marginHorizontal: spacing.xl,
    marginVertical: spacing.sm,
    borderRadius: radii.lg,
    padding: 14,
  },
  challengeInspiredPanel: {
    borderColor: colors.gold,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
  },
  challengeToroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  challengeToroEmoji: {
    fontSize: typography.size.hero,
  },
  challengeToroTitle: {
    color: colors.white,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    marginBottom: 4,
  },
  challengeCoopBar: {
    height: spacing.sm,
    borderRadius: radii.xs,
    backgroundColor: colors.overlay.medium,
  },
  challengeToroActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  challengeToroBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay.strong,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    marginHorizontal: spacing.xs,
  },
  challengeToroBtnDisabled: {
    opacity: 0.4,
  },
  challengeToroBtnText: {
    color: colors.white,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    marginLeft: 6,
  },
  challengeGameContainer: {
    flex: 1,
    paddingTop: spacing.sm,
  },

  // ---- components/common/Header.tsx (GameHeader) ----
  // Its own light-theme palette (white bar, dark text) is deliberately
  // distinct from the rest of the app's dark/wood aesthetic - none of
  // these colors match any shared token, so they stay literal here rather
  // than forcing new tokens into existence for a one-off style.
  gameHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  gameHeaderStats: { flex: 1, paddingHorizontal: spacing.md },
  gameHeaderLevel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: "#333",
  },
  gameHeaderProgressBar: {
    height: 6,
    borderRadius: 3,
    marginVertical: spacing.xs,
  },
  gameHeaderXpText: { fontSize: typography.size.sm, color: "#666" },
  gameHeaderIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 60,
  },
});
