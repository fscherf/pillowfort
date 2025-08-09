import { JsonRpcClient } from "@/json-rpc/client";
import { StatsLayer } from "@/engine/layers/stats";
import { Camera } from "@/engine/camera";
import { Scene } from "@/engine/scene";
import { Engine } from "@/engine";

export class Game {
  public rootElement: HTMLElement;
  public jsonRpcClient: JsonRpcClient;

  public engine: Engine;
  public statsLayer: StatsLayer;
  public scene: Scene;
  public mainCamera: Camera;
  public miniMapCamera: Camera;

  constructor({ rootElement }: { rootElement: HTMLElement }) {
    this.rootElement = rootElement;
    this.jsonRpcClient = new JsonRpcClient();

    // setup engine
    this.engine = new Engine({
      rootElement: rootElement,
    });

    this.engine.autoScale = true;

    // setup stats layer
    this.statsLayer = new StatsLayer();

    this.statsLayer.name = "stats";
    this.statsLayer.zIndex = -1; // make sure it is always on top

    this.engine.layerAdd(this.statsLayer);

    // setup scene
    this.scene = new Scene();

    // setup main camera (full screen)
    this.mainCamera = new Camera({
      scene: this.scene,
    });

    this.mainCamera.name = "main-camera";
    this.mainCamera.width = "100%";
    this.mainCamera.height = "100%";
    this.mainCamera.backgroundEnabled = true;
    this.mainCamera.backgroundColor = "#000000";

    // TODO: make this configurable
    this.mainCamera.gridEnabled = true;
    this.mainCamera.gridColor = "#FFFFFF";
    this.mainCamera.cursorColor = "#FF0000";

    this.engine.layerAdd(this.mainCamera);

    // setup mini map camera (bottom right)
    this.miniMapCamera = new Camera({
      scene: this.scene,
    });

    this.miniMapCamera.name = "mini-map-camera";
    this.miniMapCamera.width = "100px";
    this.miniMapCamera.height = "75px";
    this.miniMapCamera.right = "25px";
    this.miniMapCamera.bottom = "25px";
    this.miniMapCamera.backgroundEnabled = true;
    this.miniMapCamera.backgroundColor = "#555555";

    this.engine.layerAdd(this.miniMapCamera);

    // finish
    this.jsonRpcClient.connect();
    this.engine.start();
    this.loadMap();
    this.mainCamera.center();
  }

  public loadMap(): void {
    // TODO: this is all fake
    this.scene.tileWidth = 32;
    this.scene.tileHeight = 32;
    this.scene.sceneWidth = 10;
    this.scene.sceneHeight = 8;
  }
}
