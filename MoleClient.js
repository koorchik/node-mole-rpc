const X = require('./X');
const errorCodes = require('./errorCodes');
const { INTERNAL_METHODS } = require('./constants');

class MoleClient {
    constructor({ transport, requestTimeout = 20000, pingTimeout = 1000 }) {
        if (!transport) throw new Error('TRANSPORT_REQUIRED');

        this.transport = transport;
        this.requestTimeout = requestTimeout;
        this.pingTimeout = pingTimeout;

        this.pendingRequest = {};
        this.initialized = false;
    }

    async init() {
        // It is not required to call this method manually,
        // but it could be useful in case when we want to
        // establish connection before callMethod
        await this._init();
    }

    async callMethod(method, params) {
        await this._init();

        const request = this._makeRequestObject({ method, params });

        return this._sendRequest({ object: request, id: request.id });
    }

    async notify(method, params) {
        await this._init();

        const request = this._makeRequestObject({ method, params, mode: 'notify' });

        await this.transport.sendData(JSON.stringify(request));

        return true;
    }

    async ping() {
        await this._init();

        const request = this._makeRequestObject({
            method: INTERNAL_METHODS.PING,
            params: [ 'ping' ]
        });

        return this._sendRequest({ object: request, id: request.id, timeout: this.pingTimeout });
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

        if (onlyNotifications) {
            return this.transport.sendData(JSON.stringify(batchRequest));
        } else {
            return this._sendRequest({ object: batchRequest, id: batchId });
        }
    }

    async _init() {
        if (this.initialized) return;

        await this.transport.onData(this._processResponse.bind(this));

        this.initialized = true;
    }

    _sendRequest({ object, id, timeout = this.requestTimeout }) {
        const data = JSON.stringify(object);

        return new Promise((resolve, reject) => {
            this.pendingRequest[id] = { resolve, reject, sentObject: object };

            setTimeout(() => {
                if (this.pendingRequest[id]) {
                    delete this.pendingRequest[id];

                    reject(new X.RequestTimeout());
                }
            }, timeout);

            return this.transport.sendData(data).catch(error => {
                delete this.pendingRequest[id];
                reject(error); // TODO new X.InternalError()
            });
        });
    }

    _processResponse(data) {
        const response = JSON.parse(data);

        if (Array.isArray(response)) {
            this._processBatchResponse(response);
        } else {
            this._processSingleCallResponse(response);
        }
    }

    _processSingleCallResponse(response) {
        const isSuccessfulResponse = response.hasOwnProperty('result') || false;
        const isErrorResponse = response.hasOwnProperty('error');

        if (!isSuccessfulResponse && !isErrorResponse) return;

        const resolvers = this.pendingRequest[response.id];
        delete this.pendingRequest[response.id];

        if (!resolvers) return;

        if (isSuccessfulResponse) {
            resolvers.resolve(response.result);
        } else if (isErrorResponse) {
            const errorObject = this._makeErrorObject(response.error);
            resolvers.reject(errorObject);
        }
    }

    _processBatchResponse(responses) {
        let batchId;
        const responseById = {};
        const errorsWithoutId = [];

        for (const response of responses) {
            if (response.id) {
                if (!batchId) {
                    batchId = response.id.split('|')[0];
                }

                responseById[response.id] = response;
            } else if (response.error) {
                errorsWithoutId.push(response.error);
            }
        }

        if (!this.pendingRequest[batchId]) return;

        const { sentObject, resolve } = this.pendingRequest[batchId];
        delete this.pendingRequest[batchId];

        const batchResults = [];
        let errorIdx = 0;
        for (const request of sentObject) {
            if (!request.id) {
                // Skip notifications
                batchResults.push(null);
                continue;
            }

            const response = responseById[request.id];

            if (response) {
                const isSuccessfulResponse = response.hasOwnProperty('result') || false;

                if (isSuccessfulResponse) {
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

    _makeRequestObject({ method, params, mode, batchId }) {
        const request = {
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

    _makeErrorObject(errorData) {
        const errorBuilder = {
            [errorCodes.METHOD_NOT_FOUND]: () => {
                return new X.MethodNotFound();
            },
            [errorCodes.EXECUTION_ERROR]: ({ data }) => {
                return new X.ExecutionError({ data });
            }
        }[errorData.code];

        return errorBuilder(errorData);
    }

    _generateId() {
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

module.exports = MoleClient;
