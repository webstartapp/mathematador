import { ExerciseInputPosition } from "@/src/types/Chalenge";

export const computePositionKey = (
  positions: ExerciseInputPosition[],
): string =>
  positions
    .sort((posA, posB) => posA.inputIndex - posB.inputIndex)
    .map((item) => `${item.x}-${item.y}`)
    .join("__");
