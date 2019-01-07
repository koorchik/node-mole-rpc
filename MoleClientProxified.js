const MoleClient = require('./MoleClient');
const proxify = require('./proxify');

class MoleClientProxified extends MoleClient {
    constructor(...args) {
        super(...args);
        return proxify(this);
    }
}

module.exports = MoleClientProxified;