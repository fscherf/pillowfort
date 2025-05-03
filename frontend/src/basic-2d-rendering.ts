import { SolidColorBackgroundLayer } from "@/rendering/2d/layers/solid-color-background";
import { CallbackLayer } from "@/rendering/2d/layers/callback";
import { StatsLayer } from "@/rendering/2d/layers/stats";
import { Layer } from "@/rendering/2d/layer";
import { App } from "@/rendering/2d/app";

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

  // mini map
  const miniMapLayer: CallbackLayer = new CallbackLayer();

  miniMapLayer.name = "mini-map";
  miniMapLayer.zIndex = 100;
  miniMapLayer.width = "100px";
  miniMapLayer.height = "75px";
  miniMapLayer.right = "20px";
  miniMapLayer.bottom = "20px";

  miniMapLayer.callback = (layer: Layer, timeDelta: number) => {
    layer.app.ctx.fillStyle = "green";

    layer.app.ctx.fillRect(
      layer.viewport.x,
      layer.viewport.y,
      layer.viewport.width,
      layer.viewport.height,
    );
  };

  app.layerAdd(miniMapLayer);

  // start
  app.start();

  // finish
  window.app = app;
});
