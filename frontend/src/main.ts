import Vue from 'vue';

import './init';
import './uikit';

import RootComponent from './App.vue';
import store from './store';
// import router from './router';

let app = new Vue({
    store,
    // router,
    mixins: [RootComponent]
});

app.$mount('#app');
