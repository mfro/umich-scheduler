<template>
  <v-card class="generator">
    <v-card-title>
      <span class="title">Schedule generator</span>
    </v-card-title>

    <v-list class="list">
      <schedule-course
        v-for="(course,i) in courses"
        :key="i + course.id"
        :course="course"
        @toggle="course.enabled = !course.enabled"
        @remove="courses.splice(i, 1)"
      />

      <v-layout px-3 align-center>
        <v-btn flat icon :disabled="!input" @click="submit()" class="ml-0">
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

    <v-card-actions class="nav-area" v-if="results" :class="{ active: results != null }">
      <v-btn icon @click="--index" :disabled="index == 0">
        <v-icon>chevron_left</v-icon>
      </v-btn>

      <span class="display">{{ index + 1 }}</span>
      <span class="display">of</span>
      <span class="display">{{ results.scheduleCount }}</span>

      <v-btn icon @click="++index" :disabled="index + 1 == results.scheduleCount">
        <v-icon>chevron_right</v-icon>
      </v-btn>
    </v-card-actions>

    <v-progress-linear class="progress" :class="{ active: isLoading }" indeterminate/>
  </v-card>
</template>

<script>
import Vue from 'vue';

import { generate } from '@/worker';

import ScheduleCourse from './ScheduleCourse';

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
      results: null,
      currentResult: null,

      isLoading: false,

      courses: [],

      rawInput: '',
    };
  },

  computed: {
    input() {
      let match = /([a-zA-Z]+)\s*(\d{3})/.exec(this.rawInput);
      if (!match) return null;

      return {
        id: `${match[1].toUpperCase()}${match[2]}`,
        label: `${match[1].toUpperCase()} ${match[2]}`,
        enabled: true,
      };
    },

    generateArgs() {
      let courses = this.courses.map(c => {
        if (!c.enabled) return null;
        return this.$store.state.courses.find(c2 => c2.subjectId + c2.courseId == c.id);
      }).filter(c => c);

      return {
        type: 'generate',
        courses,
        locked: this.settings.locked,
        hidden: this.settings.hidden,
      };
    },
  },

  watch: {
    async generateArgs(value) {
      console.log(value);
      this.isLoading = true;
      this.index = 0;
      generate.postMessage(value);
    },

    index(value) {
      generate.postMessage({ type: 'get', index: value });
    },

    currentResult(value) {
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
    generate.addEventListener('message', this.onMessage);
    this.$use(() => generate.removeEventListener('message', this.onMessage));

    let raw = localStorage.getItem('umich-scheduler.courses');
    if (raw) {
      this.courses = JSON.parse(raw);
      for (let course of this.courses) {
        this.$store.dispatch('load', course.id);
      }
    }
  },

  methods: {
    onMessage(e) {
      let m = e.data;
      if (m.type == 'results') {
        this.results = m;
        this.isLoading = !m.complete;
      } else if (m.type == 'schedule') {
        this.currentResult = m.schedule;
      }
    },

    onKeyDown(e) {
      if (e.keyCode == 13 && this.input) this.submit();
    },

    submit() {
      this.$store.dispatch('load', this.input.id);
      this.courses.push(this.input);
      this.rawInput = '';
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
