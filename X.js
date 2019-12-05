const errorCodes = require('./errorCodes');

class Base extends Error {
    constructor(args) {
        super();

        if (!args.code) throw new Error('Code required');
        if (!args.message) throw new Error('Message required');

        this.code = args.code;
        this.message = args.message;

        if(args.data !== undefined) this.data = args.data;
    }
}

class MethodNotFound extends Base {
    constructor(data) {
        super({
            code: errorCodes.METHOD_NOT_FOUND,
            message: 'Method not found',
            data: data
        });
    }
}

class InvalidParams extends Base {
    constructor(data) {
        super({
            code: errorCodes.INVALID_PARAMS,
            message: 'Invalid params',
            data: data
        });
    }
}

class InternalError extends Base {
    constructor(data) {
        super({
            code: errorCodes.INTERNAL_ERROR,
            message: 'Internal error',
            data: data
        });
    }
}

class ParseError extends Base {
    constructor(data) {
        super({
            code: errorCodes.PARSE_ERROR,
            message: 'Parse error',
            data: data
        });
    }
}

class InvalidRequest extends Base {
    constructor(data) {
        super({
            code: errorCodes.INVALID_REQUEST,
            message: 'Invalid request',
            data: data
        });
    }
}


class ServerError extends Base {
    
}

class RequestTimout extends ServerError {
    constructor(data) {
        super({
            code: -32001,
            message: 'Request exceeded maximum execution time',
            data: data
        });
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
    RequestTimout
};
