const nanoid = require('nanoid/non-secure');
const X = require('./X');
const errorCodes = require('./errorCodes');
const proxify = require('./proxify');

class MoleClient {
    constructor({transport, requestTimeout=20000}) {
        if (!transport) throw new Error('TRANSPORT_REQUIRED');
        this.transport = transport;

        this.requestTimeout = requestTimeout;

        this.pendingRequest = {};
        this.initialized = false;
    }

    async callMethod(method, params) {
        await this._init();

        const request = this._makeRequestObject({method, params}); 
        const data = JSON.stringify(request);

        return this._makeRequest({data, id: request.id});
    }

    async notify(method, params) {
        await this._init();

        const request = this._makeRequestObject({method, params, mode: 'notify'}); 
        const data = JSON.stringify(request);
  
        await this.transport.send(data);
        return true;
    }

    async runBatch(calls) {
        const batchId = nanoid(10);
        const onlyNotifications = true;

        const requests = [];

        for (const call of calls) {
            const request = this._makeRequestObject({...call, batchId});
            
            if (request.id) {
                onlyNotifications = false;
            }
        }

        const data = JSON.stringify(requests);

        if (onlyNotifications) {
            return this.transport.send(data);
        } else {
            return this._makeRequest({ data, id: batchId });
        }
        
    }

    proxify() {
        return proxify(this);
    }

    async _init() {
        if (this.initialized) return;

        await this.transport.onMessage(this._processResponse.bind(this));

        this.initialized = true;
    }

    _makeRequestObject({method, params, mode, batchId}) {
        const request = {
            jsonrpc: "2.0",
            method
        };

        if (params && params.length) {
            request.params = params
        }

        if (mode !== 'notify') {
            request.id = batchId ? `${batchId}|${nanoid(10)}` : nanoid(10);
        }

        return request;
    }

    _makeErrorObject(errorData) {
        const errorBuilder = {
            [errorCodes.METHOD_NOT_FOUND]: () => {
                return new X.MethodNotFound();
            }
        }[errorData.code];
        
        return errorBuilder();
    }

    _makeRequest({data, id}) {
        return new Promise((resolve, reject) => {
            this.pendingRequest[id] = {resolve, reject};

            setTimeout(() => {
                if (this.pendingRequest[id]) {
                    delete this.pendingRequest[id];

                    reject( new X.RequestTimout() );
                }
            }, this.requestTimeout);

            return this.transport.send(data);
        });
    }

    _processResponse(data) {
        const response = JSON.parse(data);
        // TODO add batch support
        const isSuccessfulResponse = response.hasOwnProperty('result') || false;
        const isErrorResponse = response.hasOwnProperty('error');
        
        if ( !isSuccessfulResponse && !isErrorResponse ) return;

        const resolvers = this.pendingRequest[response.id];
        delete this.pendingRequest[response.id]; // TODO implement timeouts

        if (!resolvers) return;
        
        if (isSuccessfulResponse) {
            resolvers.resolve(response.result)
        } else if (isErrorResponse) {
            const errorObject = this._makeErrorObject(response.error);
            resolvers.reject( errorObject );
        } 
    }
}

module.exports = MoleClient;