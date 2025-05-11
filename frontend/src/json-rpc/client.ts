import {
  MESSAGE_TYPE,
  JsonRpcMessagePayload,
  JsonRpcMessage,
  decodeMessage,
  encodeRequest,
  encodeNotification,
} from "@/json-rpc/protocol";

const DEFAULT_PATH: string = "/api/v1/json-rpc";

export class JsonRpcClient {
  public path: string;
  public websocket: WebSocket;

  private messageIdcounter: number = 1;

  private pendingRequests: Map<
    number,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: unknown) => void;
    }
  >;

  private notificationCallbacks: Map<
    string,
    Array<(message: JsonRpcMessagePayload) => void>
  >;

  constructor(path?: string) {
    this.path = path || DEFAULT_PATH;
    this.pendingRequests = new Map();
    this.notificationCallbacks = new Map();
  }

  public connect(
    {
      autoReconnect,
      autoReconnectDelay,
    }: {
      autoReconnect: boolean;
      autoReconnectDelay: number;
    } = {
      autoReconnect: true,
      autoReconnectDelay: 1000,
    },
  ): void {
    let protocol: string = "ws";

    if (window.location.protocol == "https:") {
      protocol = "wss";
    }

    const url: string = `${protocol}://${window.location.host}${this.path}`;

    this.websocket = new WebSocket(url);

    this.websocket.addEventListener("open", () => {
      console.log("JSON RPC: connected");
    });

    this.websocket.addEventListener("close", () => {
      console.log("JSON RPC: disconnected");

      if (autoReconnect) {
        console.log("JSON RPC: trying to reconnect...");

        setTimeout(() => {
          this.connect({
            autoReconnect: autoReconnect,
            autoReconnectDelay: autoReconnectDelay,
          });
        }, autoReconnectDelay);
      }
    });

    this.websocket.addEventListener("message", (event: MessageEvent) => {
      this.handleWebsocketMessage(event.data);
    });
  }

  private handleWebsocketMessage(messageString: string): void {
    const message: JsonRpcMessage = decodeMessage(messageString);

    // response / error
    if (
      message.messageType == MESSAGE_TYPE.RESPONSE ||
      message.messageType == MESSAGE_TYPE.ERROR
    ) {
      const promise = this.pendingRequests.get(message.message.id as number);

      if (message.messageType == MESSAGE_TYPE.RESPONSE) {
        promise.resolve(message.message.result);
      } else {
        promise.reject(message.message.error);
      }

      // notification
    } else if (message.messageType == MESSAGE_TYPE.NOTIFICATION) {
      const callbacks = this.notificationCallbacks.get(message.message.method);

      if (!callbacks) {
        return;
      }

      for (const callback of callbacks) {
        callback(message.message);
      }
    }
  }

  public addNotificationCallback(
    method: string,
    callback: (message: JsonRpcMessagePayload) => void,
  ): void {
    if (!this.notificationCallbacks.has(method)) {
      this.notificationCallbacks.set(method, []);
    }

    this.notificationCallbacks.get(method).push(callback);
  }

  public call(method: string, params?: object): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const messageId: number = this.messageIdcounter;
      const message: string = encodeRequest(method, messageId, params);

      this.messageIdcounter += 1;

      this.pendingRequests.set(messageId, {
        resolve: resolve,
        reject: reject,
      });

      this.websocket.send(message);
    });
  }

  public notify(method: string, params?: object): void {
    const message: string = encodeNotification(method, params);

    this.websocket.send(message);
  }
}
