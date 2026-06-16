import { getChallengeConfig } from "@/utils/challengeConfig";
import { generateExercises } from "@/utils/mathGenerator";

describe("Math Generator & Challenge Config Tests", () => {
  describe("getChallengeConfig", () => {
    it("should return correct parameters for standard operations", () => {
      const config = getChallengeConfig("addition");
      expect(config.count).toBe(10);
      expect(config.maxTime).toBe(60);
      expect(config.allowedMistakes).toBe(3);
      expect(config.coinsOnSuccess).toBe(10);
    });

    it("should return correct parameters for gauntlet", () => {
      const config = getChallengeConfig("gauntlet");
      expect(config.count).toBe(10);
      expect(config.maxTime).toBe(45);
      expect(config.allowedMistakes).toBe(2);
      expect(config.coinsOnSuccess).toBe(25);
    });

    it("should return correct parameters for daily_challenge", () => {
      const config = getChallengeConfig("daily_challenge");
      expect(config.count).toBe(20);
      expect(config.maxTime).toBe(90);
      expect(config.allowedMistakes).toBe(0);
      expect(config.coinsOnSuccess).toBe(50);
    });
  });

  describe("generateExercises", () => {
    it("should generate 10 exercises for standard operations", () => {
      const exercises = generateExercises("addition", 1, 10);
      expect(exercises.length).toBe(10);
      exercises.forEach((exerciseItem) => {
        expect(exerciseItem.separator).toBe("+");
        expect(exerciseItem.values.length).toBe(2);
        expect(exerciseItem.values[0] + exerciseItem.values[1]).toBe(exerciseItem.result);
      });
    });

    it("should generate mixed exercises for gauntlet", () => {
      const exercises = generateExercises("gauntlet", 1, 15);
      expect(exercises.length).toBe(15);
      const separators = new Set(exercises.map((exerciseItem) => exerciseItem.separator));
      // Gauntlet should generate a mix of operations
      expect(separators.size).toBeGreaterThan(1);
    });

    it("should generate exactly 20 exercises for daily_challenge", () => {
      const exercises = generateExercises("daily_challenge", 1, 20);
      expect(exercises.length).toBe(20);
    });

    it("should be deterministic for daily_challenge on the same date", () => {
      const exercises1 = generateExercises("daily_challenge", 1, 20);
      const exercises2 = generateExercises("daily_challenge", 1, 20);

      // Because we mock Date/time or run them sequentially on the same day, they should match
      expect(exercises1).toEqual(exercises2);
    });
  });
});
