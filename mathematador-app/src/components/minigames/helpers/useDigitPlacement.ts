import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface DigitPlacement {
  selectedDigit: number | null;
  handleTapDigit: (value: number) => void;
  handleDigitSlotTap: (inputIndex: number) => void;
}

export const useDigitPlacement = (
  currentExerciseIndex: number,
  addResponse: (exerciseId: number, keyId: number, value: number) => void,
  setExerciseResults: Dispatch<
    SetStateAction<Record<string, Record<string, number>>>
  >,
): DigitPlacement => {
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);

  useEffect(() => {
    setSelectedDigit(null);
  }, [currentExerciseIndex]);

  const clearResponse = (exerciseId: number, keyId: number): void => {
    setExerciseResults((prev) => {
      if (!prev[exerciseId] || prev[exerciseId][keyId] === undefined) {
        return prev;
      }
      const updatedExercise = { ...prev[exerciseId] };
      delete updatedExercise[keyId];
      return { ...prev, [exerciseId]: updatedExercise };
    });
  };

  const handleTapDigit = (value: number): void => {
    setSelectedDigit((prev) => (prev === value ? null : value));
  };

  const handleDigitSlotTap = (inputIndex: number): void => {
    if (selectedDigit !== null) {
      addResponse(currentExerciseIndex, inputIndex, selectedDigit);
      setSelectedDigit(null);
      return;
    }
    clearResponse(currentExerciseIndex, inputIndex);
  };

  return { selectedDigit, handleTapDigit, handleDigitSlotTap };
};
