"use strict";
function proxify(moleClient) {
    const callMethodProxy = proxifyOwnMethod(moleClient.callMethod.bind(moleClient));
    const notifyProxy = proxifyOwnMethod(moleClient.notify.bind(moleClient));
    return new Proxy(moleClient, {
        get(target, methodName) {
            if (methodName === 'notify') {
                return notifyProxy;
            }
            else if (methodName === 'callMethod') {
                return callMethodProxy;
            }
            else if (methodName === 'options.requestTimeout') {
                return target.requestTimeout;
            }
            else if (methodName === 'then') {
                // without this you will not be able to return client from an async function.
                // V8 will see then method and will decide that client is a promise
                return;
            }
            else {
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
