export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type QuestStatus = "locked" | "active" | "claimed";

export type Quest = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  reward: number;
  status: QuestStatus;
};

export type Prize = {
  id: string;
  name: string;
  image?: string;
  rarity: Rarity;
  weight: number;
};

export type GameState = {
  friendName: string;
  spins: number;
  prizes: Prize[];
  quests: Quest[];
  inventory: string[];
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#9ca3af",
  rare: "#4b69ff",
  epic: "#8847ff",
  legendary: "#d32ce6",
  mythic: "#eb4b4b",
};

export const DEFAULT_STATE: GameState = {
  friendName: "[ИМЯ]",
  spins: 0,
  prizes: [
    { id: "p1", name: "Приз 1", rarity: "common", weight: 50 },
    { id: "p2", name: "Приз 2", rarity: "rare", weight: 25 },
    { id: "p3", name: "Приз 3", rarity: "epic", weight: 15 },
    { id: "p4", name: "Приз 4", rarity: "legendary", weight: 8 },
    { id: "p5", name: "Приз 5", rarity: "mythic", weight: 2 },
  ],
  quests: [
    { id: "q1", title: "Задание 1", reward: 1, status: "locked" },
    { id: "q2", title: "Задание 2", reward: 1, status: "locked" },
    { id: "q3", title: "Задание 3", reward: 1, status: "locked" },
  ],
  inventory: [],
};
