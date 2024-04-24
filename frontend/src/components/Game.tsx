import { useEffect, useState } from "react";
import { IPlayer } from "../interfaces/IPlayer";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";

const Game = () => {
    const location = useLocation();
    const socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
        transports: ["websocket"],
    });
    const [players, setPlayers] = useState<IPlayer[]>([]);
    useEffect(() => {
        console.log("Game->");
        console.log(location.state.players);
        console.log("<-Game");
        socket.emit("game-begin", location.state.players);
        if (location.state.players) {
            setPlayers(location.state.players);
        }
    }, []);
    return (
        <div>
            {players.map((player, index) => (
                <div key={index}>
                    {player.name} : {player.state}
                </div>
            ))}
        </div>
    );
};

export default Game;
