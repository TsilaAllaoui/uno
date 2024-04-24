import { UnoCard } from "./ICard";

export interface IPlayer {
    name: string;
    state: "waiting" | "choosing";

    id: string;

    cards: UnoCard[];

    index: number;
}
