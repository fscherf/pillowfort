import { GUIAttributeTableComponent } from "@/gui/components/table";
import { GUILinkComponent } from "@/gui/components/link";
import { GUIListComponent } from "@/gui/components/list";
import { Layer } from "@/2d/rendering/layer";
import { GUIWindow } from "@/gui/window";
import { retry } from "@/utils";
import { Game } from "@/2d/game";

import {
  GUIWindowManager,
  GUIWindowDefinitionsType,
} from "@/gui/window-manager";

declare const window: {
  guiWindowManager: GUIWindowManager;
  game: Game;
} & Window;

window.addEventListener("load", () => {
  let game: Game;

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

    // links: rendering
    link = new GUILinkComponent();

    link.setText("Rendering");

    link.setCallback(() => {
      guiWindowManager.getOrCreateWindow("rendering");
    });

    list.addItem(link);

    // links: controller
    link = new GUILinkComponent();

    link.setText("Controller");

    link.setCallback(() => {
      guiWindowManager.getOrCreateWindow("controller");
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

  guiWindowDefinitions.set("game", (guiWindow) => {
    game = new Game({
      rootElement: guiWindow.contentElement,
    });

    guiWindow.setTitle("Game");
    guiWindow.setClosable(false);
    guiWindow.setSize(800, 600);

    guiWindow.onStart = () => {
      game.app.scale();
      game.app.start();
    };

    guiWindow.onResize = () => {
      game.app.scale();
    };

    window.game = game;
  });

  guiWindowDefinitions.set("controller", (guiWindow) => {
    guiWindow.setTitle("Controller");
    guiWindow.setClosable(true);
    guiWindow.setSize(300, 400);

    const table: GUIAttributeTableComponent = new GUIAttributeTableComponent();

    table.addAttribute("focused", "Focused");
    table.addAttribute("mouseOver", "Mouse Over");
    table.addAttribute("hoveredLayer", "Hovered Layer");
    table.addAttribute("mouseX", "Mouse X");
    table.addAttribute("mouseY", "Mouse Y");

    table.addAttribute("mouseDownLeft", "Mouse Down Left");
    table.addAttribute("mouseDownLeftX", "Mouse Down Left X");
    table.addAttribute("mouseDownLeftY", "Mouse Down Left Y");

    table.addAttribute("mouseDownRight", "Mouse Down Right");
    table.addAttribute("mouseDownRightX", "Mouse Down Right X");
    table.addAttribute("mouseDownRightY", "Mouse Down Right Y");

    table.addAttribute("wheelDeltaX", "Wheel Delta X");
    table.addAttribute("wheelDeltaY", "Wheel Delta Y");

    table.addAttribute("activeKeys", "Active Keys");
    table.addAttribute("activeActions", "Active Actions");

    retry(() => {
      game.app.controller.onChange = () => {
        table.update(game.app.controller.getState());
      };
    });

    // finish
    guiWindow.addComponent(table);
  });

  guiWindowDefinitions.set("rendering", (guiWindow) => {
    guiWindow.setTitle("Rendering");
    guiWindow.setClosable(true);
    guiWindow.setSize(300, 400);

    const table: GUIAttributeTableComponent = new GUIAttributeTableComponent();

    retry(() => {
      const statsLayer: Layer = game.app.layerGetByName("stats");

      table.clear();

      table.addCheckbox(statsLayer, "visible", "Show Stats");
      table.addCheckbox(statsLayer, "showFps", "Show FPS");
      table.addCheckbox(statsLayer, "showTps", "Show TPS");
      table.addCheckbox(statsLayer, "showCorners", "Show Corners");

      table.addRange(game.app, "tpsMax", "Max TPS", 1, 120);
    });

    // finish
    guiWindow.addComponent(table);
  });

  // setup window state
  if (!guiWindowManager.setupState("pillowfort.gui.v1")) {
    // game
    const gameWindow: GUIWindow = guiWindowManager.getOrCreateWindow("game");

    gameWindow.setSize(800, 600);
    gameWindow.setPosition(320, 10);
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
});
