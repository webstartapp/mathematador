import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface MathChallengeProps {
  question: string;
  onSubmit: (answer: string) => void;
}

const MathChallenge: React.FC<MathChallengeProps> = ({ question, onSubmit }) => {
  const [answer, setAnswer] = React.useState('');

  const handleChange = (text: string) => {
    setAnswer(text);
  };

  const handleSubmit = () => {
    onSubmit(answer);
    setAnswer('');
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
    padding: 20,
    alignItems: 'center',
  },
  question: {
    fontSize: 24,
    marginBottom: 15,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default MathChallenge;
