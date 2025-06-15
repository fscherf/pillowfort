import { StatsLayer } from "@/2d/rendering/layers/stats";
import { JsonRpcClient } from "@/json-rpc/client";
import { Camera } from "@/2d/rendering/camera";
import { Scene } from "@/2d/rendering/scene";
import { App } from "@/2d/rendering/app";

export class Game {
  public rootElement: HTMLElement;

  public jsonRpcClient: JsonRpcClient;
  public app: App;
  public statsLayer: StatsLayer;
  public scene: Scene;
  public mainCamera: Camera;
  public miniMapCamera: Camera;

  constructor({ rootElement }: { rootElement: HTMLElement }) {

    // setup JSON RPC client
    this.jsonRpcClient = new JsonRpcClient();

    this.jsonRpcClient.connect({
      autoReconnect: true,
      autoReconnectDelay: 1,
    });

    // setup app
    this.app = new App({
      rootElement: rootElement,
    });

    this.app.autoScale = true;

    // setup stats layer
    this.statsLayer = new StatsLayer();

    this.statsLayer.name = "stats";
    this.statsLayer.zIndex = -1; // make sure it is always on top
    this.statsLayer.showFps = true;
    this.statsLayer.showTps = true;
    this.statsLayer.showCorners = true;

    this.app.layerAdd(this.statsLayer);

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
    this.mainCamera.cursorEnabled = true;
    this.mainCamera.cursorColor = "#FF0000";

    this.app.layerAdd(this.mainCamera);

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

    this.app.layerAdd(this.miniMapCamera);

    // finish
    this.loadMap();
  }

  public loadMap(): void {
    // TODO: this is all fake
    this.scene.tileWidth = 32;
    this.scene.tileHeight = 32;
    this.scene.sceneWidth = 10;
    this.scene.sceneHeight = 8;
  }
}
