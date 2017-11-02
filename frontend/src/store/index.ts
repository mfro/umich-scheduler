import Vue from 'vue';
import Vuex from 'vuex';

declare const require: any;

const mContext = require.context('./modules', false, /.ts$/);
const modules = {};

for (let key of mContext.keys()) {
    let split = key.split(/[/.]/);
    let name = split[split.length - 2];
    let mod = mContext(key);
    (<any>modules)[name] = mod;
}

const pContext = require.context('./plugins', false, /.ts$/);
const plugins: any[] = [];
for (let key of pContext.keys()) {
    let mod = pContext(key);
    plugins.push(mod.default);
}

Vue.use(Vuex);
export default new Vuex.Store({
    modules,
    plugins,
});