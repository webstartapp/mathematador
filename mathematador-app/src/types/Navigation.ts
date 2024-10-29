import { ChalengeResult, Challenge } from "./Chalenge";

export type RootStackParamList = {
    Home?: {};
    Level: { levelId: number };
    Challenge: Challenge;
    ChallengeResult: ChalengeResult;
    SelectOperation?: {};
    Statistics?: {};
    Profile?: {};
    ChalengeSelect: { operationId: string };
  };