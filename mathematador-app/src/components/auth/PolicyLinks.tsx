import { Link } from "expo-router";
import { JSX } from "react";
import { View } from "react-native";

import { styles } from "@/theme";

// These `/info/*` routes are real, public Expo Router pages - a sibling of
// the isolated in-game navigation tree (see mathematador-app/CLAUDE.md's
// "Screen flow & navigation"), not gated by auth or consent, so linking out
// from here doesn't need any access change of its own. Content is still a
// placeholder pending #35 - the links exist so the reader can at least
// reach the (soon-to-be-real) page while deciding whether to accept.
// Slugs match #35's own naming exactly, so its eventual CMS-backed
// implementation doesn't need to coordinate a rename with this component
// (or if it does, this file is the other place to update).
const PolicyLinks = (): JSX.Element => (
  <View style={styles.policyLinksContainer}>
    <Link href="/info/terms-and-conditions" style={styles.policyLinksLink}>
      Terms &amp; Conditions
    </Link>
    <Link href="/info/gdpr" style={styles.policyLinksLink}>
      Privacy Policy
    </Link>
    <Link href="/info/cookies-policy" style={styles.policyLinksLink}>
      Cookies Policy
    </Link>
    <Link href="/info/ai-participation" style={styles.policyLinksLink}>
      AI Participation
    </Link>
  </View>
);

export default PolicyLinks;
