import '!file-loader?name=index.html!./index.html';
import Vue from 'vue';

import './global.less';

export function start(RootComponent: any) {
    let app = new Vue(RootComponent);
    app.$mount('#root');
}