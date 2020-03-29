export interface TransportServer {
    onData(callback: (data: any) => any): Promise<void>;

    shutdown?: () => Promise<void>;
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

export type ResponseObject = {
    jsonrpc: '2.0',
    id: string
} & (
    { error: { code: number, message: string, data?: any } }
    | { result: any }
    )


export type MethodName<Methods extends ExposedMethods> = keyof Methods;
export type MethodParams<Methods extends ExposedMethods, Method extends MethodName<Methods>> = Parameters<Methods[Method]>
