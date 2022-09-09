// Use custom class because we don't have EventEmitter in browser

class EventEmitter {
    constructor() {
        this._listeners = {};

        // Used for test purposes
        this._paused = false;
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
        if (this._paused) {
            return false;
        }

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

    pause() {
        this._paused = true;
    }

    resume() {
        this._paused = false;
    }
}

module.exports = EventEmitter;