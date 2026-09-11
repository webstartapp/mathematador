import Link from "next/link";
import { JSX } from "react";

interface DashboardSection {
  slug: string;
  title: string;
  description: string;
  href: string;
}

const SECTIONS: DashboardSection[] = [
  {
    slug: "content",
    title: "Public Page Content",
    description:
      "Terms & Conditions, GDPR, Cookies Policy, AI Participation - the static legal/info pages rendered at /info/[slug] in the app.",
    href: "/content",
  },
];

const HomePage = (): JSX.Element => (
  <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
    <h1>Mathematador Content Editor</h1>
    <p>
      Local-only tool for editing static content that gets bundled into the app
      at build time. Pick a section below.
    </p>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {SECTIONS.map((section) => (
        <li key={section.slug} style={{ marginBottom: 20 }}>
          <Link
            href={section.href}
            style={{ fontSize: 18, fontWeight: "bold" }}
          >
            {section.title}
          </Link>
          <p style={{ color: "#666", margin: "4px 0 0" }}>
            {section.description}
          </p>
        </li>
      ))}
    </ul>
  </main>
);

export default HomePage;
