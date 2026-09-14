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
// running text (e.g. a list item) rather than a block <p>.
const Notice = ({
  tone,
  inline = false,
  children,
}: NoticeProps): JSX.Element => {
  const color = TONE_COLORS[tone];
  return inline ? (
    <span style={{ color }}>{children}</span>
  ) : (
    <p style={{ color }}>{children}</p>
  );
};

export default Notice;
