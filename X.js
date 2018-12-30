const errorCodes = require('./errorCodes');

class Base extends Error {
    constructor(data = {}) {
        super();

        if (!data.code) throw new Error('Code required');
        if (!data.message) throw new Error('Message required');

        this.code = data.code;
        this.message = data.message;
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

module.exports = {
    Base,
    MethodNotFound
};