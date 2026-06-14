/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ExerciseInputPosition } from "@/src/types/Chalenge";

export const computePositionKey = (positions: ExerciseInputPosition[]) =>
  positions
    .sort((posA, posB) => posA.inputIndex - posB.inputIndex)
    .map((item) => `${item.x}-${item.y}`)
    .join("__");
