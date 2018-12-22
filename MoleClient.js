const uuidv4 = require('uuid/v4');

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
            console.log(response.error);
            resolvers.reject( response.error );
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
            this.pendingRequest[request.id] = {resolve, reject};

            setTimeout(() => {
                if (this.pendingRequest[request.id]) {
                    delete this.pendingRequest[request.id];

                    reject({
                        code: 'REQUEST_TIMEOUT', 
                        message: 'Request exceeded maximum execution time'
                    });
                }
            }, this.requestTimeout);

            return this.transport.send(data);
        });
    }

    async notify(method, ...params) {
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
}

module.exports = MoleClient;