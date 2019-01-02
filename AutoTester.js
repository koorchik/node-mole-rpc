const {assert} = require('chai');

const X = require('./X');

const functionsToExpose = require('./AutoTester/exposeFunctions/functionsToExpose');
const positiveTestsData = require('./AutoTester/exposeFunctions/positiveTestsData');
const negativeTestsData = require('./AutoTester/exposeFunctions/negativeTestsData');

class AutoTester {
    constructor({client1, client2, server}) {
        if (!client1) throw new Error('"client1" required');
        if (!client2) throw new Error('"client2" required');
        if (!server) throw new Error('"server" required');

        this.client1 = client1;
        client1.requestTimeout = 1000; // Dirtyhack
        this.client2 = client2;
        client2.requestTimeout = 1000; // Dirtyhack
        this.server  = server;
    }

    async runAllTests() {
        await this._exposeServerMethods();
        
        console.log('Run positive tests for client 1:');
        await this._runPositiveTestsForClient(this.client1, positiveTestsData);

        console.log('Run positive tests for proxified client 1:');
        await this._runPositiveTestsForClient(this.client1.proxify(), positiveTestsData);
        
        console.log('Run proxy positive tests for proxified client 1:');
        await this._runProxifiedPositiveTestsForClient(this.client1.proxify(), positiveTestsData);



        console.log('Run positive tests for client 2:');
        await this._runPositiveTestsForClient(this.client2, positiveTestsData);

        console.log('Run positive tests for proxified client 2:');
        await this._runPositiveTestsForClient(this.client2.proxify(), positiveTestsData);
        
        console.log('Run proxy positive tests for proxified client 2:');
        await this._runProxifiedPositiveTestsForClient(this.client2.proxify(), positiveTestsData);



        
        console.log('Run negative tests for client 1:');
        await this._runNegativeTestsForClient(this.client1, negativeTestsData);

        console.log('Run negative tests for proxified client 1:');
        await this._runNegativeTestsForClient(this.client1.proxify(), negativeTestsData);

        console.log('Run proxy negative tests for proxified client 1:');
        await this._runProxifiedNegativeTestsForClient(this.client1.proxify(), negativeTestsData);



        console.log('Run negative tests for client 2:');
        await this._runNegativeTestsForClient(this.client2, negativeTestsData);

        console.log('Run negative tests for proxified client 2:');
        await this._runNegativeTestsForClient(this.client2.proxify(), negativeTestsData);

        console.log('Run proxy negative tests for proxified client 2:');
        await this._runProxifiedNegativeTestsForClient(this.client2.proxify(), negativeTestsData);

        // TODO Move proxify (or standard) tests out of AutoTester 
    }

    async _exposeServerMethods() {
        this.server.expose(functionsToExpose);
    }

    async _runPositiveTestsForClient(client, positiveTestsData) { 
        for (const {callMethod, args, expectedResult} of positiveTestsData) {
            console.log(`Positive test: calling ${callMethod}`);
            const gotResult = await client.callMethod(callMethod, ...args);
            assert.deepEqual(gotResult, expectedResult);
        }
        console.log('\n');
    }


    async _runProxifiedPositiveTestsForClient(client, positiveTestsData) { 
        for (const {callMethod, args, expectedResult} of positiveTestsData) {
            console.log(`Positive test via proxy: calling ${callMethod}`);
            const gotResult = await client[callMethod](...args);
            assert.deepEqual(gotResult, expectedResult);
        }
        console.log('\n');
    }

    async _runNegativeTestsForClient(client, negativeTestsData) {  
        for (const {callMethod, args, expectedError, expectedClass} of negativeTestsData) {
            try {
                console.log(`Negative test: calling ${callMethod}`);
                await client.callMethod(callMethod, ...args);
                throw new Error(`Method "${callMethod}" should fail but was executed without any error`);
            } catch (gotError) {
                assert.instanceOf(gotError, expectedClass, 'check error class');
                assert.deepEqual(gotError.message, expectedError.message, 'check error message');
                assert.deepEqual(gotError.code, expectedError.code, 'check error code');
            }
        }
        console.log('\n');
    }

    async _runProxifiedNegativeTestsForClient(client, negativeTestsData) {  
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