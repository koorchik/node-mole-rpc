class EventEmitterTransportServer {
    constructor({emitter, inTopic, outTopic}) {
        this.emitter = emitter;
        this.inTopic  = inTopic;
        this.outTopic = outTopic;
    }

    onMessage(callback) {
        this.emitter.on(this.inTopic, data => {
            callback(data, this._send.bind(this))
        });
    }

    _send(data) {
        this.emitter.emit(this.outTopic, data);
    }
}

module.exports = EventEmitterTransportServer;