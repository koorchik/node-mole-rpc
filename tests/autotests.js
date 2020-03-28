const AutoTester = require('mole-rpc-autotester');

const MoleClient = require('../src/MoleClient');
const MoleClientProxified = require('../src/MoleClientProxified');
const MoleServer = require('../src/MoleServer');
const X = require('../src/X');


const TransportClient = require('./TransportClient');
const TransportServer = require('./TransportServer');

const EventEmitter = require('events');

async function main() {
    const emitter = new EventEmitter();

    const server = await prepareServer(emitter);
    const clients = await prepareClients(emitter);

    const autoTester = new AutoTester({
        X,
        server,
        simpleClient: clients.simpleClient,
        proxifiedClient: clients.proxifiedClient
    });

    await autoTester.runAllTests();
}

async function prepareServer(emitter) {
    return new MoleServer({
        transports: [
            new TransportServer({
                emitter,
                inTopic: 'fromClient1',
                outTopic: 'toClient1'
            }),
            new TransportServer({
                emitter,
                inTopic: 'fromClient2',
                outTopic: 'toClient2'
            })
        ]
    });
}

async function prepareClients(emitter) {
    const simpleClient = new MoleClient({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClient({
            emitter,
            inTopic: 'toClient1',
            outTopic: 'fromClient1'
        })
    });

    const proxifiedClient = new MoleClientProxified({
        requestTimeout: 1000, // autotester expects this value
        transport: new TransportClient({
            emitter,
            inTopic: 'toClient2',
            outTopic: 'fromClient2'
        })
    });

    return { simpleClient, proxifiedClient };
}

main().then(console.log, console.error);
