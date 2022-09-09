const MoleClient = require('../MoleClient');
const MoleServer = require('../MoleServer');

const TransportClient = require('./TransportClient');
const TransportServer = require('./TransportServer');

const EventEmitter = require('../EventEmitter');
const { sleep, assertIsTrue } = require('./utils');

async function main() {
    const emitter = new EventEmitter();

    const server = await prepareServer(emitter);
    const client = await prepareClient(emitter);

    await server.run();

    await testPingPong({ client, emitter });

    client.shutdown();

    console.log('Ping pong tests passed successfully');
}

async function testPingPong({ client, emitter }) {
    let serverAvailable = true;

    client.on(MoleClient.EVENTS.SERVER_AVAILABLE, () => {
        serverAvailable = true;
    });

    client.on(MoleClient.EVENTS.SERVER_UNAVAILABLE, () => {
        serverAvailable = false;
    });

    emitter.pause();
    await sleep(100);

    assertIsTrue(!serverAvailable, 'Server should be unavailable if transport doesn`t work');

    emitter.resume();
    await sleep(100);

    assertIsTrue(serverAvailable, 'Server should be available if transport works');
}

async function prepareServer(emitter) {
    return new MoleServer({
        transports: [
            new TransportServer({
                emitter,
                inTopic: 'fromClient1',
                outTopic: 'toClient1'
            })
        ]
    });
}

async function prepareClient(emitter) {
    const simpleClient = new MoleClient({
        transport: new TransportClient({
            emitter,
            inTopic: 'toClient1',
            outTopic: 'fromClient1'
        }),
        ping: true,
        pingInterval: 50,
        pingTimeout: 10
    });

    return simpleClient;
}

main().then(console.log, console.error);
