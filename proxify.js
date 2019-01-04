function proxify(moleClient) {
    const callMethodProxy = proxifyOwnMethod(moleClient.callMethod.bind(moleClient));
    const notifyProxy = proxifyOwnMethod(moleClient.notify.bind(moleClient))

    return new Proxy(moleClient, {
        get(target, methodName) {
            if (methodName === 'notify') {
                return notifyProxy;
            } else if (methodName === 'callMethod') {
                return callMethodProxy;
            } else {
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