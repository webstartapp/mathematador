import { JSX } from "react";

interface BackLinkProps {
  href: string;
  label: string;
}

// Every page below the dashboard needs a way back up the hierarchy - shared
// so an unknown-page or error state always gets one for free, rather than
// each new state needing its own copy of the link to stay navigable.
const BackLink = ({ href, label }: BackLinkProps): JSX.Element => (
  <p>
    <a href={href}>&larr; Back to {label}</a>
  </p>
);

export default BackLink;
