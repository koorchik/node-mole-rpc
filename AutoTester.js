const {assert} = require('chai');

class AutoTester {
    constructor({client1, client2, server}) {
        if (!client1) throw new Error('"client1" required');
        if (!client2) throw new Error('"client2" required');
        if (!server) throw new Error('"server" required');

        this.client1 = client1;
        this.client2 = client2;
        this.server  = server;
    }

    async runAllTests() {
        await this._exposeServerMethods();
        await this._runPositiveTestsForClient(this.client1);
        await this._runPositiveTestsForClient(this.client2);

        await this._runNegativeTestsForClient(this.client1);
        await this._runNegativeTestsForClient(this.client2);
    }

    async _exposeServerMethods() {
        this.server.expose({
            syncMethodPrimitiveData: (arg1, arg2) => {
                return `args data "${arg1} ${arg2}" from syncMethodPrimitiveData`
            },

            syncMethodComplexData: (...args) => {
                return {
                    from: 'syncMethodComplexData',
                    args
                }
            },

            asyncMethodPrimitiveData: async (arg1, arg2) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(`args data "${arg1} ${arg2}" from asyncMethodPrimitiveData`);
                    }, 500);
                });
            },

            asyncMethodComplexData: async (...args) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve({
                            from: 'asyncMethodComplexData',
                            args
                        });
                    }, 500);
                });
            }, 

            asyncMethodLongRunning: async (arg1, arg2) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(`args data "${arg1} ${arg2}" from asyncMethodLongRunning`);
                    }, 3000);
                });
            },
        });
    }

    async _runPositiveTestsForClient(client) {
        const testData = [
            {
                callMethod: 'syncMethodPrimitiveData',
                args: ['arg1', 123],
                expectedResult: 'args data "arg1 123" from syncMethodPrimitiveData'
            },
            {
                callMethod: 'syncMethodComplexData',
                args: ['arg1', 123],
                expectedResult: {from: 'syncMethodComplexData', args: ['arg1', 123] }
            },
            {
                callMethod: 'asyncMethodPrimitiveData',
                args: ['arg1', 123],
                expectedResult: 'args data "arg1 123" from asyncMethodPrimitiveData'
            },
            {
                callMethod: 'asyncMethodComplexData',
                args: ['arg1', 123],
                expectedResult: {from: 'asyncMethodComplexData', args: ['arg1', 123] }
            },
        ];

        for (const {callMethod, args, expectedResult} of testData) {
            const gotResult = await client.callMethod(callMethod, ...args);
            console.log(gotResult, expectedResult);
            assert.deepEqual(gotResult, expectedResult);
        }
    }

    async _runNegativeTestsForClient(client) {
        const testData = [
            {
                callMethod: 'notExistingMethod',
                args: [],
                expectedError: { code: -32601, message: 'Method not found' }
            },

            {
                callMethod: 'asyncMethodLongRunning',
                args: [],
                expectedError: {
                    code: 'REQUEST_TIMEOUT', 
                    message: 'Request exceeded maximum execution time'
                }
            }
        ];

        for (const {callMethod, args, expectedError} of testData) {
            try {
                await client.callMethod(callMethod, ...args);
            } catch (gotError) {
                console.log(gotError, expectedError)
                assert.deepEqual(gotError, expectedError);
            }
        }
    }
}

module.exports = AutoTester;