const nanoid = require('nanoid/non-secure');
const X = require('./X');
const errorCodes = require('./errorCodes');

class MoleClient {
    constructor({transport, requestTimeout=20000}) {
        if (!transport) throw new Error('TRANSPORT_REQUIRED');
        this.transport = transport;

        this.requestTimeout = requestTimeout;

        this.pendingRequest = {};
        this.initialized = false;
    }

    async _init() {
        if (this.initialized) return;

        await this.transport.onMessage(this._processResponse.bind(this));

        this.initialized = true;
    }

    _processResponse(data) {
        const response = JSON.parse(data);
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

    _makeErrorObject(errorData) {
        const errorBuilder = {
            [errorCodes.METHOD_NOT_FOUND]: () => {
                return new X.MethodNotFound();
            }
        }[errorData.code];
        
        return errorBuilder();
    }

    async callMethod(method, params) {
        await this._init();

        const request = {
            jsonrpc: "2.0",
            method,
            params,
            id: nanoid(10),
        };
        
        const data = JSON.stringify(request);

        return new Promise((resolve, reject) => {
            this.pendingRequest[request.id] = {resolve, reject};

            setTimeout(() => {
                if (this.pendingRequest[request.id]) {
                    delete this.pendingRequest[request.id];

                    reject( new X.RequestTimout() );
                }
            }, this.requestTimeout);

            return this.transport.send(data);
        });
    }

    async notify(method, params) {
        await this._init();

        const request = {
            jsonrpc: "2.0",
            method,
            params
        };
        
        const data = JSON.stringify(request);
  
        await this.transport.send(data);
        return true;
    }

    async runBatch(calls) {
        for (const [method, params, mode='callMethod'] of calls) {

        }
    }

    proxify() {
        const callMethodProxy = this._proxifyOwnMethod('callMethod');
        const notifyProxy = this._proxifyOwnMethod('notify');

        return new Proxy(this, {
            get(target, methodName) {
                if (methodName === 'notify') {
                    return notifyProxy;
                } else if (methodName === 'callMethod') {
                    return callMethodProxy;
                } else {
                    return (...params) => target.callMethod.call(target, methodName, params);
                }
            }
        });
    }

    _proxifyOwnMethod(ownMethod) {
        return new Proxy(this[ownMethod].bind(this), {
            get(target, methodName) {
                return (...params) => target.call(null, methodName, params);
            },
            apply(target, _, args) {
                return target.apply(null, args);
            }
        });
    }
}

module.exports = MoleClient;