import '@babel/polyfill'
import './plugins/vuetify'

import Vue from 'vue'
import App from '@/main.vue'
import store, { parseCSV } from '@/store'

import '@/util/keyboard';
import request from './util/request';

import wGenerate from 'worker-loader!./worker/generate';
import wGenerate2 from 'worker-loader!./worker/generate-v2';

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

(window as any).test = async function() {
  let tasks = [
    request<string>(`http://localhost:8081/term/FA2019/course/EECS281`),
    request<string>(`http://localhost:8081/term/FA2019/course/EECS370`),
    request<string>(`http://localhost:8081/term/FA2019/course/EECS376`),
  ];

  let csvs = await Promise.all(tasks);
  let csv = csvs.join('');

  let courses = [...parseCSV(csv)];

  let w1 = new wGenerate();

  w1.postMessage({
    type: 'generate',
    courses: courses,
    hidden: [],
    locked: [],
  });

  let w2 = new wGenerate2();

  w2.postMessage(csv);
}
