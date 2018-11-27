const uuidv4 = require('uuid/v4');

class MoleClient {
    constructor({transport}) {
        if (!transport) throw new Error('TRANSPORT_REQUIRED');
        this.transport = transport;

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
        const resolvers = this.pendingRequest[response.id];

        if (resolvers)  {
            resolvers.resolve(response.result)
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
            return this.transport.send(data);
        });
    }

    async notify(method, ...params) {
        await this._init();
        const request = this._prepareJsonRpcPayload(method, params);
    }
}

module.exports = MoleClient;