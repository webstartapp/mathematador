import { useNavigation } from "expo-router";
import { StackNavigationProp } from "expo-router/build/react-navigation/stack";
import { RouteProp, useRoute } from "expo-router/react-navigation";
import { JSX, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";

import imageBG from "@/assets/images/intro-screen.png";
import PolicyLinks from "@/components/auth/PolicyLinks";
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
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    getLocalConsentRecord()
      .then((existingRecord) => {
        if (isCancelled) return;
        setGateState(existingRecord ? "skip" : "show");
      })
      .catch(() => {
        // A storage read failure must never leave this stuck on "checking"
        // forever (a permanently blank screen) or silently skip the gate -
        // fall back to showing it, same as "no record found".
        if (!isCancelled) setGateState("show");
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
    if (isAccepting) return;
    setIsAccepting(true);
    let localConsent;
    try {
      localConsent = await recordLocalConsent();
    } catch {
      setIsAccepting(false);
      setAcceptError(true);
      return;
    }
    markConsentResolved();
    if (isAuthenticated) {
      // Fire-and-forget, same as AuthScreen's post-login sync - the local
      // record is already saved either way, so a failure (or the request
      // just hanging) only risks the server-side row lagging behind until
      // some other authenticated call happens to succeed. Must not be
      // awaited: this account is already authenticated and the local
      // record now exists, so there's nothing left blocking navigation -
      // awaiting a slow/unreachable server here would strand the user on
      // the gate for no reason.
      userConsentRecord(localConsent).catch(() => {
        // Ignored - see comment above.
      });
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
        <PolicyLinks />
        {showDeclineMessage && (
          <Text style={styles.declineText}>
            You need to accept to use Mathematador.
          </Text>
        )}
        {acceptError && (
          <Text style={styles.declineText}>
            Could not save your acceptance. Please try again.
          </Text>
        )}
        <TouchableOpacity
          style={[styles.acceptButton, isAccepting && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={isAccepting}
        >
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
  acceptButton: {
    backgroundColor: "#704c21",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
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
