import { useStorage } from "@/providers/storage";
import { Toggle } from "@/components/storage";

export function OverlayBackground() {
  return <div id="overlay-background"></div>;
}

export function Overlay() {
  const storage = useStorage();

  return (
    <div id="overlay">
      <h1>Settings</h1>
      <button onClick={() => storage.reset()}>Reset</button>

      <h2>Game</h2>
      <Toggle title="Show FPS" storageKey="game.showFps" />
      <Toggle title="Show TPS" storageKey="game.showTps" />
      <Toggle title="Show Corners" storageKey="game.showCorners" />
      <Toggle title="Cursor" storageKey="game.cursorEnabled" />
    </div>
  );
}
