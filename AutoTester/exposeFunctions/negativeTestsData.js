const X = require('../../X');

module.exports = [
    {
        callMethod: 'notExistingMethod',
        args: [],
        expectedError: { code: -32601, message: 'Method not found' },
        expectedClass: X.MethodNotFound
    },

    {
        callMethod: 'toString',
        args: [],
        expectedError: { code: -32601, message: 'Method not found' },
        expectedClass: X.MethodNotFound
    },

    {
        callMethod: 'constructor',
        args: [],
        expectedError: { code: -32601, message: 'Method not found' },
        expectedClass: X.MethodNotFound
    },

    {
        callMethod: '_privateFunction',
        args: [],
        expectedError: { code: -32601, message: 'Method not found' },
        expectedClass: X.MethodNotFound
    },

    {
        callMethod: 'asyncFunctionLongRunning',
        args: [],
        expectedError: {
            code: -32001, 
            message: 'Request exceeded maximum execution time'
        },
        expectedClass: X.RequestTimout
    }
];