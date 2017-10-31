import './once.ts';
import './v-mouse';

import RootComponent from './ui/root.vue';
import store from './store';

import * as app from './web';

app.start({
    store,
    mixins: [RootComponent]
});