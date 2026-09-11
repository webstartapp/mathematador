import type { Metadata } from "next";
import { JSX, ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Mathematador Content Editor",
  description: "Local-only tool for editing static public page content.",
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps): JSX.Element => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
