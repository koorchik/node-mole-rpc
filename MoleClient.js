const uuidv4 = require('uuid/v4');

class MoleClient {
    constructor({ transport, pendingRequestTimeout = 1000 }) {
        if (!transport) throw new Error('TRANSPORT_REQUIRED');
        this.transport = transport;

        this.pendingRequest = {};
        this.pendingRequestTimeout = pendingRequestTimeout;
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

        if (!isSuccessfulResponse && !isErrorResponse) return;

        const resolvers = this.pendingRequest[response.id];
        delete this.pendingRequest[response.id]; // TODO implement timeouts

        if (!resolvers) return;

        if (isSuccessfulResponse) {
            resolvers.resolve(response.result)
        } else if (isErrorResponse) {
            resolvers.reject(new Error(response.error.message));
        }
    }

    async callMethod(method, ...params) {
        await this._init();

        const request = {
            jsonrpc: "2.0",
            method,
            params,
            id: uuidv4(),
        };

        const data = JSON.stringify(request);


        return new Promise((resolve, reject) => {
            this.pendingRequest[request.id] = { resolve, reject };
            setTimeout(() => {
                    reject(new Error('Endpoint Disabled'));
                    delete this.pendingRequest[request.id];
                }, 
                this.pendingRequestTimeout);
            return this.transport.send(data);
        });
    }

    async notify(method, ...params) {
        await this._init();
        const request = this._prepareJsonRpcPayload(method, params);
    }
}

module.exports = MoleClient;