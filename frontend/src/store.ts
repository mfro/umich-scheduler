import Vue from 'vue'
import Vuex from 'vuex'
import { Course, Section, SectionMeeting } from '@/model';
import request from '@/util/request';

Vue.use(Vuex)

const TERM = 'FA2019';

function parseCSV(csv: string) {
  let courses = new Map<String, Course>();
  let sections = new Map<number, Section>();

  for (let line of csv.split('\n')) {
    let regex = /"([^"]*)",/g;
    let match;

    let fields = [];
    while (match = regex.exec(line)) {
      fields.push(match[1].trim());
    }

    if (fields.length != 23) continue;

    let subjectId = /\(([A-Z]+)\)/.exec(fields[4])![1];
    let courseId = parseInt(fields[5]);
    let sectionId = parseInt(fields[3]);

    let course = courses.get(subjectId + courseId);
    if (!course) courses.set(subjectId + courseId, course = Course.parse(fields));

    let section = sections.get(sectionId);
    if (!section) sections.set(sectionId, section = Section.parse(course, fields));

    section.meetings.push(SectionMeeting.parse(fields));
  }

  return courses.values();
}

export default new Vuex.Store({
  state: {
    courses: [] as Course[],
    sections: [] as Section[],
  },
  getters: {
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
    async load({ commit }, id) {
      const raw = await request<string>(`http://localhost:8081/term/${TERM}/course/${id}`);

      let courses = [...parseCSV(raw)];
      if (courses.length != 1)
        console.warn(`Parsed multiple courses in 'load ${id}'`);

      commit('ADD_COURSE', courses);
    },
  },
});
