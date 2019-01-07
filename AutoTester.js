const {assert} = require('chai');

const X = require('./X');

const functionsToExpose = require('./AutoTester/exposeFunctions/functionsToExpose');
const positiveTestsData = require('./AutoTester/exposeFunctions/positiveTestsData');
const negativeTestsData = require('./AutoTester/exposeFunctions/negativeTestsData');

class AutoTester {
    constructor({simpleClient, proxifiedClient, server}) {
        if (!simpleClient) throw new Error('"simpleClient" required');
        if (!proxifiedClient) throw new Error('"proxifiedClient" required');
        if (!server) throw new Error('"server" required');

        this.simpleClient = simpleClient;
        this.proxifiedClient = proxifiedClient;
        this.server  = server;
    }

    async runAllTests() {
        await this._exposeServerMethods();
        
        // POSITIVE TESTS
        console.log('Run simple positive tests for simpleClient:');
        await this._runSimplePositiveTestsForClient(this.simpleClient, positiveTestsData);

        console.log('Run simple positive tests for proxifiedClient:');
        await this._runSimplePositiveTestsForClient(this.proxifiedClient, positiveTestsData);

        console.log('Run proxy positive tests for proxifiedClient:');
        await this._runProxyPositiveTestsForClient(this.proxifiedClient, positiveTestsData);

        // NEGATIVE TESTS
        console.log('Run simple negative tests for simpleClient:');
        await this._runSimpleNegativeTestsForClient(this.simpleClient, negativeTestsData);

        console.log('Run simple negative tests for proxifiedClient:');
        await this._runSimpleNegativeTestsForClient(this.proxifiedClient, negativeTestsData);

        console.log('Run proxy negative tests for proxifiedClient:');
        await this._runProxyNegativeTestsForClient(this.proxifiedClient, negativeTestsData);
    }

    async _exposeServerMethods() {
        this.server.expose(functionsToExpose);
    }

    async _runSimplePositiveTestsForClient(client, positiveTestsData) { 
        for (const {callMethod, args, expectedResult} of positiveTestsData) {
            console.log(`Positive test: calling ${callMethod}`);
            const gotResult = await client.callMethod(callMethod, args);
            assert.deepEqual(gotResult, expectedResult);
        }
        console.log('\n');
    }


    async _runProxyPositiveTestsForClient(client, positiveTestsData) { 
        for (const {callMethod, args, expectedResult} of positiveTestsData) {
            console.log(`Positive test via proxy: calling ${callMethod}`);
            const gotResult = await client.callMethod[callMethod](...args);
            assert.deepEqual(gotResult, expectedResult);
        }
        console.log('\n');
    }

    async _runSimpleNegativeTestsForClient(client, negativeTestsData) {  
        for (const {callMethod, args, expectedError, expectedClass} of negativeTestsData) {
            try {
                console.log(`Negative test: calling ${callMethod}`);
                await client.callMethod(callMethod, args);
                throw new Error(`Method "${callMethod}" should fail but was executed without any error`);
            } catch (gotError) {
                assert.instanceOf(gotError, expectedClass, 'check error class');
                assert.deepEqual(gotError.message, expectedError.message, 'check error message');
                assert.deepEqual(gotError.code, expectedError.code, 'check error code');
            }
        }
        console.log('\n');
    }

    async _runProxyNegativeTestsForClient(client, negativeTestsData) {  
        for (const {callMethod, args, expectedError, expectedClass} of negativeTestsData) {
            try {
                console.log(`Negative test via proxy: calling ${callMethod}`);
                await client[callMethod](...args);
                throw new Error(`Method "${callMethod}" should fail but was executed without any error`);
            } catch (gotError) {
                assert.instanceOf(gotError, expectedClass, 'check error class');
                assert.deepEqual(gotError.message, expectedError.message, 'check error message');
                assert.deepEqual(gotError.code, expectedError.code, 'check error code');
            }
        }
        console.log('\n');
    }
}

module.exports = AutoTester;