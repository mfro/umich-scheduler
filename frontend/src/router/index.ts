import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';

Vue.use(VueRouter);

let base;
if (location.hostname == 'mfro.me')
    base = '/scheduler/';
else
    base = '/';

const router = new VueRouter({
    routes,
    mode: 'history',
    fallback: true,
    base: base,
});

export default router;
