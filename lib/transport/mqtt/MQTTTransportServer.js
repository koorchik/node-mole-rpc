class MQTTTransportServer {
    constructor({mqttClient, inTopic, outTopic}) {
        if (!mqttClient) throw new Error('"mqttClient" required');
        if (!inTopic) throw new Error('"inTopic" required');
        if (!outTopic) throw new Error('"outTopic" required');

        this.mqttClient = mqttClient;
        this.inTopic  = inTopic;
        this.outTopic = outTopic;
    }

    async onMessage(callback) {
        await this.mqttClient.subscribe(this.inTopic);
        this.mqttClient.on('message', (topic, requestData) => { 
            callback(requestData.toString(), (responseData) => {
                const outTopic = 
                    typeof this.outTopic === "function" 
                    ? this.outTopic({inTopic: topic})
                    : this.outTopic;

                this._send(outTopic, responseData)
            })
        });
    }

    _send(outTopic, data) {
        this.mqttClient.publish(outTopic, data);
    }
}

module.exports = MQTTTransportServer;