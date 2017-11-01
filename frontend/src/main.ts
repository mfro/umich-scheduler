import './once.ts';
import './v-mouse';

import RootComponent from './App.vue';
import store from './store';
import router from './router';

import Vue from 'vue';

let app = new Vue({
    store,
    router,
    mixins: [RootComponent]
});

app.$mount('#app');