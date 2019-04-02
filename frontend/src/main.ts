import '@babel/polyfill'
import './plugins/vuetify'

import Vue from 'vue'
import App from '@/main.vue'

import router from '@/router';
import store from '@/store'

import '@/util/keyboard';

import * as nonBlocking from '@/generate/non-blocking';
import * as general from '@/generate/general';
import { translate } from '@/model/generalize';

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
    if (!this.$using) return;
    for (let release of this.$using) release();
  },
});

Vue.prototype.$use = function (release: () => void) {
  if (!this.$using) this.$using = [];
  this.$using.push(release);
}

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');

function test1() {
  let courses = [
    store.getters.courseById('EECS203'),
    store.getters.courseById('EECS281'),
    store.getters.courseById('EECS370'),
    store.getters.courseById('EECS376'),
  ];

  let t = translate(courses, [], []);

  let generator = new general.Generator(t.segments);

  let start = performance.now();

  generator.next(() => false);

  let end = performance.now();
  console.log(`did ${generator.schedules.length} in ${end - start} (${start} -> ${end})`);

  let s = generator.schedules[23];
  let sections = s.map((j, i) => t.sections[i][j]).flat();
  console.log(sections);
}

function test2() {
  let courses = [
    store.getters.courseById('EECS203'),
    store.getters.courseById('EECS281'),
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

(self as any).test1 = test1;
(self as any).test2 = test2;
