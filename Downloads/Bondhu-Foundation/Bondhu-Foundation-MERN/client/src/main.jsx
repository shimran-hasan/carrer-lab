import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import CardStudio from "./CardStudio.jsx";
import "./styles.css";
const Page = window.location.pathname.startsWith("/studio") ? CardStudio : App;
createRoot(document.getElementById("root")).render(<React.StrictMode><Page/></React.StrictMode>);
