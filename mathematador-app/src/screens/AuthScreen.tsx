/* eslint-disable max-lines */
import { JSX, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { TextInput } from "react-native-paper";
import { useDispatch } from "react-redux";

import imageBG from "@/assets/images/intro-screen.png";
import Layout from "@/components/common/Layout";
import CenteredDesk from "@/components/layouts/CenteredDesk";
import { useAnimatedBackground } from "@/providers/animations/AnimatedImage";
import { setAuth } from "@/redux/slices/userSlice";
import { userCheckEmail, userLogin, userRegister } from "@/src/_generated/api";

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
    setPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
  };

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

  const handleLogin = async (): Promise<void> => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const response = await userLogin({ email, password });
      if (!response.data.id || !response.data.role) {
        throw new Error("Login response is missing required fields");
      }
      dispatch(
        setAuth({
          id: response.data.id,
          role: response.data.role,
          name: response.data.name,
        }),
      );
    } catch {
      setErrorMessage("Incorrect password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (): Promise<void> => {
    setErrorMessage(null);
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await userRegister({ email, password, username });
      if (!response.data.id || !response.data.role) {
        throw new Error("Register response is missing required fields");
      }
      dispatch(
        setAuth({
          id: response.data.id,
          role: response.data.role,
          name: response.data.name,
        }),
      );
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
});

export default AuthScreen;
