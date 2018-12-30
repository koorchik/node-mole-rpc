const X = require('../../X');

module.exports = [
    {
        callMethod: 'notExistingMethod',
        args: [],
        expectedError: { code: -32601, message: 'Method not found' },
        expectedClass: X.MethodNotFound

    },

    {
        callMethod: 'asyncFunctionLongRunning',
        args: [],
        expectedError: {
            code: 'REQUEST_TIMEOUT', 
            message: 'Request exceeded maximum execution time'
        },
        expectedClass: Object // TODO replace with error class
    }
];