import { JSX, ReactNode } from "react";

type NoticeTone = "error" | "success" | "muted";

const TONE_COLORS: Record<NoticeTone, string> = {
  error: "#c0392b",
  success: "green",
  muted: "#888",
};

interface NoticeProps {
  tone: NoticeTone;
  inline?: boolean;
  children: ReactNode;
}

// A single small piece for every colored status/error line in this tool
// (save confirmation, save error, an unknown-slug message, a "not yet
// created" list flag) instead of each spot picking its own ad hoc
// `style={{ color: "..." }}`. `inline` renders a <span> for use inside
// running text (e.g. a list item) rather than a block <p>. Several of
// these appear dynamically after an action (a save succeeding/failing)
// with no page navigation to otherwise announce them to a screen reader -
// role="alert" interrupts for an error, aria-live="polite" announces
// success/muted notices without interrupting.
const Notice = ({
  tone,
  inline = false,
  children,
}: NoticeProps): JSX.Element => {
  const color = TONE_COLORS[tone];
  const ariaProps =
    tone === "error"
      ? { role: "alert" as const }
      : { "aria-live": "polite" as const };
  return inline ? (
    <span style={{ color }} {...ariaProps}>
      {children}
    </span>
  ) : (
    <p style={{ color }} {...ariaProps}>
      {children}
    </p>
  );
};

export default Notice;
