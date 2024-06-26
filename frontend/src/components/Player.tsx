import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { UnoCard, UnoCardColor, UnoCardValue } from "../interfaces/ICard";
import { IPlayer } from "../interfaces/IPlayer";
import "../styles/Player.scss";

const Player = () => {
    const [player, setPlayer] = useState<IPlayer>();
    const [cards, setCards] = useState<UnoCard[]>([]);
    const [lastCardInGrave, setLastCardInGrave] = useState<UnoCard>();
    const [socket, setSocket] = useState<Socket>();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [hasardButton, setHasardButton] = useState("");

    useEffect(() => {
        // Creating socket connection
        const newSocket = io(import.meta.env.VITE_WEBSOCKET_URL, {
            transports: ["websocket"],
        });
        setSocket(newSocket);

        // All events for a player
        newSocket.emit("get-player-by-id", id, updatePlayer);
        newSocket.emit("get-cards-of-id", id, setCards);
        newSocket.on("players-list-updated", (_playerList: IPlayer[]) => {
            newSocket.emit("get-player-by-id", id, updatePlayer);
        });
        newSocket.on("last-card-update", (lastCard: UnoCard) => {
            setLastCardInGrave(lastCard);
        });
        newSocket.on("updated-cards-of-id", (remainingCards: UnoCard[]) => {
            console.log("***************");
            console.log(remainingCards);
            setCards(remainingCards);
        });

        return () => {
            newSocket.disconnect();
        }; // Clean up on component unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Show pass button if there is no valid move
    useEffect(() => {
        if (lastCardInGrave?.value == UnoCardValue.Reverse) {
            setHasardButton("Skip");
        } else if (lastCardInGrave?.value == UnoCardValue.Skip) {
            setHasardButton("Skip");
        } else if (lastCardInGrave?.value == UnoCardValue.DrawTwo) {
            setHasardButton("Draw");
        } else if (lastCardInGrave?.value == UnoCardValue.DrawFour) {
            setHasardButton("Draw");
        } else {
            const validCards: UnoCard[] = cards.filter((card) =>
                isCardValidForTurn(card),
            );
            setHasardButton(validCards.length == 0 ? "Pass" : "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cards, lastCardInGrave]);

    // Check if a card is valid for the current turn
    const isCardValidForTurn = (card: UnoCard) => {
        if (!card) {
            console.log("Not valid card");
            return false;
        }
        return (
            card.color == lastCardInGrave?.color ||
            card.value == lastCardInGrave?.value ||
            lastCardInGrave?.color == UnoCardColor.WildColor
        );
    };

    // Update a player
    const updatePlayer = (p: IPlayer | undefined) => {
        console.log("HERE");
        if (p == undefined) {
            navigate("/subscribe");
            return;
        }
        console.log("Updating player");
        console.log(p);
        setPlayer(p);
    };

    // Get a group of valid cards knowing a card
    const getValidCardsGroup = (chosenCard: UnoCard): UnoCard[] => {
        const validCards: UnoCard[] = [];
        cards.forEach((c) => {
            if (c.value == chosenCard.value) {
                validCards.push(c);
            }
        });
        return validCards;
    };

    // Finish turn
    const sendTurn = (
        e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
        chosenCard?: UnoCard,
    ) => {
        if (
            e.currentTarget.className == "invalid" ||
            player?.state == "waiting"
        ) {
            return;
        }

        if (lastCardInGrave?.value == UnoCardValue.Reverse) {
            socket!.emit("reverse-order");
        } else if (lastCardInGrave?.value == UnoCardValue.Skip) {
            socket!.emit("skip-turn", player!.id);
        } else if (lastCardInGrave?.value == UnoCardValue.DrawTwo) {
            socket!.emit("draw-two");
        } else if (lastCardInGrave?.value == UnoCardValue.DrawFour) {
            socket!.emit("draw-four");
        } else {
            socket!.emit("player-choice-done", {
                player: player,
                chosenCards: chosenCard
                    ? [...getValidCardsGroup(chosenCard), chosenCard]
                    : [],
            });
        }
    };

    // // Pass turn
    // const passTurn = () => {
    //     socket!.emit("player-choice-done", {
    //         player: player,
    //         chosenCards: [],
    //         skip: false,
    //     });
    //     setPass(false);
    // };
    // // Skip a turn
    // const skipTurn = () => {
    //     socket!.emit("player-choice-done", {
    //         player: player,
    //         chosenCards: [],
    //         skip,
    //     });
    //     setSkip(false);
    // };
    // // Draw some cards
    // const drawCards = () => {
    //     socket!.emit("draw-hasard-from-grave");
    // };

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
            {hasardButton == "" ? null : (
                <button onClick={(e) => sendTurn(e, undefined)}>
                    {hasardButton}
                </button>
            )}
        </>
    );
};

export default Player;
