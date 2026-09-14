import Link from "next/link";
import { JSX } from "react";

import PageContainer from "@/components/PageContainer";
import dashboardSections from "@/config/dashboardSections.json";

const HomePage = (): JSX.Element => (
  <PageContainer>
    <h1>Mathematador Content Editor</h1>
    <p>
      Local-only tool for editing static content that gets bundled into the app
      at build time. Pick a section below.
    </p>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {dashboardSections.map((section) => (
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
  </PageContainer>
);

export default HomePage;
