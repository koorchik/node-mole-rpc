const errorCodes = require('./errorCodes');

class MoleServer {
    constructor({ transports }) {
        if (!transports) throw new Error('TRANSPORT_REQUIRED');

        this.transports = transports;
        this.methods = {};
    }

    expose(methods) {
        this.methods = methods;
    }

    async _processRequest(data) {
        const requestData = JSON.parse(data);
        let responseData;

        if (Array.isArray(requestData)) {
            // TODO Batch error handling?
            responseData = await Promise.all(requestData.map(request => this._callMethod(request)));
        } else {
            responseData = await this._callMethod(requestData);
        }

        return JSON.stringify(responseData);
    }

    async _callMethod(request) {
        const isRequest = request.hasOwnProperty('method');
        if (!isRequest) return;

        const { method: methodName, params = [], id } = request;

        const methodNotFound =
            !this.methods[methodName] ||
            typeof this.methods[methodName] !== 'function' ||
            methodName === 'constructor' ||
            methodName.startsWith('_') ||
            this.methods[methodName] === Object.prototype[methodName];

        let response = {};

        if (methodNotFound) {
            response = {
                jsonrpc: '2.0',
                id,
                error: {
                    code: errorCodes.METHOD_NOT_FOUND,
                    message: 'Method not found'
                }
            };
        } else {
            const result = await this.methods[methodName].apply(this.methods, params);

            if (!id) {
                return ''; // For notifications do not respond. "" means send nothing
            }

            response = { jsonrpc: '2.0', result, id };
        }

        return response;
    }

    async run() {
        for (const transport of this.transports) {
            await transport.onRequest(this._processRequest.bind(this));
            await transport.run();
        }
    }
}

module.exports = MoleServer;
