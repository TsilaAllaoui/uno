import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { IPlayer } from "../interfaces/IPlayer";

const Subscribe = () => {
    const [player, setPlayer] = useState<IPlayer>();
    const navigate = useNavigate();
    const [socket, setSocket] = useState<Socket>();

    const subscribe = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (formData.get("name")) {
            setPlayer({
                name: formData.get("name")!.toString(),
                state: "waiting",
                id: "",
                cards: [],
                index: -1,
            });
        }
    };

    const redirect = (foundId: string) => {
        navigate("/player/" + foundId);
    };

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_WEBSOCKET_URL, {
            transports: ["websocket"],
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (player) {
            socket!.emit("add-new-player", player, redirect);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player]);

    return (
        <div>
            <h1>Subscribe</h1>
            <form onSubmit={subscribe}>
                <label htmlFor="name">Name</label>
                <input type="text" id="name" aria-label="name" name="name" />
                <button type="submit">Subscribe</button>
            </form>
        </div>
    );
};

export default Subscribe;
