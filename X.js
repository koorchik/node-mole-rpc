const errorCodes = require('./errorCodes');

class Base extends Error {
    constructor(args = {}) {
        super();

        if (!args.code) throw new Error('Code required');
        if (!args.message) throw new Error('Message required');

        this.code = args.code;
        this.message = args.message;
    }
}

class MethodNotFound extends Base {
    constructor() {
        super({
            code: errorCodes.METHOD_NOT_FOUND,
            message: 'Method not found'
        });
    }
}

class InvalidParams extends Base {
    constructor() {
        super({
            code: errorCodes.INVALID_PARAMS,
            message: 'Invalid params'
        });
    }
}

class InternalError extends Base {
    constructor() {
        super({
            code: errorCodes.INTERNAL_ERROR,
            message: 'Internal error'
        });
    }
}

class ParseError extends Base {
    constructor() {
        super({
            code: errorCodes.PARSE_ERROR,
            message: 'Parse error'
        });
    }
}

class InvalidRequest extends Base {
    constructor() {
        super({
            code: errorCodes.INVALID_REQUEST,
            message: 'Invalid request'
        });
    }
}


class ServerError extends Base {
    
}

class RequestTimout extends ServerError {
    constructor() {
        super({
            code: -32001,
            message: 'Request exceeded maximum execution time'
        });
    }
}

class ExecutionError extends ServerError {
    constructor({data = null} = {}) {
        super({
            code: -32002,
            message: 'Method has returned error'
        });

        this.data = data;
    }
}

module.exports = {
    Base,
    MethodNotFound,
    InvalidRequest,
    InvalidParams,
    InternalError,
    ServerError,
    ParseError,
    RequestTimout,
    ExecutionError
};