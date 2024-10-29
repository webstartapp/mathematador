import { ExerciseInputPosition } from "@/src/types/Chalenge";
import { FC, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { computePositionKey } from "../helpers/computePositionKey";
import ExeriseDigit, { ExerciseDigitProps } from "./ExerciseDigit";

const ExerciseValuePreview:FC<ExerciseDigitProps> = ({value, updateExercisePositions, exercisePositions = [], exerciseId})=>{
    
    const refferenceDigits = useRef<(View | null)[]>([]);
    const [layoutsReady, setLayoutsReady] = useState<number[]>();
  
    useEffect(() => {
      setLayoutsReady([]);
    }, [value]);
  
    useEffect(()=>{
      const measurePositions = async ()=>{
      const localPositions: ExerciseInputPosition[] = []; 
      for(let index = 0; index < refferenceDigits.current.length; index++){
        const ref = refferenceDigits.current[index];
        if(ref){
          const position = await new Promise<ExerciseInputPosition>((resolve) => {
            ref.measure((x, y, width, height, pageX, pageY) => {
              resolve({ x: pageX + (width / 2), y: pageY + (height / 2), width, exerciseIndex: 0, inputIndex: index });
            });
          });
          if(position) localPositions.push(position);
        }
      }
      if(updateExercisePositions && localPositions.length >= String(value).length){
        if(computePositionKey(localPositions) !== computePositionKey(exercisePositions)){
          updateExercisePositions(localPositions, 0);
        }
      }
    }
    if(layoutsReady?.length === String(value).length){
      measurePositions();
    }
    }, [refferenceDigits.current, updateExercisePositions, value, JSON.stringify(exercisePositions), layoutsReady]);
  
    return <View>
    {String(value).split('').map((v,index)=>(
      <View key={`${index}_${computePositionKey(exercisePositions)}_${value}`}  onLayout={()=>setLayoutsReady(prev=>prev?.includes(index)? prev : [...(prev || []), index])}>
        <ExeriseDigit value={v} forwardRef={(ref)=>{
          refferenceDigits.current[index] = ref;
        }}
        isUnknown={v === '?'}
        exerciseId={exerciseId}
      />
      </View>
    ))}
    </View>;
  };

export default ExerciseValuePreview;
  