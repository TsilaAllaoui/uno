import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { UnoCard } from "../interfaces/ICard";
import { IPlayer } from "../interfaces/IPlayer";
import "../styles/Player.scss";

const Player = () => {
    const [player, setPlayer] = useState<IPlayer>();
    const { id } = useParams();
    const [cards, setCards] = useState<UnoCard[]>([]);
    const [lastCardInGrave, setLastCardInGrave] = useState<UnoCard>();
    const [socket, setSocket] = useState<Socket>();
    const navigate = useNavigate();

    const updatePlayer = (p: IPlayer | undefined) => {
        if (!p) {
            navigate("/subscribe");
            return;
        }
        setPlayer(p);
    };

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_WEBSOCKET_URL, {
            transports: ["websocket"],
        });
        setSocket(newSocket);

        newSocket.emit("get-player-by-id", id, updatePlayer);
        newSocket.emit("get-cards-of-id", id, setCards);
        newSocket.on("players-list-updated", (playerList: IPlayer[]) => {
            console.log(playerList);
            playerList.forEach((p) => {
                if (p.id == player?.id) {
                    player.state = p.state;
                }
            });
        });

        return () => {
            newSocket.disconnect();
        }; // Clean up on component unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // useEffect(() => {
    // socket.on("connect", () => {
    //     if (id) {
    //         socket.on(
    //             "card-of-id",
    //             ({
    //                 foundPlayer,
    //                 randomCards,
    //             }: {
    //                 foundPlayer: IPlayer;
    //                 randomCards: UnoCard[];
    //             }) => {
    //                 console.log(
    //                     "Player " + player?.name + player?.id + "connected",
    //                 );
    //                 setCards(randomCards);
    //                 setPlayer(foundPlayer);
    //             },
    //         );
    //         socket.on("last-grave-card-updated", (lastCard: UnoCard) =>
    //             setLastCardInGrave(lastCard),
    //         );
    //         socket.emit("get-cards-of-id", id);
    //         socket.emit("get-last-grave-card", id);
    //     }
    // });
    // }, []);

    useEffect(() => console.log(cards), [cards]);

    const isCardValidForTurn = (card: UnoCard) => {
        if (!card) {
            console.log("Not valid card");
            return false;
        }
        return (
            card.color == lastCardInGrave?.color ||
            card.value == lastCardInGrave?.value
        );
    };

    const sendTurn = (
        e: React.MouseEvent<HTMLDivElement>,
        chosenCard: UnoCard,
    ) => {
        if (e.currentTarget.className == "invalid") {
            return;
        }

        console.log("Chosen card: -> ");
        console.log(chosenCard);

        socket!.emit("player-choice-done", {
            player,
            lastCard: chosenCard,
        });
        setCards(cards.filter((card) => card != chosenCard));
        setLastCardInGrave(chosenCard);
    };

    return (
        <>
            {!player ? (
                <div>Checking...</div>
            ) : (
                <>
                    <h1>
                        {player.name} ({player.state})
                    </h1>
                    <div className="cards">
                        {cards.map((card, index) => (
                            <div
                                className={
                                    isCardValidForTurn(card)
                                        ? "valid"
                                        : "invalid"
                                }
                                onClick={(e) => sendTurn(e, card)}
                                key={index}
                            >
                                <p>{card?.color}</p>
                                <p>{card?.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="last-card-in-grave">
                        <p>{lastCardInGrave?.color}</p>
                        <p>{lastCardInGrave?.value}</p>
                    </div>
                </>
            )}
        </>
    );
};

export default Player;
