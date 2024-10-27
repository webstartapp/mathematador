import { ExerciseInputPosition } from "@/src/types/Chalenge";

export const computePositionKey = (pos: ExerciseInputPosition[]) => pos.sort((a,b)=>a.inputIndex - b.inputIndex).map((item)=>`${item.x}-${item.y}`).join('__');