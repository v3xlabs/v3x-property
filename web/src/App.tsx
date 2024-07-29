import React, { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { preflightAuth } from "./api/auth";

export const App = () => {
    preflightAuth();

    return (
        <div className="">
            <Navbar />
            <span>Hello World</span>
        </div>
    );
};
