const errorCodes = require('./errorCodes');

class MoleServer {
    constructor({ transports }) {
        if (!transports) throw new Error('TRANSPORT_REQUIRED');

        this.transportsToRegister = transports;
        this.methods = {};
    }

    expose(methods) {
        this.methods = methods;
    }

    async registerTransport(transport) {
        await transport.onData(this._processRequest.bind(this, transport));
    }

    async removeTransport(transport) {
        await transport.shutdown(); // TODO
    }

    async _processRequest(transport, data) {
        const requestData = JSON.parse(data);

        const isRequest = requestData.hasOwnProperty('method')
            || (Array.isArray(requestData)
                && requestData[0]
                && requestData[0].hasOwnProperty('method'));

        if (!isRequest) return;

        let responseData;

        if (Array.isArray(requestData)) {
            // TODO Batch error handling?
            responseData = await Promise.all(
                requestData.map(request => this._callMethod(request, transport))
            );
        } else {
            responseData = await this._callMethod(requestData, transport);
        }

        return JSON.stringify(responseData);
    }

    async _callMethod(request, transport) {
        const { method: methodName, params = [], id } = request;

        const methodNotFound =
            !this.methods[methodName] ||
            typeof this.methods[methodName] !== 'function' ||
            methodName === 'constructor' ||
            methodName.startsWith('_') ||
            this.methods[methodName] === Object.prototype[methodName];

        if (methodNotFound) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: errorCodes.METHOD_NOT_FOUND,
                    message: 'Method not found'
                }
            };
        } else {
            this.currentTransport = transport;

            try {
                const result = await this.methods[methodName].apply(this.methods, params);

                if (id !==0 && !id) return; // For notifications do not respond. "" means send nothing

                return {
                    jsonrpc: '2.0',
                    id,
                    result: typeof result === 'undefined' ? null : result
                };
            } catch (error) {
                return {
                    jsonrpc: '2.0',
                    id,
                    error: {
                        code: errorCodes.EXECUTION_ERROR,
                        message: 'Method has returned error',
                        data: (error instanceof Error ? error.message : error)
                    }
                };
            }
        }
    }

    async run() {
        for (const transport of this.transportsToRegister) {
            this.registerTransport(transport);
        }

        this.transportsToRegister = [];
    }
}

module.exports = MoleServer;
