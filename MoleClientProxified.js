"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const proxify_1 = __importDefault(require("./proxify"));
const MoleClient_1 = __importDefault(require("./MoleClient"));
// @ts-ignore
class MoleClientProxifiedImpl extends MoleClient_1.default {
    constructor(options) {
        super(options);
        // @ts-ignore
        return proxify_1.default(this);
    }
}
module.exports = MoleClientProxifiedImpl;
