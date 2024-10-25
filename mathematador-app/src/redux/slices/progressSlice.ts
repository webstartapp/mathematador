import { Challenge } from '@/src/types/Chalenge';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type operationProgress = {
    operationId: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
}
