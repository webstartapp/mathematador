
export type RootStackParamList = {
    Home?: {};
    Level: { levelId: number };
    Challenge: { challengeId: number, operationId: string};
    SelectOperation?: {};
    Statistics?: {};
    Profile?: {};
    SelectLevel: { operationId: string };
  };