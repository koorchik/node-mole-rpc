// Use custom class because we don't have EventEmitter in browser

class EventEmitter {
    constructor() {
        this._listeners = {};
    }

    on(eventName, listener) {
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }

        this._listeners[eventName].push(listener);

        return this;
    }

    off(eventName, listener) {
        if (!this._listeners[eventName]) {
            return this;
        }

        this._listeners[eventName] = this._listeners[eventName].filter(item => item !== listener);

        return this;
    }

    emit(eventName, ...args) {
        const listeners = this._listeners[eventName];

        if (!listeners) {
            return false;
        }

        for (const listener of listeners) {
            try {
               listener(...args);
            } catch (error) {
                // Ignore errors
            }
        }

        return true;
    }
}

module.exports = EventEmitter;