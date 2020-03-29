import {
    PARSE_ERROR,
    INVALID_REQUEST,
    METHOD_NOT_FOUND,
    INVALID_PARAMS,
    INTERNAL_ERROR,
    EXECUTION_ERROR,
    REQUEST_TIMOUT
} from './errorCodes';

class Base<ErrorCode extends number> extends Error {
    public readonly code: ErrorCode;

    constructor(args: { code: ErrorCode; message: string; }) {
        super();

        if (typeof args?.code === 'undefined') throw new Error('Code required');
        if (typeof args?.message === 'undefined') throw new Error('Message required');

        this.code = args.code;
        this.message = args.message;
    }
}

class MethodNotFound extends Base<typeof METHOD_NOT_FOUND> {
    constructor() {
        super({
            code: METHOD_NOT_FOUND,
            message: 'Method not found'
        });
    }
}

class InvalidParams extends Base<typeof INVALID_PARAMS> {
    constructor() {
        super({
            code: INVALID_PARAMS,
            message: 'Invalid params'
        });
    }
}

class InternalError extends Base<typeof INTERNAL_ERROR> {
    constructor() {
        super({
            code: INTERNAL_ERROR,
            message: 'Internal error'
        });
    }
}

class ParseError extends Base<typeof PARSE_ERROR> {
    constructor() {
        super({
            code: PARSE_ERROR,
            message: 'Parse error'
        });
    }
}

class InvalidRequest extends Base<typeof INVALID_REQUEST> {
    constructor() {
        super({
            code: INVALID_REQUEST,
            message: 'Invalid request'
        });
    }
}


class ServerError<ErrorCode extends number> extends Base<ErrorCode> {

}

class RequestTimout extends ServerError<typeof REQUEST_TIMOUT> {
    constructor() {
        super({
            code: REQUEST_TIMOUT,
            message: 'Request exceeded maximum execution time'
        });
    }
}

class ExecutionError<Data> extends ServerError<typeof EXECUTION_ERROR> {
    private data: Data;

    constructor({ data }: {data: Data} = {data: null}) {
        super({
            code: EXECUTION_ERROR,
            message: 'Method has returned error'
        });

        this.data = data;
    }
}

export {
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
