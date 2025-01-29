class EventEmitterTransportClient {
    constructor({ emitter, inTopic, outTopic }) {
        this.emitter = emitter;
        this.inTopic = inTopic;
        this.outTopic = outTopic;
        this.requestHandler = () => {};
    }

    onData(callback) {
        this.requestHandler = callback;

        this.emitter.on(this.inTopic, this.requestHandler);
    }

    shutdown() {
        this.emitter.off(this.inTopic, this.requestHandler);
    }

    async sendData(data) {
        return this.emitter.emit(this.outTopic, data);
    }
}

module.exports = EventEmitterTransportClient;
