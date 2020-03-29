import {
    ErrorResponseObject,
    ExposedMethods,
    MethodName,
    RequestObject,
    ResultResponseObject,
    TransportServer
} from './types';
import * as errorCodes from './errorCodes';


function isRequestObject(requestData: any): requestData is RequestObject<any, any> | Array<RequestObject<any, any>> {
    return requestData
        && requestData.hasOwnProperty('method')
        || (Array.isArray(requestData)
            && requestData[0]
            && requestData[0].hasOwnProperty('method'));
}

function isContainsMethod<Methods extends ExposedMethods>(methods: Methods, methodName: string | number | symbol): methodName is keyof Methods {
    return typeof methodName === 'string'
        && methods[methodName]
        && typeof this.methods[methodName] === 'function'
        && methodName !== 'constructor'
        && !methodName.startsWith('_')
        && this.methods[methodName] !== Object.prototype[methodName];
}

class MoleServer<Methods extends ExposedMethods> {
    private transportsToRegister: TransportServer[];
    private methods: Partial<Methods>;
    private currentTransport?: TransportServer;

    constructor({ transports }: { transports: TransportServer[] }) {
        if (!transports) throw new Error('TRANSPORT_REQUIRED');

        this.transportsToRegister = transports;
        this.methods = {};
    }

    expose(methods) {
        this.methods = methods;
    }

    async registerTransport(transport: TransportServer): Promise<void> {
        await transport.onData(this._processRequest.bind(this, transport));
    }

    async removeTransport(transport: TransportServer) {
        if (transport.shutdown) {
            await transport.shutdown(); // TODO
        }
    }

    async _processRequest(transport: TransportServer, data: any): Promise<string | undefined> {
        const requestData = JSON.parse(data);

        if (!isRequestObject(requestData)) return;

        const responseData = Array.isArray(requestData)
            ? await Promise.all(requestData.map(request => this._callMethod(request, transport))) // TODO Batch error handling?
            : await this._callMethod(requestData, transport);

        return JSON.stringify(responseData);
    }

    async _callMethod<Method extends MethodName<Methods>>(request: RequestObject<Methods, Method>, transport: TransportServer): Promise<ResultResponseObject<Methods, Method> | ErrorResponseObject> {
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
        } else {
            this.currentTransport = transport;

            try {
                const result = await this.methods[methodName].apply(this.methods, params);

                if (!id) return; // For notifications do not respond. "" means send nothing

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

    async run(): Promise<void> {
        for (const transport of this.transportsToRegister) {
            // TODO: await ?
            this.registerTransport(transport);
        }

        this.transportsToRegister = [];
    }
}

export default MoleServer;
