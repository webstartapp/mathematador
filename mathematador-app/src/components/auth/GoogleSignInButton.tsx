/* global google */
import { FC, JSX, useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";

const GOOGLE_SCRIPT_ID = "google-identity-services-script";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const BUTTON_CONTAINER_ID = "google-sign-in-button-container";

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
    const clientId: string | undefined =
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }
    loadGoogleScript(() => {
      const buttonContainer = document.getElementById(BUTTON_CONTAINER_ID);
      if (!google || !buttonContainer) {
        return;
      }
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential),
      });
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

  return <View id={BUTTON_CONTAINER_ID} style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 16,
  },
});

export default GoogleSignInButton;
