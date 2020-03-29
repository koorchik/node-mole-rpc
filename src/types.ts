export interface TransportServer {
    onData(callback: (data: any) => any): Promise<void>;

    shutdown?: () => Promise<void>;
}

export interface TransportClient {
    sendData(data: string): Promise<void>;

    onData(callback: (data: string) => void): Promise<void>;
}

export type MoleClientProxified<Methods extends ExposedMethods> = {
    [Key in Exclude<MethodName<Methods>, 'notify' | 'callMethod' | 'options.requestTimeout'>]: Promise<MethodResult<Methods, Key>>
} & {
    notify: {
        [Key in MethodName<Methods>]: Promise<void>;
    };
    callMethod: {
        [Key in MethodName<Methods>]: Promise<MethodResult<Methods, Key>>;
    };
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

export type ResponseObject<Methods extends ExposedMethods, Method extends MethodName<Methods>> =
    ResultResponseObject<Methods, Method>
    | ErrorResponseObject;

export type ResultResponseObject<Methods extends ExposedMethods, Method extends MethodName<Methods>> = {
    jsonrpc: '2.0';
    id: string;
    result: MethodResult<Methods, Method>;
}

export type ErrorResponseObject = {
    jsonrpc: '2.0';
    id: string;
    error: MethodError;
};

export function isSuccessfulResponse(response: ResponseObject<any, any>): response is ResultResponseObject<any, any> {
    return 'result' in response;
}
export function isErrorResponse(response: ResponseObject<any, any>): response is ErrorResponseObject {
    return 'error' in response;
}

type Await<T> = T extends PromiseLike<infer U> ? U : T

export type MethodName<Methods extends ExposedMethods> = keyof Methods;
export type MethodParams<Methods extends ExposedMethods, Method extends MethodName<Methods>> = Parameters<Methods[Method]>
export type MethodResult<Methods extends ExposedMethods, Method extends MethodName<Methods>> = Await<ReturnType<Methods[Method]>>
export type MethodError = {
    code: number,
    message: string,
    data?: any
}


export type Mode = 'notify' | 'callMethod';
