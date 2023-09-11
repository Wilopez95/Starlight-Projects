declare namespace PrintNodeClient {
  class HTTPAuth {}

  class ApiKey extends HTTPAuth {
    constructor(key: string);
  }

  interface HTTPOptions {
    timeoutDuration?: number;
    server?: string;
  }

  interface ScaleParams {
    computerId?: number;
    deviceName?: string;
    deviceNum?: number;
  }

  interface ScaleResponse {
    mass: [number | null, number | null];
    deviceName: string;
    deviceNum: number;
    port: string;
    count: number | null;
    measurement: Record<string, any>;
    clientReportedCreateTimestamp: string;
    ntpOffset: string | null;
    ageOfData: number;
    computerId: number;
    vendor: string;
    product: string;
    vendorId: number;
    productId: number;
  }

  enum ComputerState {
    Connected = 'connected',
    Disconnected = 'disconnected',
  }

  interface ComputerResponse {
    id: number;
    name: string;
    inet: string | null;
    inet6: string | null;
    hostname: string | null;
    version: string | null;
    jre: string | null;
    createTimestamp: string;
    state: ComputerState;
  }

  interface ComputerParams {
    computerSet?: string;
  }

  class HTTP {
    options: HTTPOptions;
    static ApiKey = ApiKey;
    constructor(key: ApiKey, options?: HTTPOptions);

    scales(
      options: HTTPOptions | undefined,
      params: ScaleParams,
    ): Promise<ScaleResponse | ScaleResponse[]>;
    computers(options?: HTTPOptions, params?: ComputerParams): Promise<ComputerResponse[]>;
  }

  interface WebSocketOptions {
    apiKey: string;
    authTimeout?: number;
    centralOrigin?: string;
    ackTimeout?: number;
    server?: string;
    version?: string;
  }
  interface AuthData {
    accountId: number;
    permissions: number;
    maxSubscriptions: number;
    currentWebsockets: number;
    maxWebsockets: number;
  }
  interface ErrorResponse {
    error: string;
  }
  type AuthCallbackFn = (payload: AuthData | ErrorResponse) => void;
  type ErrorCallbackFn = (message: string, detail: any) => void;

  interface SubscribeOptions {
    data: any;
    context: any;
  }

  class WebSocket {
    constructor(
      options: WebSocketOptions,
      authCallback?: AuthCallbackFn,
      errorCallback?: ErrorCallbackFn,
    );

    isConnected(): boolean;
    subscribe(topic: string | string[], fn: Function, options?: SubscribeOptions): this;
    unsubscribe(fnOrTopic: string | Function): number;
    removeServerSubscription(id: number): number;
    getScales(options: ScaleParams, callback: Function, ctx?: any): number;
    getComputerConnections(options: ScaleParams, callback: Function, ctx?: any): number;
    closeSocket(): void;
  }
}

declare const PrintNode = {
  HTTP: PrintNodeClient.HTTP,
  WebSocket: PrintNodeClient.WebSocket,
};
