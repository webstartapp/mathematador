interface NamedMilestone {
  streak: number;
  label: string;
}

const NAMED_MILESTONES: NamedMilestone[] = [
  { streak: 3, label: "¡Ole! x3" },
  { streak: 5, label: "¡Ole! Grande x5" },
  { streak: 8, label: "¡Ole! Magnífico x8" },
];

const HIGH_COMBO_THRESHOLD = 8;

export const getComboTextForStreak = (streakValue: number): string | null => {
  const namedMatch = NAMED_MILESTONES.find(
    (milestoneItem) => milestoneItem.streak === streakValue,
  );
  if (namedMatch) {
    return namedMatch.label;
  }
  if (streakValue >= 10 && streakValue % 5 === 0) {
    return `¡Ole! Toro x${streakValue}`;
  }
  return null;
};

export const isComboMilestone = (streakValue: number): boolean =>
  getComboTextForStreak(streakValue) !== null;

export const isHighComboMilestone = (streakValue: number): boolean =>
  isComboMilestone(streakValue) && streakValue >= HIGH_COMBO_THRESHOLD;

export const getNextComboMilestone = (streakValue: number): number => {
  const upcomingNamed = NAMED_MILESTONES.map(
    (milestoneItem) => milestoneItem.streak,
  ).find((milestoneStreak) => milestoneStreak > streakValue);
  if (upcomingNamed !== undefined) {
    return upcomingNamed;
  }
  if (streakValue < 10) {
    return 10;
  }
  return (Math.floor(streakValue / 5) + 1) * 5;
};

export const getPreviousComboMilestone = (streakValue: number): number => {
  if (streakValue >= 10) {
    return Math.floor(streakValue / 5) * 5;
  }
  const passedNamed = [...NAMED_MILESTONES]
    .reverse()
    .find((milestoneItem) => milestoneItem.streak <= streakValue);
  return passedNamed ? passedNamed.streak : 0;
};
