import '@babel/polyfill'
import './plugins/vuetify'

import Vue from 'vue'
import App from '@/main.vue'
import store from '@/store'

import '@/util/keyboard';

Vue.config.productionTip = false

Vue.directive('hover', {
  bind(el, binding, vnode) {
    if (binding.arg == 'class') {
      // do nothing
    } else {
      Vue.set(vnode.context!, binding.expression, false);
    }

    el.addEventListener('mouseenter', e => {
      if (binding.arg == 'class') {
        el.classList.add(binding.expression);
      } else {
        Vue.set(vnode.context!, binding.expression, true);
      }
    });
    el.addEventListener('mouseleave', e => {
      if (binding.arg == 'class') {
        el.classList.remove(binding.expression);
      } else {
        Vue.set(vnode.context!, binding.expression, false);
      }
    });
  },
});

Vue.mixin({
  beforeDestroy(this: any) {
    if (!this.$use.liist) return;
    for (let release of this.$use.list) release();
  },
});

Vue.prototype.$use = function (release: () => void) {
  if (!this.$use.list) this.$use.list = [];
  this.$use.list.push(release);
}

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');

store.dispatch('load', 'EECS281');
store.dispatch('load', 'EECS370');
store.dispatch('load', 'EECS376');
