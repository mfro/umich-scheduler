import Vue from 'vue'
import Vuex from 'vuex'
import { Course, Section, parseCSV } from '@/model';
import request from '@/util/request';

import router from '@/router';

Vue.use(Vuex);

let host = 'https://api.mfro.me/scheduler';
if (location.hostname == 'localhost')
  host = 'http://localhost:8081';

export default new Vuex.Store({
  state: {
    courses: [] as Course[],
    sections: [] as Section[],
  },
  getters: {
    courseById: (s) => (id: string) => {
      return s.courses.find(s => Course.id(s) == id);
    },
    sectionById: (s) => (id: number) => {
      return s.sections.find(s => s.id == id);
    },
  },
  mutations: {
    ADD_COURSE(s, courses: Course | Course[]) {
      if (!(courses instanceof Array))
        courses = [courses];

      for (let course of courses) {
        if (s.courses.indexOf(course) != -1) {
          console.error('course already exists', course);
        } else {
          s.courses.push(course);

          for (let num in course.sections) {
            s.sections.push(course.sections[num]);
          }
        }
      }
    },
  },
  actions: {
    async load({ commit, getters, state }, id) {
      let old = getters.courseById(id);
      if (old) return old;

      const term = router.currentRoute.params.term;
      const csv = await request<string>(`${host}/term/${term}/course/${id}`);

      let courses = new Map<string, Course>();
      parseCSV(csv, courses);

      if (courses.size != 1)
        console.warn(`Parsed multiple courses in 'load ${id}'`);

      let list = [...courses.values()];

      commit('ADD_COURSE', list);
      return list[0];
    },
  },
});
