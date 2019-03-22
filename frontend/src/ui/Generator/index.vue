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
      <span class="display">{{ results ? results.schedules.length : 0 }}</span>

      <v-btn icon @click="++index" :disabled="index + 1 == results.schedules.length">
        <v-icon>chevron_right</v-icon>
      </v-btn>
    </v-card-actions>

    <v-progress-linear class="progress" :class="{ active: isLoading }" indeterminate/>
  </v-card>
</template>

<script>
import Vue from 'vue';

import * as worker from '@/worker';

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
      isLoading: false,

      courses: [{ "id": "EECS281", "label": "EECS 281", "enabled": true }, { "id": "EECS370", "label": "EECS 370", "enabled": true }, { "id": "EECS376", "label": "EECS 376", "enabled": true }],

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
        courses,
        locked: this.settings.locked,
        hidden: this.settings.hidden,
      };
    },

    currentResult() {
      if (!this.results) return null;
      return this.results.schedules[this.index];
    },
  },

  watch: {
    async generateArgs(value) {
      let start = performance.now();
      this.isLoading = true;
      this.results = await worker.generate(value);
      this.index = 0;
      this.isLoading = false;
      let end = performance.now();

      let duration = end - start;
      console.debug(`generated in ${duration}`);
    },

    currentResult(value) {
      this.$emit('input', value);
    },
  },

  methods: {
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
