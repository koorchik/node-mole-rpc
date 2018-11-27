class EventEmitterTransportClient {
    constructor({emitter, inTopic, outTopic}) {
        this.emitter  = emitter;
        this.inTopic  = inTopic;
        this.outTopic = outTopic;
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
        this.emitter.on(this.inTopic, this.onMessageCallback);
    }

    async send(data) {
        return this.emitter.emit(this.outTopic, data);
    }
}

module.exports = EventEmitterTransportClient;