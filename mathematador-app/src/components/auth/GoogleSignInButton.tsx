/* global google */
import { FC, JSX, useEffect } from "react";
import { Platform, View } from "react-native";

import { styles } from "@/theme";

const GOOGLE_SCRIPT_ID = "google-identity-services-script";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const BUTTON_CONTAINER_ID = "google-sign-in-button-container";

// Module-level, not component state: google.accounts.id.initialize() warns
// ("is called multiple times... only the last initialized instance will be
// used") if invoked more than once, which happened here on every remount of
// this component (confirmed live) - initialize() itself only needs to run
// once per page load. The credential callback closes over this mutable ref
// instead of `onCredential` directly, so a later remount with a fresh
// `onCredential` (a new AuthScreen instance, a changed dependency) still
// reaches the current handler without needing a second initialize() call.
let hasInitializedGoogleIdentity = false;
let latestOnCredential: ((idToken: string) => void) | null = null;

// The global `google` identifier's type comes from src/types/google.d.ts
// (not `window.google`, which this repo's lint config forbids outright).
interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void;
}

const loadGoogleScript = (onLoaded: () => void): void => {
  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existingScript) {
    onLoaded();
    return;
  }
  const script = document.createElement("script");
  script.id = GOOGLE_SCRIPT_ID;
  script.src = GOOGLE_SCRIPT_SRC;
  script.async = true;
  script.onload = onLoaded;
  document.head.appendChild(script);
};

// Google Identity Services (accounts.google.com/gsi/client) - a plain
// browser script, not a native module - is web-only, matching this app's
// current web-only MVP build target; renders nothing on any other platform.
const GoogleSignInButton: FC<GoogleSignInButtonProps> = ({
  onCredential,
}): JSX.Element | null => {
  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }
    const clientId = String(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "");
    if (!clientId) {
      return;
    }
    latestOnCredential = onCredential;
    loadGoogleScript(() => {
      const buttonContainer = document.getElementById(BUTTON_CONTAINER_ID);
      if (!google || !buttonContainer) {
        return;
      }
      if (!hasInitializedGoogleIdentity) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => latestOnCredential?.(response.credential),
        });
        hasInitializedGoogleIdentity = true;
      }
      google.accounts.id.renderButton(buttonContainer, {
        theme: "outline",
        size: "large",
        width: "300",
        shape: "pill",
      });
    });
  }, [onCredential]);

  if (Platform.OS !== "web") {
    return null;
  }

  return <View id={BUTTON_CONTAINER_ID} style={styles.googleSignInContainer} />;
};

export default GoogleSignInButton;
