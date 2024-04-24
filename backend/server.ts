import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { UnoCard } from "./interfaces/Card";
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

// Get first card in grave
const randomIndex = Math.floor(Math.random() * (cards.length - 1));
grave.push(cards[randomIndex]);
io.emit("last-card-update", cards[randomIndex]);
cards = cards.filter((card, index) => index != randomIndex);

let currId = -1;
const ids: string[] = [];

// Set events listening/emitting
io.on("connection", (socket: Socket) => {
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

            player.cards = getRandomCards(cards);
            players.push(player);

            console.log("Player " + player.name + " created");
            io.emit("players-list-updated", players);
            io.emit("test");
            redirect(player.id);
        },
    );

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

    socket.on(
        "get-player-by-id",
        (id: string, updatePlayer: (p: IPlayer | undefined) => void) => {
            console.log("Getting player with id: " + id);
            const result = players.findIndex((p) => p.id == id);
            if (result >= 0) {
                updatePlayer(players[result]);
            } else {
                updatePlayer(undefined);
            }
        },
    );

    socket.on(
        "get-player-list",
        (updatePlayers: (playerList: IPlayer[]) => void) => {
            updatePlayers(players);
        },
    );

    socket.on("game-started", () => {
        currId = 0;
        players.forEach((player) => {
            if (player.id == players[currId].id) {
                player.state = "choosing";
            } else {
                player.state = "waiting";
            }
        });
        io.emit("players-list-updated", players);
    });
});

server.listen(process.env.PORT || 3000, () =>
    console.log("Server stared at port " + (process.env.PORT || 3000) + "..."),
);
