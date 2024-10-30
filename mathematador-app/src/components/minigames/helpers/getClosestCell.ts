import { ExerciseInputPosition } from "@/src/types/Chalenge";

export const getClosestCell = (x: number, y: number, exercisePositions: ExerciseInputPosition[]) => {
    const closest = exercisePositions.reduce((closest, current) => {
      const distance = Math.sqrt((x - current.x) ** 2 + (y - current.y) ** 2);
      if (distance < closest.distance) {
        return { distance, cell: current };
      }
      return closest;
    }, { distance: Infinity, cell: null } as { distance: number, cell: ExerciseInputPosition | null });
    if(closest.cell && closest.distance < closest.cell.width) {
      return closest.cell;
    }
    return null;
  };