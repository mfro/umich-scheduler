import Vue from 'vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

if (process.env.NODE_ENV != 'development') {
    Raven.config('https://6190bc5484c5449182684c11b1169c71@sentry.io/255744')
        .addPlugin(RavenVue, Vue)
        .install();
}
