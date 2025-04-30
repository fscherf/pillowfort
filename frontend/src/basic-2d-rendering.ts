import { SolidColorBackgroundLayer } from "./rendering/2d/layers/solid-color-background.js";
import { StatsLayer } from "./rendering/2d/layers/stats.js";
import { App } from "./rendering/2d/app.js";

declare const window: {
  app: App;
} & Window;

window.addEventListener("load", () => {
  const rootElement: HTMLElement = document.querySelector("#main");

  const app: App = new App({
    rootElement: rootElement,
  });

  // background layer
  const backgroundLayer: SolidColorBackgroundLayer =
    new SolidColorBackgroundLayer();

  backgroundLayer.color = "#000000";
  backgroundLayer.name = "background";
  backgroundLayer.zIndex = 1000;

  app.layerAdd(backgroundLayer);

  // stats layer
  const statsLayer: StatsLayer = new StatsLayer();

  statsLayer.name = "stats";
  statsLayer.zIndex = -1;
  statsLayer.showFps = true;
  statsLayer.showTps = true;
  statsLayer.showCorners = true;

  app.layerAdd(statsLayer);

  // start
  app.start();

  // finish
  window.app = app;
});
