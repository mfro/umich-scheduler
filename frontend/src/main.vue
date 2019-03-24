<template>
  <v-app>
    <v-layout>
      <generator v-model="output" :settings="settings"/>
      <schedule-view
        :settings="settings"
        :schedule="output.schedule"
        :occurrences="output.occurrences"
        @lock="lock"
        @hide="hide"
      />
    </v-layout>
  </v-app>
</template>

<script>
import Vue from 'vue';

import Generator from '@/ui/Generator';
import ScheduleView from '@/ui/ScheduleView';
import { Section } from './model';

export default {
  name: 'app',

  components: {
    Generator,
    ScheduleView,
  },

  data() {
    return {
      output: { schedule: [], occurrences: {} },
      settings: {
        locked: [],
        hidden: [],
      },
    };
  },

  methods: {
    lock(value) {
      let i = this.settings.locked.indexOf(value);
      if (i != -1) {
        this.settings.locked.splice(i, 1);
      } else {
        let a = this.$store.getters.sectionById(value);

        let toRemove = this.settings.locked.filter(id => {
          let b = this.$store.getters.sectionById(id);
          return !Section.isCompatible(a, b);
        });

        for (let s of toRemove) // can't have incompatible sections locked
          this.settings.locked.splice(this.settings.locked.indexOf(s), 1);

        i = this.settings.hidden.indexOf(value);
        if (i != -1) // can't be both locked and hidden
          this.settings.hidden.splice(i, 1);

        this.settings.locked.push(value);
      }
    },

    hide(value) {
      let i = this.settings.hidden.indexOf(value);
      if (i != -1) {
        this.settings.hidden.splice(i, 1);
      } else {
        let a = this.$store.getters.sectionById(value);

        i = this.settings.locked.indexOf(value);
        if (i != -1) // can't be both locked and hidden
          this.settings.locked.splice(i, 1);

        this.settings.hidden.push(value);
      }
    },
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
}
</style>
