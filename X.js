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
    constructor({ message = 'Internal error', data = null } = {}) {
        super({
            code: errorCodes.INTERNAL_ERROR,
            message
        });

        this.data = data;
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
            code: errorCodes.REQUEST_TIMEOUT,
            message: 'Request exceeded maximum execution time'
        });
    }
}

// For backward compatibility of RequestTimout class
class RequestTimeout extends RequestTimout {

}

class ExecutionError extends ServerError {
    constructor({ data = null } = {}) {
        super({
            code: errorCodes.EXECUTION_ERROR,
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
    RequestTimout, // For backward compatibility
    RequestTimeout,
    ExecutionError
};
