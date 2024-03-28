class EventEmitterTransportServer {
    constructor({ emitter, inTopic, outTopic }) {
        this.emitter = emitter;
        this.inTopic = inTopic;
        this.outTopic = outTopic;
        this.requestHandler = () => {};
    }

    onData(callback) {
        this.requestHandler = async (reqData) => {
            const respData = await callback(reqData);
            if (!respData) return; // no data means notification

            this.emitter.emit(this.outTopic, respData);
        };

        this.emitter.on(this.inTopic, this.requestHandler);
    }

    shutdown() {
        this.emitter.off(this.inTopic, this.requestHandler);
    }
}

module.exports = EventEmitterTransportServer;
