"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
const errorCodes = __importStar(require("./errorCodes"));
function isRequestObject(requestData) {
    return requestData
        && requestData.hasOwnProperty('method')
        || (Array.isArray(requestData)
            && requestData[0]
            && requestData[0].hasOwnProperty('method'));
}
function isContainsMethod(methods, methodName) {
    return typeof methodName === 'string'
        && methods[methodName]
        && typeof methods[methodName] === 'function'
        && methodName !== 'constructor'
        && !methodName.startsWith('_')
        && methods[methodName] !== Object.prototype[methodName];
}
class MoleServer {
    constructor({ transports }) {
        if (!transports)
            throw new Error('TRANSPORT_REQUIRED');
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
        if (transport.shutdown) {
            await transport.shutdown(); // TODO
        }
    }
    async _processRequest(transport, data) {
        const requestData = JSON.parse(data);
        if (!isRequestObject(requestData))
            return;
        const responseData = Array.isArray(requestData)
            ? await Promise.all(requestData.map(request => this._callMethod(request, transport))) // TODO Batch error handling?
            : await this._callMethod(requestData, transport);
        return JSON.stringify(responseData);
    }
    async _callMethod(request, transport) {
        const { method: methodName, params = [], id } = request;
        if (!isContainsMethod(this.methods, methodName)) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: errorCodes.METHOD_NOT_FOUND,
                    message: 'Method not found'
                }
            };
        }
        else {
            this.currentTransport = transport;
            try {
                const result = await this.methods[methodName].apply(this.methods, params);
                if (!id)
                    return; // For notifications do not respond. "" means send nothing
                return {
                    jsonrpc: '2.0',
                    id,
                    result: typeof result === 'undefined' ? null : result
                };
            }
            catch (error) {
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
            // TODO: await ?
            this.registerTransport(transport);
        }
        this.transportsToRegister = [];
    }
}
module.exports = MoleServer;
