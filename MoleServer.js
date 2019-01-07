const errorCodes = require('./errorCodes');

class MoleServer {
    constructor({transports}) {
        if (!transports) throw new Error('TRANSPORT_REQUIRED');
        
        this.transports = transports;
        this.methods = {};

        this._init();
    }

    expose(methods) {
        this.methods = methods;
    }

    _init() {
        for (const transport of this.transports) {
            transport.onMessage(this._processRequest.bind(this));
        }
    }

    async _processRequest(data, send) {
        const requestData = JSON.parse(data);
        let responseData;

        if ( Array.isArray(requestData) ) {
            // TODO Batch error handling?
            responseData = await Promise.all(
                requestData.map(request => this._callMethod(request) )
            );
        } else {
            responseData = await this._callMethod(requestData);
        }

        return send(JSON.stringify(responseData));
    }

    async _callMethod(request) {
        const isRequest = request.hasOwnProperty('method');
        if ( ! isRequest ) return;

        const { method: methodName, params = [], id } = request;
        
        const methodNotFound = !this.methods[methodName]  
            || methodName === 'constructor' 
            || methodName.startsWith('_')
            || this.methods[methodName] === Object.prototype[methodName];


        let response = {};

        if (methodNotFound) {
            response = { 
                jsonrpc: "2.0", 
                id,
                error: {
                    code: errorCodes.METHOD_NOT_FOUND,
                    message: 'Method not found'
                } 
            };
        } else {
            const result = await this.methods[methodName].apply(this.methods, params);

            if (!id) {
                send('{}'); // TODO For notifications do not respond. send('') could mean send nothing
            };

            response = { jsonrpc: "2.0", result, id };
        }

        return response;
    }

    async run() {
        return true;
    }
}

module.exports = MoleServer;
