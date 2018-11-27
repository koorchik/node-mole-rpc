const MoleClient = require('../lib/MoleClient');
const MoleServer = require('../lib/MoleServer');
const MQTTTransportClient = require('../lib/transport/mqtt/MQTTTransportClient');
const MQTTTransportServer = require('../lib/transport/mqtt/MQTTTransportServer');
const MQTT = require("async-mqtt");

async function main() {
    await runServer();
    await runClients();
}

async function runServer() {
    const mqttClient = MQTT.connect("tcp://localhost:1883");
    await waitForEvent(mqttClient, 'connect');

    const server = new MoleServer({
        transports: [
            new MQTTTransportServer({
                mqttClient,
                inTopic: 'fromClient/+',
                outTopic: ({inTopic}) => inTopic.replace('fromClient', 'toClient')
                // outTopic: 'toClient/1' // static outTopic
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
    const mqttClient = MQTT.connect("tcp://localhost:1883");
    await waitForEvent(mqttClient, 'connect');

    const client1 = new MoleClient({
        transport: new MQTTTransportClient({
            mqttClient,
            inTopic: 'toClient/1',
            outTopic: 'fromClient/1'
        }),
    });
    
    const client2 = new MoleClient({
        transport: new MQTTTransportClient({
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

function waitForEvent(emitter, eventName) {
    return new Promise((resolve, reject) => {
        emitter.on(eventName, resolve);
    }); 
}

main();