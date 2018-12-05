const MoleClient = require('../lib/MoleClient');
const MoleServer = require('../lib/MoleServer');
const HTTPTransportClient = require('../lib/transport/http/HTTPTransportClient');
const HTTPTransportServer = require('../lib/transport/http/HTTPTransportServer');

async function main() {
    await runServer();
    await runClients();
}

async function runServer() {
    const server = new MoleServer({
        transports: [
            new HTTPTransportServer({
                listen: '0.0.0.0:3000'
            })
        ],
    });
    
    server.expose({
        getGreeting(name) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(`Hi, ${name}`)
                }, 1000);
            });
        } 
    });
}


async function runClients() {
    const client1 = new MoleClient({
        transport: new HTTPTransportClient({
            mqttClient,
            inTopic: 'toClient/1',
            outTopic: 'fromClient/1'
        }),
    });
    
    const client2 = new MoleClient({
        transport: new HTTPTransportClient({
            mqttClient,
            inTopic: 'toClient/2',
            outTopic: 'fromClient/2'
        }),
    });
    
    console.log(
        'CLIENT 1',
        await client1.callMethod('getGreeting', 'User1')
    );

    console.log(
        'CLIENT 2',
        await client2.callMethod('getGreeting', 'User2')
    );
}

main();