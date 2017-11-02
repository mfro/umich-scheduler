import './once.ts';
import './v-mouse';
import './uikit';

import RootComponent from './App.vue';
import store from './store';
import router from './router';

import Vue from 'vue';

import VueMaterial from 'vue-material';

Vue.use(VueMaterial);

import 'vue-material/dist/vue-material.css';

let app = new Vue({
    store,
    router,
    mixins: [RootComponent]
});

app.$mount('#app');

Vue.material.registerTheme('default', {
    primary: 'blue',
    accent: 'blue',
    warn: 'red',
    background: 'white'
});
