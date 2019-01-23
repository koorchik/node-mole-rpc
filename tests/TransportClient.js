class EventEmitterTransportClient {
    constructor({ emitter, inTopic, outTopic }) {
        this.emitter = emitter;
        this.inTopic = inTopic;
        this.outTopic = outTopic;
    }

    onData(callback) {
        this.emitter.on(this.inTopic, callback);
    }

    async sendData(data) {
        return this.emitter.emit(this.outTopic, data);
    }
}

module.exports = EventEmitterTransportClient;
