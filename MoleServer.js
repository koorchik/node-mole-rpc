const { INTERNAL_METHODS } = require('./constants');
const errorCodes = require('./errorCodes');

const INTERNAL_METHODS_NAMES = Object.values(INTERNAL_METHODS);

class MoleServer {
    constructor({ transports }) {
        if (!transports) throw new Error('TRANSPORT_REQUIRED');

        this.transportsToRegister = transports;
        this.methods = {
            [INTERNAL_METHODS.PING]: this._handlePing
        };
    }

    expose(methods) {
        this.methods = {
            ...methods,
            [INTERNAL_METHODS.PING]: this._handlePing
        };
    }

    async registerTransport(transport) {
        await transport.onData(this._processRequest.bind(this, transport));
    }

    async removeTransport(transport) {
        await transport.shutdown(); // TODO
    }

    async _processRequest(transport, data) {
        let requestData;

        try {
            requestData = JSON.parse(data);
        } catch (error) {
            // Handle cases when server receives broken JSON
            return;
        }

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

        if (!this._isMethodExposed(methodName)) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: errorCodes.METHOD_NOT_FOUND,
                    message: 'Method not found'
                }
            };
        }

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

    _isMethodExposed(methodName) {
        return (
            this.methods[methodName] &&
            typeof this.methods[methodName] === 'function' &&
            methodName !== 'constructor' &&
            (!methodName.startsWith('_') || INTERNAL_METHODS_NAMES.includes(methodName)) &&
            this.methods[methodName] !== Object.prototype[methodName]
        );
    }

    _handlePing() {
        return 'pong';
    }

    async run() {
        for (const transport of this.transportsToRegister) {
            await this.registerTransport(transport);
        }

        this.transportsToRegister = [];
    }
}

module.exports = MoleServer;
