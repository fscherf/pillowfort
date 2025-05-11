import { JsonRpcClient } from "@/json-rpc/client";

declare const window: {
  jsonRpcClient: JsonRpcClient;
} & Window;

window.addEventListener("load", () => {
  const jsonRpcClient: JsonRpcClient = new JsonRpcClient();

  jsonRpcClient.addNotificationCallback("test", (message) => {
    console.log(">>", message.method, message.params);
  });

  jsonRpcClient.connect();

  // finish
  window.jsonRpcClient = jsonRpcClient;
});
