import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { UnoCard, UnoCardColor, UnoCardValue } from "./interfaces/Card";
import { IPlayer } from "./interfaces/IPlayer";
import { generateUnoCards, getRandomCards } from "./utils";

dotenv.config();

const app = express();

console.log(process.env.PORT);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
app.use(cors());

let players: IPlayer[] = [];
let grave: UnoCard[] = [];
let cards: UnoCard[] = generateUnoCards();

let idOfCurrentChoosing = "";

let currId = -1;
const ids: string[] = [];

const updatePlayersStates = (lastPlayer: IPlayer) => {
    // Setting player states
    players.forEach((p) => {
        if (p.id == lastPlayer.id) {
            p.state = "waiting";
        } else {
            p.state = "choosing";
        }
    });

    io.emit("players-list-updated", players);
    if (currId == players.length - 1) {
        currId = 0;
    } else {
        currId = 0;
    }
};

/******** DEBUG PURPOSE********/

const fixedRandomCard: UnoCard = {
    color: UnoCardColor.Green,
    value: UnoCardValue.Skip,
};

const firstPlayerCards: UnoCard[] = [
    fixedRandomCard,
    ...getRandomCards(cards, 6),
];

/******** DEBUG PURPOSE********/

// Set events listening/emitting
io.on("connection", (socket: Socket) => {
    // Adding new player
    socket.on(
        "add-new-player",
        (player: IPlayer, redirect: (id: string) => void) => {
            const result = players.findIndex((p) => p.name == player.name);

            if (result >= 0) {
                console.log(
                    "Player with name " + player.name + " already exists...",
                );
                redirect(players[result].id);
                return;
            }

            if (process.env.MODE == "1" && players.length == 0) {
                player.cards = firstPlayerCards;
            } else {
                player.cards = getRandomCards(cards, 7);
            }

            player.id = socket.id;
            players.push(player);

            console.log("Player " + player.name + " created");
            io.emit("players-list-updated", players);
            redirect(player.id);
        },
    );

    // Getting cards of a player
    socket.on(
        "get-cards-of-id",
        (id: string, setCards: (cards: UnoCard[]) => void) => {
            const result = players.findIndex((p) => p.id == id);
            let generatedCards = [];
            if (result >= 0) {
                const player = players[result];
                setCards(player.cards);
            }
        },
    );

    // Getting a player by Id
    socket.on(
        "get-player-by-id",
        (id: string, updatePlayer: (p: IPlayer | undefined) => void) => {
            const result = players.findIndex((p) => p.id == id);
            if (result >= 0) {
                updatePlayer(players[result]);
            } else {
                updatePlayer(undefined);
            }
        },
    );

    // Getting player list
    socket.on(
        "get-player-list",
        (updatePlayers: (playerList: IPlayer[]) => void) => {
            updatePlayers(players);
        },
    );

    // Event for game start
    socket.on("game-started", () => {
        currId = 0;
        players.forEach((player) => {
            player.state =
                player.id == players[currId].id ? "choosing" : "waiting";
        });

        io.emit("players-list-updated", players);

        // Get first card in grave

        if (process.env.MODE == "1") {
            grave.push(fixedRandomCard);
            io.emit("last-card-update", fixedRandomCard);
            const foundIndex = cards.findIndex(
                (card) =>
                    card.color == fixedRandomCard.color &&
                    card.value == fixedRandomCard.value,
            );
            cards = cards.filter((card, index) => index != foundIndex);
        } else {
            let randomCard: UnoCard;
            let randomIndex = -1;
            while (true) {
                const randomIndex = Math.floor(
                    Math.random() * (cards.length - 1),
                );
                randomCard = cards[randomIndex];
                if (
                    !Object.values(UnoCardValue).includes(
                        randomCard.value as any,
                    )
                ) {
                    break;
                }
            }
            grave.push(randomCard);
            io.emit("last-card-update", randomCard);
            cards = cards.filter((card, index) => index != randomIndex);
        }
    });

    // When a player finish a turn
    socket.on(
        "player-choice-done",
        ({
            player,
            chosenCards,
        }: {
            player: IPlayer;
            chosenCards: UnoCard[];
        }) => {
            if (chosenCards.length > 0) {
                grave.push(chosenCards.at(0)!);

                const result = players.findIndex((p) => p.id == player.id);
                let remainingCards: UnoCard[] = [];
                if (result >= 0) {
                    const player = players[result];

                    remainingCards = player.cards.filter(
                        (card) =>
                            !chosenCards.some(
                                (chosenCard) =>
                                    chosenCard.color === card.color &&
                                    chosenCard.value === card.value,
                            ),
                    );

                    console.log(remainingCards);

                    player.cards = remainingCards;
                    io.to(socket.id).emit(
                        "updated-cards-of-id",
                        remainingCards,
                    );
                }
                io.emit("last-card-update", grave[grave.length - 1]);
            } else {
                if (grave[grave.length - 1].value != UnoCardValue.Skip) {
                    const result = players.findIndex((p) => p.id == player.id);
                    const foundPlayer = players[result];
                    const randomCard = getRandomCards(cards, 1);
                    foundPlayer.cards = [...foundPlayer.cards, randomCard[0]];
                    io.to(socket.id).emit(
                        "updated-cards-of-id",
                        foundPlayer.cards,
                    );
                }
            }

            updatePlayersStates(player);
        },
    );

    // Player skip turn
    socket.on("skip-turn", (id: string) => {
        const result = players.find((p) => p.id == id);
        result!.cards = [...result!.cards, ...getRandomCards(cards, 1)];
        updatePlayersStates(result!);
        io.to(socket.id).emit("updated-cards-of-id", result!.cards);
    });

    // Get hasard from grave
    socket.on("draw-hasard-from-grave", () => {
        const id = socket.id;
        const hasardCards: UnoCard[] = [];

        if (grave.length == 0) {
            throw "Grave empty exception!";
        }

        const hasardType = grave[grave.length - 1].value;

        for (let i = grave.length - 1; i >= 0; i--) {
            if (grave[i].value == hasardType) {
                for (let j = i; j > grave.length; i--) {
                    if (grave[j].value == hasardType) {
                        hasardCards.push(grave[j]);
                    } else {
                        i = -1;
                        break;
                    }
                }
            }
        }

        const result = players.find((p) => p.id == socket.id);
        if (!result) {
            throw "Player with id " + socket.id + " not found!";
        }
        result!.cards = [
            ...result!.cards,
            ...getRandomCards(
                cards,
                hasardCards.length *
                    (hasardType == UnoCardValue.DrawTwo ? 2 : 4),
            ),
        ];

        // Setting player states
        players.forEach((p) => {
            if (p.id == socket.id) {
                p.state = "waiting";
            } else {
                p.state = "choosing";
            }
        });

        io.emit("players-list-updated", players);
        if (currId == players.length - 1) {
            currId = 0;
        } else {
            currId = 0;
        }
    });
});

server.listen(process.env.PORT || 3000, () =>
    console.log("Server stared at port " + (process.env.PORT || 3000) + "..."),
);
