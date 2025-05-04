import { App } from "@/rendering/2d/app";

export class Layer {
  public app: App;

  // configuration
  public visible: boolean = true;

  // meta data
  public name: string = "";
  public zIndex: number = 0;

  // App entrypoints
  public tick(timeDelta: number): void {}

  public render(timeDelta: number): void {}
}
