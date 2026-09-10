/* eslint-disable max-lines */
import { JSX, useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

import imageBG from "@/assets/images/intro-screen.png";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import Layout from "@/components/common/Layout";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import { useAnimatedBackground } from "@/providers/animations/AnimatedImage";
import { setAuth, syncProgress } from "@/redux/slices/userSlice";
import {
  gameProgress,
  userCheckEmail,
  userConsentRecord,
  userGoogleLogin,
  userLogin,
  userRegister,
} from "@/src/_generated/api";
import { ApiRequestError } from "@/utils/api-client";
import { getLocalConsentRecord } from "@/utils/consent";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthStep = "email" | "login" | "register";

interface AuthStepFieldsProps {
  step: AuthStep;
  email: string;
  setEmail: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
}

interface LabeledFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
}

// Plain RN TextInput, not react-native-paper's: Paper's TextInput computes
// its own height internally from label/font metrics rather than respecting
// a plain `height` style (the `height` in its style prop is intercepted for
// that math and deliberately excluded from what actually reaches its outer
// View - see callstack/react-native-paper's TextInputFlat.tsx), and without
// a PaperProvider (never set up in this app) that computation rendered a
// full-screen-tall box on Android. A plain TextInput has no such layer to
// fight - a fixed-height style is respected identically everywhere.
const LabeledField = ({
  label,
  value,
  onChangeText,
  // Every field in this screen is a credential (email, username, password) -
  // none of them should ever auto-capitalize. Password fields in particular
  // must not: on native keyboards, autoCapitalize actually mutates the typed
  // value (not just its display), so a "sentences" default would silently
  // submit a different password than the one the user typed.
  autoCapitalize = "none",
  keyboardType = "default",
  secureTextEntry = false,
}: LabeledFieldProps): JSX.Element => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      style={styles.input}
    />
  </View>
);

const AuthStepFields = ({
  step,
  email,
  setEmail,
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}: AuthStepFieldsProps): JSX.Element => (
  <>
    {step === "email" && (
      <LabeledField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
    )}
    {step === "register" && (
      <LabeledField
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
    )}
    {step !== "email" && (
      <LabeledField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    )}
    {step === "register" && (
      <LabeledField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
    )}
  </>
);

const AuthScreen = (): JSX.Element => {
  useAnimatedBackground(imageBG);
  const dispatch = useDispatch();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetToEmailStep = (): void => {
    setStep("email");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
  };

  // Shared by every successful auth path (login, register, Google). setAuth
  // resets account-scoped progress to a fresh snapshot (so a different
  // account never inherits stale local data - see userSlice.setAuth), which
  // means a *returning* user needs their real progress re-hydrated from the
  // server right away, or they'd see Level 1/0 XP until their next reload.
  // Best-effort: if this fails, the user just stays on the freshly-reset
  // state, matching the offline-first fallback pattern used elsewhere.
  const applyAuthSuccess = useCallback(
    async (userProfile: {
      id?: string;
      role?: string;
      name?: string;
    }): Promise<void> => {
      if (!userProfile.id || !userProfile.role) {
        throw new Error("Auth response is missing required fields");
      }
      dispatch(
        setAuth({
          id: userProfile.id,
          role: userProfile.role,
          name: userProfile.name,
        }),
      );
      try {
        const progress = await gameProgress();
        dispatch(syncProgress(progress.data));
      } catch {
        // Ignored - see comment above.
      }
      // Exchanges the pre-login, device-local consent record (#31) with the
      // now-authenticated account. Best-effort like the progress sync above:
      // a returning user who already has a server-side record just gets it
      // echoed back and does nothing with it, so a failure here costs
      // nothing beyond the next login retrying it.
      try {
        const localConsent = await getLocalConsentRecord();
        if (localConsent) {
          await userConsentRecord(localConsent);
        }
      } catch {
        // Ignored - see comment above.
      }
    },
    [dispatch],
  );

  const handleCheckEmail = async (): Promise<void> => {
    setErrorMessage(null);
    if (!EMAIL_PATTERN.test(email)) {
      setErrorMessage("Enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await userCheckEmail({ email });
      setStep(response.data.exists ? "login" : "register");
    } catch {
      setErrorMessage("Could not reach the server. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (idToken: string): Promise<void> => {
      setErrorMessage(null);
      setIsSubmitting(true);
      try {
        const response = await userGoogleLogin({ idToken });
        await applyAuthSuccess(response.data);
      } catch {
        setErrorMessage("Could not sign in with Google. Try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [applyAuthSuccess],
  );

  const handleLogin = async (): Promise<void> => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await userLogin({ email, password });
      await applyAuthSuccess(response.data);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError && error.status === 401
          ? "Incorrect password."
          : "Could not reach the server. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (): Promise<void> => {
    setErrorMessage(null);
    if (!username.trim() || !password) {
      setErrorMessage("Enter a username and password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await userRegister({
        email,
        password,
        username: username.trim(),
      });
      await applyAuthSuccess(response.data);
    } catch {
      setErrorMessage("Could not create your account. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabels: Record<AuthStep, string> = {
    email: "Continue",
    login: "Log In",
    register: "Create Account",
  };
  const stepHandlers: Record<AuthStep, () => Promise<void>> = {
    email: handleCheckEmail,
    login: handleLogin,
    register: handleRegister,
  };

  return (
    <Layout>
      <CenteredDesk
        title="Join the Coliseo!"
        descriptions={
          step === "email"
            ? [
                "Log in to keep your Toro Numérico's progress, coins, and cosmetics safe across every device.",
              ]
            : undefined
        }
        subtitles={step !== "email" ? [email] : undefined}
        styles={{ container: styles.card }}
      >
        <AuthStepFields
          step={step}
          email={email}
          setEmail={setEmail}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
          disabled={isSubmitting}
          onPress={stepHandlers[step]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{stepLabels[step]}</Text>
          )}
        </TouchableOpacity>
        {step !== "email" && (
          <TouchableOpacity onPress={resetToEmailStep}>
            <Text style={styles.linkText}>Use a different email</Text>
          </TouchableOpacity>
        )}
        {step === "email" && (
          <>
            <Text style={styles.dividerText}>or</Text>
            <GoogleSignInButton onCredential={handleGoogleCredential} />
          </>
        )}
      </CenteredDesk>
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    maxWidth: 420,
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#704c21",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 16,
    textDecorationLine: "underline",
  },
  dividerText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
});

export default AuthScreen;
