import Vue from 'vue'
import VueRouter from 'vue-router';

import MainPage from '@/views/MainPage.vue';
import TermSelectorPage from '@/views/TermSelectorPage.vue';

Vue.use(VueRouter);

export default new VueRouter({
    routes: [
        {
            path: '/:term',
            component: MainPage,
        },
        {
            path: '*',
            component: TermSelectorPage,
        },
    ],
});
