import { ChalengeResult } from "./Chalenge";

export type RootStackParamList = {
    Home?: {};
    Level: { levelId: number };
    Challenge: { challengeId: number, operationId: string};
    ChallengeResult: ChalengeResult;
    SelectOperation?: {};
    Statistics?: {};
    Profile?: {};
    SelectLevel: { operationId: string };
  };