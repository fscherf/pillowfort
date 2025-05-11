export enum MESSAGE_TYPE {
  REQUEST = "REQUEST",
  NOTIFICATION = "NOTIFICATION",
  RESPONSE = "RESPONSE",
  ERROR = "ERROR",
}

export enum ERROR_TYPE {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}

export type JsonRpcMessagePayload = {
  jsonrpc: string;
  id?: number | string | null;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};

export type JsonRpcMessage = {
  errorType: ERROR_TYPE | null;
  errorMessage: string;
  messageType: MESSAGE_TYPE | null;
  message: JsonRpcMessagePayload;
};

export function decodeMessage(messageString: string): JsonRpcMessage {
  let message: JsonRpcMessagePayload;

  try {
    message = JSON.parse(messageString) as JsonRpcMessagePayload;
  } catch {
    // raw message is no valid JSON
    return {
      errorType: ERROR_TYPE.PARSE_ERROR,
      errorMessage: "Parse error",
      messageType: null,
      message: null,
    };
  }

  // every JSON RPC message has to contain {"jsonrpc": "2.0"}
  if (message.jsonrpc !== "2.0") {
    return {
      errorType: ERROR_TYPE.INVALID_REQUEST,
      errorMessage: "Missing required 'jsonrpc' field.",
      messageType: null,
      message: null,
    };
  }

  let messageType: MESSAGE_TYPE | null = null;

  // request / notification
  if ("method" in message) {
    // methods have to be strings
    if (typeof message.method !== "string") {
      return {
        errorType: ERROR_TYPE.INVALID_REQUEST,
        errorMessage: "Method has to be a string.",
        messageType: null,
        message: null,
      };
    }

    // request
    if ("id" in message) {
      // ids have to be a string, number
      if (
        typeof message.id !== "string" &&
        typeof message.id !== "number" &&
        message.id !== null
      ) {
        return {
          errorType: ERROR_TYPE.PARSE_ERROR,
          errorMessage: "Invalid id field: must be a string, number, or null.",
          messageType: null,
          message: null,
        };
      }

      messageType = MESSAGE_TYPE.REQUEST;

      // notification
    } else {
      messageType = MESSAGE_TYPE.NOTIFICATION;
    }

    // response
  } else if ("result" in message) {
    // every result must have an id
    if (!("id" in message)) {
      return {
        errorType: ERROR_TYPE.PARSE_ERROR,
        errorMessage: "Missing id field.",
        messageType: null,
        message: null,
      };
    }

    // ids have to be a string, number
    if (
      typeof message.id !== "string" &&
      typeof message.id !== "number" &&
      message.id !== null
    ) {
      return {
        errorType: ERROR_TYPE.PARSE_ERROR,
        errorMessage: "Invalid id field: must be a string, number, or null.",
        messageType: null,
        message: null,
      };
    }

    messageType = MESSAGE_TYPE.RESPONSE;

    // error
  } else if ("error" in message) {
    messageType = MESSAGE_TYPE.ERROR;
  }

  return {
    errorType: null,
    errorMessage: "",
    messageType: messageType,
    message: message,
  };
}

export function encodeRequest(
  method: string,
  id: string | number | null,
  params?: unknown,
): string {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: id,
    method: method,
    params: params,
  });
}

export function encodeNotification(topic: string, data?: unknown): string {
  return JSON.stringify({
    jsonrpc: "2.0",
    method: topic,
    params: data,
  });
}
