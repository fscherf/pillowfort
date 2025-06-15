import { Layer } from "@/2d/rendering/layer";

export class Scene extends Layer {
  // layer configuration
  public visible: boolean = false;

  // state
  public running: boolean = false;
  public tileWidth: number;
  public tileHeight: number;
  public sceneWidth: number;
  public sceneHeight: number;

  public tick(timeDelta: number): void {
    if (!this.running) {
      return;
    }
  }
}
