class EventEmitterTransportServer {
    constructor({ emitter, inTopic, outTopic }) {
        this.emitter = emitter;
        this.inTopic = inTopic;
        this.outTopic = outTopic;
        this.onRequestCallback = () => {};
    }

    onData(callback) {
        this.emitter.on(this.inTopic, async reqData => {
            const respData = await callback(reqData);
            if (!respData) return; // no data means notification

            this.emitter.emit(this.outTopic, respData);
        });
    }
}

module.exports = EventEmitterTransportServer;
