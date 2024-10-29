export const calculateXPToNextLevel = (level: number): number => {
    const baseXP = 50;
    const incrementFactor = 1.2;
    return Math.floor((baseXP * Math.pow(level, incrementFactor))/10) * 10;
};