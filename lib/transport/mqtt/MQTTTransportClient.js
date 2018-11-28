class MQTTTransportClient {
    constructor({mqttClient, inTopic, outTopic}) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!inTopic) throw new Error('"inTopic" required');
        if (!outTopic) throw new Error('"outTopic" required');

        this.mqttClient  = mqttClient;
        this.inTopic  = inTopic;
        this.outTopic = outTopic;
    }

    async onMessage(callback) {
        this.onMessageCallback = callback;

        await this.mqttClient.subscribe(this.inTopic);

        this.mqttClient.on('message', (topic, data) => {
            if (topic !== this.inTopic) return; 
            this.onMessageCallback(data.toString())
        });
    }

    async send(data) {
        await this.mqttClient.publish(this.outTopic, data);
    }
}

module.exports = MQTTTransportClient;