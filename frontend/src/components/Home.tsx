import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { IPlayer } from "../interfaces/IPlayer";

const Home = () => {
    const [players, setPlayers] = useState<IPlayer[]>([]);
    const [socket, setSocket] = useState<Socket>();

    const updatePlayers = (playerList: IPlayer[]) => {
        console.log("Here");
        setPlayers(playerList);
    };

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_WEBSOCKET_URL, {
            transports: ["websocket"],
        });

        setSocket(newSocket);

        newSocket.on("players-list-updated", updatePlayers);
        newSocket.emit("get-player-list", updatePlayers);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const play = () => {
        socket!.emit("game-started");
    };

    return (
        <div>
            <h1>Home</h1>
            {players.map((player, index) => (
                <div key={index}>
                    {player.name} : {player.id}
                </div>
            ))}
            {players.length >= 2 ? <button onClick={play}>Play!</button> : null}
        </div>
    );
};

export default Home;
