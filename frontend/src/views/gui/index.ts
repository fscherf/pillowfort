import { SolidColorBackgroundLayer } from "@/2d/rendering/layers/solid-color-background";
import { CallbackLayer } from "@/2d/rendering/layers/callback";
import { GUILinkComponent } from "@/gui/components/link";
import { GUIListComponent } from "@/gui/components/list";
import { StatsLayer } from "@/2d/rendering/layers/stats";
import { Layer } from "@/2d/rendering/layer";
import { GUIWindow } from "@/gui/window";
import { App } from "@/2d/rendering/app";

import {
  GUIWindowManager,
  GUIWindowDefinitionsType,
} from "@/gui/window-manager";

declare const window: {
  guiWindowManager: GUIWindowManager;
  apps: Array<App>;
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
  const apps: Array<App> = [];

  // setup GUI
  const guiWindowDefinitions: GUIWindowDefinitionsType = new Map();

  const guiWindowManager: GUIWindowManager = new GUIWindowManager({
    rootElement: document.querySelector(".gui-window-manager"),
    guiWindowDefinitions: guiWindowDefinitions,
  });

  // define window classes
  guiWindowDefinitions.set("menu", (guiWindow) => {
    guiWindow.setTitle("Menu");
    guiWindow.setClosable(false);

    const list: GUIListComponent = new GUIListComponent();
    let link: GUILinkComponent;

    // links: New App
    link = new GUILinkComponent();

    link.setText("New App");

    link.setCallback(() => {
      guiWindowManager.createWindow("app");
    });

    list.addItem(link);

    // links: Reset Window Manager
    link = new GUILinkComponent();

    link.setText("Reset Window Manager");

    link.setCallback(() => {
      guiWindowManager.closeAll();
      window.location.reload();
    });

    list.addItem(link);

    // finish
    guiWindow.addComponent(list);
  });

  guiWindowDefinitions.set("app", (guiWindow) => {
    const app: App = createMainApp(guiWindow.contentElement);

    guiWindow.setTitle("App");
    guiWindow.setClosable(true);
    guiWindow.setSize(800, 600);

    guiWindow.onStart = () => {
      app.scale();
      app.start();
    };

    guiWindow.onResize = () => {
      app.scale();
    };

    apps.push(app);
  });

  // setup window state
  if (!guiWindowManager.setupState("pillowfort.gui.v1")) {
    // app
    const mainWindow: GUIWindow = guiWindowManager.getOrCreateWindow("app");

    mainWindow.setSize(800, 600);
    mainWindow.setPosition(320, 10);
  }

  // menu
  let menuWindow: GUIWindow | null = guiWindowManager.getWindow("menu");

  if (!menuWindow) {
    menuWindow = guiWindowManager.createWindow("menu");

    menuWindow.setSize(300, 600);
    menuWindow.setPosition(10, 10);
  }

  // finish
  window.guiWindowManager = guiWindowManager;
  window.apps = apps;
});
