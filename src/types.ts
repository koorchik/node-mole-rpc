export interface TransportServer {
    onData(callback: (data: any) => any): Promise<void>;

    shutdown?: () => Promise<void>;
}

export interface TransportClient {
    sendData(data: string): Promise<void>;

    onData(callback: (data: string) => void): Promise<void>;
}

export type ExposedMethods = {
    [key: string]: (...args: any[]) => any
}

export interface RequestObject<Methods extends ExposedMethods, Method extends MethodName<Methods>> {
    jsonrpc: '2.0';
    method: Method;
    params?: MethodParams<Methods, Method>;
    id?: string;
}

export type ResultResponseObject<Methods extends ExposedMethods, Method extends MethodName<Methods>> = {
    jsonrpc: '2.0';
    id: string;
    result: MethodResult<Methods, Method>;
}

export type ErrorResponseObject = {
    jsonrpc: '2.0',
    id: string
    error: {
        code: number,
        message: string,
        data?: any
    }
};


type Await<T> = T extends PromiseLike<infer U> ? U : T

export type MethodName<Methods extends ExposedMethods> = keyof Methods;
export type MethodParams<Methods extends ExposedMethods, Method extends MethodName<Methods>> = Parameters<Methods[Method]>
export type MethodResult<Methods extends ExposedMethods, Method extends MethodName<Methods>> = Await<ReturnType<Methods[Method]>>
export type Mode = 'notify' | 'callMethod';
