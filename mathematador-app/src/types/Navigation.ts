import { ChalengeResult, Challenge } from "@/types/Chalenge";

export type RootStackParamList = {
  Intro?: { nextRoute?: "Home" | "Consent" | "Auth" };
  Consent?: { nextRoute?: "Home" | "Auth" };
  Home?: {};
  Level: { levelId: number };
  Challenge: Challenge;
  ChallengeResult: ChalengeResult;
  SelectOperation?: {};
  Statistics?: {};
  Profile?: {};
  ChalengeSelect: { operationId: string };
  Tienda?: {};
  Gauntlet?: {};
  DailyCorrida?: {};
  Auth?: {};
};
