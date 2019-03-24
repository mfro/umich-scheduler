import '@babel/polyfill'
import './plugins/vuetify'

import Vue from 'vue'
import App from '@/main.vue'
import store from '@/store'

import '@/util/keyboard';

import * as nonBlocking from '@/generate/non-blocking';

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

function test2() {
  let courses = [
    // store.getters.courseById('EECS203'),
    store.getters.courseById('EECS280'),
    store.getters.courseById('EECS370'),
    store.getters.courseById('EECS376'),
  ];

  let generator = new nonBlocking.Generator({
    courses, hidden: [], locked: [],
  });

  let start = performance.now();

  generator.next(() => false);

  let end = performance.now();
  console.log(`did ${generator.schedules.length} in ${end - start} (${start} -> ${end})`);
}

(self as any).test2 = test2;
