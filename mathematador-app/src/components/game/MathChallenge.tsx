import { useState, FC, JSX } from "react";
import { View, Text, TextInput } from "react-native";

import { mathChallengeStyles as styles } from "@/theme";

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

export default MathChallenge;
