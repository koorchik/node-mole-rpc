import {
    ExposedMethods,
    MethodParams,
    Mode,
    MethodName,
    RequestObject,
    TransportClient,
    MethodResult,
    MethodError,
    ResponseObject,
    isErrorResponse,
    isSuccessfulResponse
} from './types';
import * as X from './X';
import * as errorCodes from './errorCodes';


type PendingRequest<Methods extends ExposedMethods, Method extends MethodName<Methods>> =
    BatchPendingRequest<Methods, Method>
    | SinglePendingRequest<Methods, Method>;

interface SinglePendingRequest<Methods extends ExposedMethods, Method extends MethodName<Methods>> {
    resolve: (result: MethodResult<Methods, Method>) => void;
    reject: (error: MethodError) => void;
    sentObject: RequestObject<Methods, Method>;
}

interface BatchPendingRequest<Methods extends ExposedMethods, Method extends MethodName<Methods>> {
    resolve: (result: Array<null | { success: true; result: MethodResult<Methods, Method> } | { success: false; result: Error } | { success: false; error: Error }>) => void;
    reject: (error: MethodError) => void;
    sentObject: Array<RequestObject<Methods, Method>>;
}

class MoleClient<Methods extends ExposedMethods> {
    readonly requestTimeout: number;
    private readonly pendingRequest: { [key: string]: PendingRequest<Methods, keyof Methods> };
    private initialized: boolean;
    private transport: TransportClient;

    constructor({ transport, requestTimeout = 20000 }: { transport: TransportClient, requestTimeout?: number }) {
        if (!transport) throw new Error('TRANSPORT_REQUIRED');
        this.transport = transport;

        this.requestTimeout = requestTimeout;

        this.pendingRequest = {};
        this.initialized = false;
    }

    async callMethod<Method extends keyof Methods>(method: Method, params: MethodParams<Methods, Method>): Promise<MethodResult<Methods, Method>> {
        await this._init();

        const request = this._makeRequestObject({ method, params });
        return this._sendRequest({ object: request, id: request.id });
    }

    async notify<Method extends keyof Methods>(method: Method, params: MethodParams<Methods, Method>): Promise<true> {
        await this._init();

        const request = this._makeRequestObject({ method, params, mode: 'notify' });
        await this.transport.sendData(JSON.stringify(request));
        return true;
    }

    async runBatch(calls) {
        const batchId = this._generateId();
        let onlyNotifications = true;

        const batchRequest = [];

        for (const [method, params, mode] of calls) {
            const request = this._makeRequestObject({ method, params, mode, batchId });

            if (request.id) {
                onlyNotifications = false;
            }

            batchRequest.push(request);
        }

        return onlyNotifications
            ? this.transport.sendData(JSON.stringify(batchRequest))
            : this._sendRequest({ object: batchRequest, id: batchId });
    }

    async _init(): Promise<void> {
        if (this.initialized) return;

        await this.transport.onData(this._processResponse.bind(this));

        this.initialized = true;
    }

    private _sendRequest<Method extends keyof Methods>(params: { object: Array<RequestObject<Methods, Method>>; id: string }): Promise<Array<MethodResult<Methods, Method>>>;
    private _sendRequest<Method extends keyof Methods>(params: { object: RequestObject<Methods, Method>; id: string }): Promise<MethodResult<Methods, Method>>;
    private _sendRequest<Method extends keyof Methods>(params: { object: RequestObject<Methods, Method> | Array<RequestObject<Methods, Method>>; id: string }): Promise<MethodResult<Methods, Method> | Array<MethodResult<Methods, Method>>> {
        const { object, id } = params;
        const data = JSON.stringify(object);

        return new Promise((resolve, reject) => {
            this.pendingRequest[id] = {
                resolve,
                reject,
                sentObject: object
            } as BatchPendingRequest<Methods, Method> | SinglePendingRequest<Methods, Method>;

            setTimeout(() => {
                if (this.pendingRequest[id]) {
                    delete this.pendingRequest[id];

                    reject(new X.RequestTimout());
                }
            }, this.requestTimeout);

            return this.transport.sendData(data).catch(error => {
                delete this.pendingRequest[id];
                reject(error); // TODO new X.InternalError()
            });
        });
    }

    private _processResponse(data: string): void {
        const response: ResponseObject<any, any> | Array<ResponseObject<any, any>> = JSON.parse(data);

        if (Array.isArray(response)) {
            this._processBatchResponse(response);
        } else {
            this._processSingleCallResponse(response);
        }
    }

    private _processSingleCallResponse<Method extends MethodName<Methods>>(response: ResponseObject<Methods, Method>): void {
        const resolvers = this.pendingRequest[response.id];
        delete this.pendingRequest[response.id];

        if (!resolvers) return;

        if (isSuccessfulResponse(response)) {
            resolvers.resolve(response.result);
        }

        if (isErrorResponse(response)) {
            const errorObject = this._makeErrorObject(response.error);
            resolvers.reject(errorObject);
        }
    }

    private _processBatchResponse<Method extends MethodName<Methods>>(responses: Array<ResponseObject<Methods, Method>>): void {
        let batchId;
        const responseById = {};
        const errorsWithoutId = [];

        for (const response of responses) {
            if (response.id) {
                if (!batchId) {
                    batchId = response.id.split('|')[0];
                }

                responseById[response.id] = response;
            } else if ('error' in response) {
                errorsWithoutId.push(response.error);
            }
        }

        if (!this.pendingRequest[batchId]) return;

        const { sentObject, resolve } = this.pendingRequest[batchId] as BatchPendingRequest<Methods, Method>;
        delete this.pendingRequest[batchId];

        const batchResults: Array<null | { success: true; result: MethodResult<Methods, Method> } | { success: false; result: Error } | { success: false; error: Error }> = [];
        let errorIdx = 0;
        for (const request of sentObject) {
            if (!request.id) {
                // Skip notifications
                batchResults.push(null);
                continue;
            }

            const response = responseById[request.id];

            if (response) {
                if ('result' in response) {
                    batchResults.push({
                        success: true,
                        result: response.result
                    });
                } else {
                    batchResults.push({
                        success: false,
                        result: this._makeErrorObject(response.error)
                    });
                }
            } else {
                batchResults.push({
                    success: false,
                    error: this._makeErrorObject(errorsWithoutId[errorIdx])
                });
                errorIdx++;
            }
        }

        resolve(batchResults);
    }

    private _makeRequestObject<Method extends MethodName<Methods>, Params extends MethodParams<Methods, Method>>(options: { method: Method, params: Params, mode?: Mode, batchId?: string }): RequestObject<Methods, Method> {
        const { method, params, mode = 'callMethod', batchId } = options;
        const request: RequestObject<Methods, Method> = {
            jsonrpc: '2.0',
            method
        };

        if (params && params.length) {
            request.params = params;
        }

        if (mode !== 'notify') {
            request.id = batchId ? `${batchId}|${this._generateId()}` : this._generateId();
        }

        return request;
    }

    private _makeErrorObject(errorData?: { code: number; data?: any, message?: string }): X.Base<number> {
        const errorBuilder = {
            [errorCodes.METHOD_NOT_FOUND]: () => {
                return new X.MethodNotFound();
            },
            [errorCodes.EXECUTION_ERROR]: ({ data }) => {
                return new X.ExecutionError({ data });
            }
        }[errorData?.code];

        return errorBuilder ? errorBuilder(errorData) : new Error(errorData?.message);
    }

    private _generateId(): string {
        // from "nanoid" package
        const alphabet = 'bjectSymhasOwnProp-0123456789ABCDEFGHIJKLMNQRTUVWXYZ_dfgiklquvxz';
        let size = 10;
        let id = '';

        while (0 < size--) {
            id += alphabet[(Math.random() * 64) | 0];
        }

        return id;
    }
}

export = MoleClient;
