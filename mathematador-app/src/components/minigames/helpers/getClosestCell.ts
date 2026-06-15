import { ExerciseInputPosition } from "@/src/types/Chalenge";

export const getClosestCell = (
  targetX: number,
  targetY: number,
  exercisePositions: ExerciseInputPosition[],
): ExerciseInputPosition | null => {
  const closest = exercisePositions.reduce<{
    distance: number;
    cell: ExerciseInputPosition | null;
  }>(
    (closestCell, current) => {
      const distance = Math.sqrt(
        (targetX - current.x) ** 2 + (targetY - current.y) ** 2,
      );
      if (distance < closestCell.distance) {
        return { distance, cell: current };
      }
      return closestCell;
    },
    { distance: Infinity, cell: null },
  );
  if (closest.cell && closest.distance < closest.cell.width) {
    return closest.cell;
  }
  return null;
};
