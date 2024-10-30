import SingleLine from "../components/minigames/SingleLineMinigame";
import { ChalengeResult, Challenge } from "../types/Chalenge";

export type MinigameComponentProps = {
    challenge: Challenge;
    submitResults: (results: ChalengeResult, challenge: Challenge) => void;
}


type Minigame = {
    id: string;
    name: string;
    description: string;
    component: React.FC<MinigameComponentProps>;
    xpCoeficient: number;
    timeCoeficient: number;
    coinsCoeficient: number;
}

export const minigames: Minigame[] = [
    {
        id: 'SingleLineMinigame',
        name: 'Mathematical Sprint',
        description: 'Solve the math problems as fast as you can!',
        component: SingleLine,
        xpCoeficient: 0.5,
        timeCoeficient: 0.5,
        coinsCoeficient: 0.5,
    }
];