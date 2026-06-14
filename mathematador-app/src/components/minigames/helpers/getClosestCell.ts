/* eslint-disable @typescript-eslint/explicit-function-return-type, @typescript-eslint/consistent-type-assertions */
import { ExerciseInputPosition } from "@/src/types/Chalenge";

export const getClosestCell = (
  targetX: number,
  targetY: number,
  exercisePositions: ExerciseInputPosition[],
) => {
  const closest = exercisePositions.reduce(
    (closestCell, current) => {
      const distance = Math.sqrt(
        (targetX - current.x) ** 2 + (targetY - current.y) ** 2,
      );
      if (distance < closestCell.distance) {
        return { distance, cell: current };
      }
      return closestCell;
    },
    { distance: Infinity, cell: null } as {
      distance: number;
      cell: ExerciseInputPosition | null;
    },
  );
  if (closest.cell && closest.distance < closest.cell.width) {
    return closest.cell;
  }
  return null;
};
