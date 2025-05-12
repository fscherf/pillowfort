import { SolidColorBackgroundLayer } from "@/rendering/2d/layers/solid-color-background";
import { CallbackLayer } from "@/rendering/2d/layers/callback";
import { StatsLayer } from "@/rendering/2d/layers/stats";
import { Layer } from "@/rendering/2d/layer";
import { App } from "@/rendering/2d/app";

import {
  GUIWindowManager,
  GUIWindowDefinitionsType,
} from "@/gui/window-manager";

declare const window: {
  guiWindowManager: GUIWindowManager;
  app: App;
} & Window;

function createMainApp(rootElement: HTMLElement) {
  const app: App = new App({
    rootElement: rootElement,
  });

  app.autoScale = true;

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

  // turning rect
  class TurningRectLayer extends Layer {
    private rotation: number; // degrees
    private velocity: number = 100; // 100 degrees per second

    constructor() {
      super();

      this.name = "turning-rect";
      this.zIndex = 200;

      this.rotation = 0;
    }

    public tick(timeDelta: number): void {
      this.rotation = this.rotation + (this.velocity * timeDelta) / 1000;

      if (this.rotation > 360) {
        this.rotation = 0;
      }
    }

    public render(timeDelta: number): void {
      const width: number = this.app.viewport.width / 3;
      const height: number = this.app.viewport.height / 3;
      const x: number = this.app.viewport.width / 2;
      const y: number = this.app.viewport.height / 2;

      this.app.ctx.translate(x, y);
      this.app.ctx.rotate((this.rotation * Math.PI) / 180);

      this.app.ctx.fillStyle = "cyan";

      this.app.ctx.fillRect((width / 2) * -1, (height / 2) * -1, width, height);

      this.app.ctx.resetTransform();
    }
  }

  app.layerAdd(new TurningRectLayer());

  // finish
  return app;
}

window.addEventListener("load", () => {
  let app: App;

  // setup GUI
  const guiWindowDefinitions: GUIWindowDefinitionsType = new Map();

  const guiWindowManager: GUIWindowManager = new GUIWindowManager({
    rootElement: document.querySelector("#gui"),
    guiWindowDefinitions: guiWindowDefinitions,
  });

  // main
  guiWindowDefinitions.set("main", (guiWindow) => {
    app = createMainApp(guiWindow.contentElement);

    guiWindow.setTitle("Main");
    guiWindow.setClosable(false);
    guiWindow.setSize(800, 600);

    guiWindow.onStart = () => {
      app.scale();
      app.start();
    };

    guiWindow.onResize = () => {
      app.scale();
    };
  });

  guiWindowManager.getOrCreateWindow("main");

  // finish
  window.guiWindowManager = guiWindowManager;
  window.app = app;
});
