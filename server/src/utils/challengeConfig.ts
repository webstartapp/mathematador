export interface ChallengeConfig {
  count: number;
  maxTime: number;
  allowedMistakes: number;
  xpOnSuccess: number;
  xpOnFailure: number;
  coinsOnSuccess: number;
  coinsOnFailure: number;
}

export const getChallengeConfig = (operationId: string): ChallengeConfig => {
  switch (operationId) {
    case "gauntlet":
      return {
        count: 10,
        maxTime: 45,
        allowedMistakes: 2,
        xpOnSuccess: 35,
        xpOnFailure: 10,
        coinsOnSuccess: 25,
        coinsOnFailure: 5
      };
    case "daily_challenge":
      return {
        count: 20,
        maxTime: 90,
        allowedMistakes: 0,
        xpOnSuccess: 40,
        xpOnFailure: 10,
        coinsOnSuccess: 50,
        coinsOnFailure: 10
      };
    default:
      return {
        count: 10,
        maxTime: 60,
        allowedMistakes: 3,
        xpOnSuccess: 20,
        xpOnFailure: 5,
        coinsOnSuccess: 10,
        coinsOnFailure: 2
      };
  }
};
