"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorCodes_1 = require("./errorCodes");
class Base extends Error {
    constructor(args) {
        super();
        if (typeof (args === null || args === void 0 ? void 0 : args.code) === 'undefined')
            throw new Error('Code required');
        if (typeof (args === null || args === void 0 ? void 0 : args.message) === 'undefined')
            throw new Error('Message required');
        this.code = args.code;
        this.message = args.message;
    }
}
exports.Base = Base;
class MethodNotFound extends Base {
    constructor() {
        super({
            code: errorCodes_1.METHOD_NOT_FOUND,
            message: 'Method not found'
        });
    }
}
exports.MethodNotFound = MethodNotFound;
class InvalidParams extends Base {
    constructor() {
        super({
            code: errorCodes_1.INVALID_PARAMS,
            message: 'Invalid params'
        });
    }
}
exports.InvalidParams = InvalidParams;
class InternalError extends Base {
    constructor() {
        super({
            code: errorCodes_1.INTERNAL_ERROR,
            message: 'Internal error'
        });
    }
}
exports.InternalError = InternalError;
class ParseError extends Base {
    constructor() {
        super({
            code: errorCodes_1.PARSE_ERROR,
            message: 'Parse error'
        });
    }
}
exports.ParseError = ParseError;
class InvalidRequest extends Base {
    constructor() {
        super({
            code: errorCodes_1.INVALID_REQUEST,
            message: 'Invalid request'
        });
    }
}
exports.InvalidRequest = InvalidRequest;
class ServerError extends Base {
}
exports.ServerError = ServerError;
class RequestTimout extends ServerError {
    constructor() {
        super({
            code: errorCodes_1.REQUEST_TIMOUT,
            message: 'Request exceeded maximum execution time'
        });
    }
}
exports.RequestTimout = RequestTimout;
class ExecutionError extends ServerError {
    constructor({ data } = { data: null }) {
        super({
            code: errorCodes_1.EXECUTION_ERROR,
            message: 'Method has returned error'
        });
        this.data = data;
    }
}
exports.ExecutionError = ExecutionError;
