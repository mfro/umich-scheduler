<template>
  <v-layout column>
    <div class="pa-3">
      <span class="title">Schedule generator</span>
    </div>

    <v-list class="list">
      <schedule-course
        v-for="(course,i) in courses"
        :key="i + course.id"
        :course="course"
        @toggle="course.enabled = !course.enabled"
        @remove="courses.splice(i, 1)"
      />

      <v-layout px-3 align-center>
        <v-btn
          flat
          icon
          :disabled="!input || isLoadingInput"
          :loading="isLoadingInput"
          @click="submit()"
          class="ml-0"
        >
          <v-icon>add</v-icon>
        </v-btn>

        <v-text-field
          label="Course ID"
          hint="ex: 'MATH 115' 'math115'"
          v-model="rawInput"
          @keydown.native="onKeyDown"
        />
      </v-layout>
    </v-list>

    <div class="nav-area" v-if="status" :class="{ active: status != null }">
      <v-btn icon @click="--index" :disabled="index == 0">
        <v-icon>chevron_left</v-icon>
      </v-btn>

      <span class="display">{{ index + 1 }}</span>
      <span class="display">of</span>
      <span class="display">{{ status.scheduleCount }}</span>

      <v-btn icon @click="++index" :disabled="index + 1 == status.scheduleCount">
        <v-icon>chevron_right</v-icon>
      </v-btn>
    </div>
    <v-progress-linear class="progress" :class="{ active: isGenerating }" indeterminate/>
  </v-layout>
</template>

<script>
import Vue from 'vue';

import ScheduleCourse from './ScheduleCourse';

import { Course } from '@/model';
import * as generate from '@/generate';

const colors = [
  '#16a765',
  '#4986e7',
  '#f83a22',
  '#ffad46',
  '#d06b64',
  '#9a9cff',
  '#ff7537',
  '#7bd148',
  '#ac725e',
  '#42d692',
  '#cabdbf',
];

export default {
  name: 'generator',

  components: {
    ScheduleCourse,
  },

  props: {
    settings: Object,
  },

  data() {
    return {
      index: 0,
      status: null,
      currentResult: null,

      isGenerating: false,
      isLoadingInput: false,

      courses: [],

      rawInput: '',
    };
  },

  computed: {
    input() {
      let match = /([a-zA-Z]+)\s*(\d{3})/.exec(this.rawInput);
      if (!match) return null;

      return `${match[1].toUpperCase()}${match[2]}`;
    },

    generateArgs() {
      let courses = this.courses
        .filter(c => c.enabled)
        .map(c => c.id);

      return {
        courses,
        locked: this.settings.locked,
        hidden: this.settings.hidden,
      };
    },

    output() {
      if (!this.currentResult || !this.status)
        return null;

      return { schedule: this.currentResult, occurrences: this.status.occurrences };
    },
  },

  watch: {
    generateArgs(value) {
      this.isGenerating = true;
      this.index = 0;

      generate.start(value);
    },

    async index(value) {
      this.getCurrentResult();
    },

    output(value) {
      this.$emit('input', value);
    },

    courses: {
      deep: true,
      handler(value) {
        localStorage.setItem('umich-scheduler.courses', JSON.stringify(value));
      },
    }
  },

  created() {
    this.$use(generate.listen(this.onProgress));

    let raw = localStorage.getItem('umich-scheduler.courses');
    if (raw) {
      let courses = JSON.parse(raw);
      for (let course of courses)
        this.addCourse(course.id, course.enabled);
    }
  },

  methods: {
    onProgress(e) {
      if (e.scheduleCount == 0) {
        this.status = null;
        this.isGenerating = false;
      } else {
        this.status = e;
        this.isGenerating = !e.complete;
      }
      this.getCurrentResult();
    },

    async getCurrentResult() {
      if (!this.status) return this.currentResult = null;
      let ids = await generate.get(this.index);

      let color = 0;
      let colorMap = new Map;
      for (let course of this.courses)
        colorMap.set(course.id, colors[color++]);

      this.currentResult = ids.map(id => {
        let section = this.$store.getters.sectionById(id);

        return {
          section,
          color: colorMap.get(Course.id(section.course)),
          locked: this.settings.locked.includes(id),
        };
      });
    },

    onKeyDown(e) {
      if (e.keyCode == 13 && this.input && !this.isLoadingInput) this.submit();
    },

    async addCourse(id, enabled) {
      if (this.courses.find(c => c.id == id))
        return;

      if (enabled === undefined)
        enabled = true;

      this.isLoadingInput = true;
      let course = await this.$store.dispatch('load', id);
      this.isLoadingInput = false;

      if (!course)
        return;

      this.courses.push({
        id: id,
        label: Course.name(course),
        enabled: enabled,
      });
    },

    async submit() {
      let id = this.input;

      this.rawInput = '';
      await this.addCourse(id);
    },
  },
};
</script>

<style lang="scss" scoped>
.generator {
  max-width: 24em;
}

.nav-area {
  opacity: 0;
  pointer-events: none;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;

  .display {
    flex: 0 0 10%;
    text-align: center;
  }

  &.active {
    opacity: 1;
    pointer-events: initial;
  }
}

.progress {
  margin: 0 !important;
  opacity: 0;
  // bottom: 0;
  // position: absolute;

  &.active {
    opacity: 1;
  }
}
</style>
