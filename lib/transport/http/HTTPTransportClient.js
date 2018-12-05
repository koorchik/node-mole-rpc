class HTTPTransportClient {
    constructor({mqttClient, inTopic, outTopic}) {
        this.mqttClient  = mqttClient;
        this.inTopic  = inTopic;
        this.outTopic = outTopic;
    }

    async onMessage(callback) {
        this.onMessageCallback = callback;
        await this.mqttClient.subscribe(this.inTopic);
        console.log('SUBSCRIBED_TO', this.inTopic);
        this.mqttClient.on('message', (topic, data) => {
            if (topic !== this.inTopic) return; 
            console.log('CLIENT RECEIVES', topic, data.toString());
            this.onMessageCallback(data.toString())
        });
    }

    async send(data) {
        console.log(`CLIENT SENDS ${this.outTopic}`, data);
        await this.mqttClient.publish(this.outTopic, data);
        console.log('CLIEN SENT');
    }
}

module.exports = HTTPTransportClient;