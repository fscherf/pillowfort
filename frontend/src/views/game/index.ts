import { SolidColorBackgroundLayer } from "@/2d/rendering/layers/solid-color-background";
import { StatsLayer } from "@/2d/rendering/layers/stats";
import { App } from "@/2d/rendering/app";

declare const window: {
  app: App;
} & Window;

window.addEventListener("load", () => {
  // setup app
  const rootElement: HTMLElement = document.querySelector("#game");

  const app: App = new App({
    rootElement: rootElement,
  });

  window.addEventListener("resize", () => {
    app.scale();
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

  // finish
  app.start();
  app.scale();

  window.app = app;
});
