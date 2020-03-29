import proxify, { MoleClientProxified } from './proxify';
import MoleClient from './MoleClient';
import { ExposedMethods, TransportClient } from './types';

// @ts-ignore
class MoleClientProxifiedImpl<Methods extends ExposedMethods> extends MoleClient<Methods> implements MoleClientProxified<Methods> {
    constructor(options: { transport: TransportClient, requestTimeout?: number }) {
        super(options);
        // @ts-ignore
        return proxify(this);
    }
}

export default MoleClientProxifiedImpl;
