import {createRoot} from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker for offline play and PWA installation
if ("serviceWorker" in navigator && (import.meta.env.PROD || window.location.protocol === "https:")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("Suly Empire PWA Service Worker Registered:", reg.scope))
      .catch((err) => console.warn("SW registration skipped:", err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
