import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Game from "./components/Game";
import Subscribe from "./components/Subscribe";
import Player from "./components/Player";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/game",
        element: <Game />,
    },
    {
        path: "/subscribe",
        element: <Subscribe />,
    },
    {
        path: "/player/:id",
        element: <Player />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
);
