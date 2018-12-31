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
        const request = JSON.parse(data);
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

        const responseData = JSON.stringify(response);
        
        return send(responseData);
    }
}

module.exports = MoleServer;
