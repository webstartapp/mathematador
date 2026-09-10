/* eslint-disable max-lines */
import { JSX, useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { TextInput } from "react-native-paper";
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
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
    )}
    {step === "register" && (
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={styles.input}
      />
    )}
    {step !== "email" && (
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
    )}
    {step === "register" && (
      <TextInput
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
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
  input: {
    // react-native-paper's TextInput has no intrinsic height of its own on
    // native - without one, it stretches to fill whatever vertical space is
    // left in its flex parent (a known RNP quirk: github.com/callstack/
    // react-native-paper/issues/1858). Web happens to size it sanely by
    // itself, which is why this only ever showed up on a phone.
    height: 56,
    marginBottom: 16,
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
