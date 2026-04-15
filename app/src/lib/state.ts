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
  unique?: boolean;
  finalOnly?: boolean;
  guaranteedByPull?: number;
};

export type GameState = {
  friendName: string;
  spins: number;
  pullCount: number;
  prizes: Prize[];
  quests: Quest[];
  inventory: string[];
};

export const REGULAR_PULLS = 9;

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#9ca3af",
  rare: "#4b69ff",
  epic: "#8847ff",
  legendary: "#d32ce6",
  mythic: "#eb4b4b",
};

export const DEFAULT_STATE: GameState = {
  friendName: "[ИМЯ]",
  spins: 1,
  pullCount: 0,
  prizes: [
    { id: "gift1", name: "Подарок 1", image: "/gift1.png", rarity: "common", weight: 20 },
    { id: "gift2", name: "Подарок 2", image: "/gift2.png", rarity: "rare", weight: 15, unique: true, guaranteedByPull: 8 },
    { id: "gift3", name: "Подарок 3", image: "/gift3.png", rarity: "epic", weight: 5 },
    { id: "gift4", name: "Подарок 4", image: "/gift4.png", rarity: "common", weight: 40 },
    { id: "gift5", name: "Подарок 5", image: "/gift5.png", rarity: "rare", weight: 15 },
    { id: "gift6", name: "Подарок 6", image: "/gift6.jpg", rarity: "legendary", weight: 5, unique: true, guaranteedByPull: 9 },
    { id: "gift7", name: "???", image: "/gift7.jfif", rarity: "mythic", weight: 1, unique: true, finalOnly: true },
  ],
  quests: [
    { id: "q1", title: "За красивые глаза", reward: 1, status: "active" },
    { id: "q2", title: "Убить Мауштера любой ценой", reward: 1, status: "active" },
    { id: "q3", title: "SPECIAL ASSIGNMENT WAITING, TALK TO GERALT OF RIVIA", reward: 1, status: "active" },
    { id: "q4", title: "Помурчать (если не болеешь)", reward: 1, status: "active" },
    { id: "q5", title: "Пленить раба Яну и хлыстнуть плетью", reward: 1, status: "active" },
    { id: "q6", title: "Найти гимуар в Верминтайде (и Разбить его НАХУЙ)", reward: 1, status: "active" },
    { id: "q7", title: "Нарисовать котика в пейнте", reward: 1, status: "active" },
    { id: "q8", title: "Задание 8", reward: 1, status: "active" },
    { id: "q9", title: "Face Reveal (Видеозвонок)", reward: 1, status: "locked" },
  ],
  inventory: [],
};
