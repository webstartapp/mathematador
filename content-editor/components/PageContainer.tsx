import { JSX, ReactNode } from "react";

interface PageContainerProps {
  maxWidth?: number;
  children: ReactNode;
}

// Every page in this tool wraps its content in the same centered column -
// shared here so the width/spacing stays consistent instead of being
// re-typed as an inline style per page.
const PageContainer = ({
  maxWidth = 640,
  children,
}: PageContainerProps): JSX.Element => (
  <main style={{ maxWidth, margin: "0 auto", padding: 24 }}>{children}</main>
);

export default PageContainer;
