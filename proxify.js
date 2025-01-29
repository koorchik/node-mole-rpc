function proxify(moleClient) {
    const initProxy = proxifyOwnMethod(moleClient.init.bind(moleClient));
    const shutdownProxy = proxifyOwnMethod(moleClient.shutdown.bind(moleClient));
    const callMethodProxy = proxifyOwnMethod(moleClient.callMethod.bind(moleClient));
    const notifyProxy = proxifyOwnMethod(moleClient.notify.bind(moleClient));
    const pingProxy = proxifyOwnMethod(moleClient.ping.bind(moleClient));

    return new Proxy(moleClient, {
        get(target, methodName) {
            switch (methodName) {
                case 'init':
                    return initProxy;
                case 'shutdown':
                    return shutdownProxy;
                case 'callMethod':
                    return callMethodProxy;
                case 'notify':
                    return notifyProxy;
                case 'ping':
                    return pingProxy;
                case 'options.requestTimeout':
                    return target.requestTimeout;
                case 'options.pingTimeout':
                    return target.pingTimeout;
                case 'then':
                    // without this you will not be able to return client from an async function.
                    // V8 will see then method and will decide that client is a promise
                    return;
                default:
                    return (...params) => target.callMethod.call(target, methodName, params);
            }
        }
    });
}

function proxifyOwnMethod(ownMethod) {
    return new Proxy(ownMethod, {
        get(target, methodName) {
            return (...params) => target.call(null, methodName, params);
        },
        apply(target, _, args) {
            return target.apply(null, args);
        }
    });
}

module.exports = proxify;
