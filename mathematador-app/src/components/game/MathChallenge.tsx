import { useState, FC, JSX } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

import { colors, radii, spacing, typography } from "@/theme";

interface MathChallengeProps {
  question: string;
  onSubmit: (answer: string) => void;
}

const MathChallenge: FC<MathChallengeProps> = ({
  question,
  onSubmit,
}): JSX.Element => {
  const [answer, setAnswer] = useState("");

  const handleChange = (text: string): void => {
    setAnswer(text);
  };

  const handleSubmit = (): void => {
    onSubmit(answer);
    setAnswer("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={handleChange}
        keyboardType="numeric"
        placeholder="Your answer"
        onSubmitEditing={handleSubmit}
      />
      {/* Add a submit button or handle submit on enter */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: "center",
  },
  question: {
    fontSize: typography.size.xxxl,
    marginBottom: spacing.lg,
  },
  input: {
    width: "80%",
    borderWidth: 1,
    // Close to (but distinct from) colors.success - unified onto the same
    // green token rather than keeping its own near-duplicate shade.
    borderColor: colors.success,
    borderRadius: radii.sm,
    padding: spacing.sm,
    fontSize: typography.size.lg,
    textAlign: "center",
  },
});

export default MathChallenge;
