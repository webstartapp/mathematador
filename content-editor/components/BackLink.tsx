import Link from "next/link";
import { JSX } from "react";

interface BackLinkProps {
  href: string;
  label: string;
}

// Every page below the dashboard needs a way back up the hierarchy - shared
// so an unknown-page or error state always gets one for free, rather than
// each new state needing its own copy of the link to stay navigable.
// next/link's <Link> for a client-side transition, matching every other
// navigation link in this tool. PagePreview.tsx's plain <a> is the one
// exception, since it points at the real game app's own separate origin,
// not a route here.
const BackLink = ({ href, label }: BackLinkProps): JSX.Element => (
  <p>
    <Link href={href}>&larr; Back to {label}</Link>
  </p>
);

export default BackLink;
