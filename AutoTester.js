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
        await this._runSimplePositiveTests(this.simpleClient, positiveTestsData);

        console.log('Run positive batch tests for simpleClient:');
        await this._runBatchTests(this.simpleClient, positiveTestsData);

        console.log('Run simple positive tests for proxifiedClient:');
        await this._runSimplePositiveTests(this.proxifiedClient, positiveTestsData);

        console.log('Run proxy positive tests for proxifiedClient:');
        await this._runProxyPositiveTests(this.proxifiedClient, positiveTestsData);

        // NEGATIVE TESTS
        console.log('Run simple negative tests for simpleClient:');
        await this._runSimpleNegativeTests(this.simpleClient, negativeTestsData);

        console.log('Run simple negative tests for proxifiedClient:');
        await this._runSimpleNegativeTests(this.proxifiedClient, negativeTestsData);

        console.log('Run proxy negative tests for proxifiedClient:');
        await this._runProxyNegativeTests(this.proxifiedClient, negativeTestsData);
    }

    async _exposeServerMethods() {
        this.server.expose(functionsToExpose);
    }

    async _runSimplePositiveTests(client, positiveTestsData) { 
        for (const {callMethod, args, expectedResult} of positiveTestsData) {
            console.log(`Positive test: calling ${callMethod}`);
            const gotResult = await client.callMethod(callMethod, args);
            assert.deepEqual(gotResult, expectedResult);
        }
        console.log('\n');
    }

    async _runBatchTests(client, positiveTestsData) {
        const requestData = [];
        const expectedResults = [];

        for (const {callMethod, args, expectedResult} of positiveTestsData) {
            requestData.push([callMethod, args]);
            expectedResults.push({
                success: true,
                result: expectedResult
            });
        }

        console.log(`Positive test: calling batch`);
        const gotResults = await client.runBatch(requestData);
        assert.deepEqual(gotResults, expectedResults);

        console.log('\n');
    }


    async _runProxyPositiveTests(client, positiveTestsData) { 
        for (const {callMethod, args, expectedResult} of positiveTestsData) {
            console.log(`Positive test via proxy: calling ${callMethod}`);
            const gotResult = await client.callMethod[callMethod](...args);
            assert.deepEqual(gotResult, expectedResult);
        }
        console.log('\n');
    }

    async _runSimpleNegativeTests(client, negativeTestsData) {  
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

    async _runProxyNegativeTests(client, negativeTestsData) {  
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