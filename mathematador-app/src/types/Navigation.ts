import { ChalengeResult, Challenge } from "@/types/Chalenge";

export type RootStackParamList = {
  Intro?: { nextRoute?: "Home" | "Login" };
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
  Login?: {};
  Register?: {};
};
