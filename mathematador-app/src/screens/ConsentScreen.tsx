import { Link, useNavigation } from "expo-router";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { RouteProp, useRoute } from "expo-router/react-navigation";
import { JSX, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

import imageBG from "@/assets/images/intro-screen.png";
import Layout from "@/components/common/Layout";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import { markConsentResolved } from "@/navigation/introSession";
import { useAnimatedBackground } from "@/providers/animations/AnimatedImage";
import { selectIsAuthenticated } from "@/redux/selectors/auth";
import { userConsentRecord } from "@/src/_generated/api";
import { RootStackParamList } from "@/types/Navigation";
import { getLocalConsentRecord, recordLocalConsent } from "@/utils/consent";

type ConsentScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Consent"
>;
type ConsentScreenRouteProp = RouteProp<RootStackParamList, "Consent">;

// One of "checking" (async local-storage read in flight, nothing rendered
// yet to avoid flashing the gate for an already-consented device), "show"
// (no local record - block here), "skip" (already consented on this device
// - never re-shown, see #31's acceptance criteria).
type GateState = "checking" | "show" | "skip";

const ConsentScreen = (): JSX.Element | null => {
  useAnimatedBackground(imageBG);
  const navigation = useNavigation<ConsentScreenNavigationProp>();
  const route = useRoute<ConsentScreenRouteProp>();
  const nextRoute = route.params?.nextRoute ?? "Auth";
  // Registered in both AuthStack (not-yet-logged-in visitors) and GameStack
  // (an already-authenticated session that reaches here because it has no
  // local consent record - e.g. an account that logged in before this gate
  // existed, or on a device that never went through it). Only the
  // authenticated case has a token to sync consent with immediately.
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [gateState, setGateState] = useState<GateState>("checking");
  const [showDeclineMessage, setShowDeclineMessage] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    getLocalConsentRecord().then((existingRecord) => {
      if (isCancelled) return;
      setGateState(existingRecord ? "skip" : "show");
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (gateState === "skip") {
      markConsentResolved();
      navigation.replace(nextRoute);
    }
  }, [gateState, navigation, nextRoute]);

  const handleAccept = async (): Promise<void> => {
    const localConsent = await recordLocalConsent();
    markConsentResolved();
    if (isAuthenticated) {
      try {
        await userConsentRecord(localConsent);
      } catch {
        // Best-effort, same as AuthScreen's post-login sync - the local
        // record is already saved either way, so this only risks the
        // server-side row lagging behind until some other authenticated
        // call happens to succeed.
      }
    }
    navigation.replace(nextRoute);
  };

  const handleDecline = (): void => {
    setShowDeclineMessage(true);
  };

  if (gateState !== "show") {
    return null;
  }

  return (
    <Layout>
      <CenteredDesk
        title="Before You Continue"
        descriptions={[
          "Mathematador uses your data to personalize ads and keep the game free, and processes it in line with GDPR. You must accept both to play.",
        ]}
        styles={{ container: styles.card }}
      >
        {/*
          These `/info/*` routes are real, public Expo Router pages - a
          sibling of this isolated in-game navigation tree (see
          mathematador-app/CLAUDE.md's "Screen flow & navigation"), not
          gated by auth or consent, so linking out from here doesn't need
          any access change of its own. Content is still a placeholder
          pending #35 - the links exist so the reader can at least reach
          the (soon-to-be-real) page while deciding whether to accept.
          Slugs match #35's own naming exactly, so its eventual CMS-backed
          implementation doesn't need to coordinate a rename with this
          screen (or if it does, this file is the other place to update).
        */}
        <View style={styles.policyLinks}>
          <Link href="/info/terms-and-conditions" style={styles.policyLink}>
            Terms &amp; Conditions
          </Link>
          <Link href="/info/gdpr" style={styles.policyLink}>
            Privacy Policy
          </Link>
          <Link href="/info/cookies-policy" style={styles.policyLink}>
            Cookies Policy
          </Link>
          <Link href="/info/ai-participation" style={styles.policyLink}>
            AI Participation
          </Link>
        </View>
        {showDeclineMessage && (
          <Text style={styles.declineText}>
            You need to accept to use Mathematador.
          </Text>
        )}
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptButtonText}>Accept & Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDecline}>
          <Text style={styles.declineLink}>Decline</Text>
        </TouchableOpacity>
      </CenteredDesk>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    maxWidth: 420,
    padding: 20,
  },
  policyLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: 12,
    rowGap: 4,
    marginBottom: 16,
  },
  policyLink: {
    color: "#fff",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  acceptButton: {
    backgroundColor: "#704c21",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 8,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  declineLink: {
    color: "#fff",
    textAlign: "center",
    marginTop: 16,
    textDecorationLine: "underline",
  },
  declineText: {
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
});

export default ConsentScreen;
