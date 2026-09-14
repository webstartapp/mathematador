import { JSX, ReactNode } from "react";

import BackLink from "@/components/BackLink";
import Notice from "@/components/Notice";
import PageContainer from "@/components/PageContainer";

interface NotFoundMessageProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}

// A general "this doesn't exist" state, kept inside the app's own chrome
// instead of next/navigation's notFound() - that swaps in Next's
// whole-page not-found boundary, dropping this tool's own navigation
// entirely (no way anywhere else without editing the URL by hand). Any
// missing-thing case in this tool (an unknown content slug today, a future
// unknown section) can reuse this rather than hand-rolling its own dead
// end. Defaults back to the dashboard since that's the one destination
// every page here can always reach.
const NotFoundMessage = ({
  title,
  backHref = "/",
  backLabel = "dashboard",
  children,
}: NotFoundMessageProps): JSX.Element => (
  <PageContainer maxWidth={900}>
    <BackLink href={backHref} label={backLabel} />
    <h1>{title}</h1>
    <Notice tone="error">{children}</Notice>
  </PageContainer>
);

export default NotFoundMessage;
