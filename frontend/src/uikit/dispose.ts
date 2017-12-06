import Vue from 'vue';

type Action = () => void;
const map = new Map<Vue, Action[]>();

Vue.mixin({
    beforeDestroy(this: Vue) {
        let list = map.get(this);
        if (!list) return;

        for (let action of list) {
            action();
        }
    }
});

Vue.prototype.$use = function (action: Action) {
    let list = map.get(this);
    if (!list) map.set(this, list = []);

    list.push(action);
};
