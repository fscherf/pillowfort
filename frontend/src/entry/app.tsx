import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

import { OverlayBackground, Overlay } from "@/components/overlay";
import { Storage, useStorage } from "@/providers/storage";
import { Game } from "@/game";

const rootElement: HTMLElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

declare const window: {
  game: Game;
} & Window;

export function GameComponent() {
  const storage = useStorage();
  const rootElementRef = useRef(null);
  const gameRef = useRef<Game | null>(null);

  // initial setup
  useEffect(() => {
    if (!rootElementRef.current) {
      return;
    }

    gameRef.current = new Game({
      rootElement: rootElementRef.current,
    });

    // make game object available in the console
    window.game = gameRef.current;
  }, []);

  // handle storage updates
  useEffect(() => {
    if (!gameRef.current) {
      return;
    }

    const game: Game = gameRef.current;

    game.statsLayer.showFps = storage.get("game.showFps");
    game.statsLayer.showTps = storage.get("game.showTps");
    game.statsLayer.showCorners = storage.get("game.showCorners");
    game.mainCamera.cursorEnabled = storage.get("game.cursorEnabled");
  }, [storage]);

  return <div className="game" ref={rootElementRef} />;
}

function App() {
  const storage = useStorage();

  // initial setup
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        storage.toggle("overlay.open");
      }
    }

    window.addEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div id="app">
      <GameComponent />
      {storage.get("overlay.open") && <OverlayBackground />}
      {storage.get("overlay.open") && <Overlay />}
    </div>
  );
}

root.render(
  <Storage>
    <App />
  </Storage>,
);
