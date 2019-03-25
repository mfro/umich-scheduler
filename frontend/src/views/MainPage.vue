<template>
  <v-layout>
    <v-navigation-drawer permanent>
      <v-layout column fill-height class="sidebar">
        <generator v-model="output" :settings="settings"/>

        <div class="pa-3">
          <p>
            Find courses using the
            <a href="https://www.lsa.umich.edu/cg/" target="_blank">course guide</a>.
          </p>

          <p>Add courses on the left side of the screen.</p>

          <p>Use the calendar view to customize the generation.</p>

          <p>Mouse clicks or key bindings can be used interchangeably. Key bindings are mostly useful with a trackpad or bad mouse.</p>

          <p>- Left click or Q 'locks' a section</p>

          <p>- Middle click or W previews alternatives to a section</p>

          <p>- Right click or E 'hides' a section</p>

          <p>Adjust the view by clicking on the time labels on the left side.</p>

          <p>It will generate all valid courses in the background, you can continue to customize while it does.</p>
        </div>
      </v-layout>
    </v-navigation-drawer>

    <schedule-view
      v-if="output"
      :settings="settings"
      :schedule="output.schedule"
      :occurrences="output.occurrences"
      @lock="lock"
      @hide="hide"
    />
    <v-layout v-else>
    </v-layout>
  </v-layout>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

import Generator from '@/ui/Generator';
import ScheduleView from '@/ui/ScheduleView';

import { Section } from '@/model';

export default {
  name: 'main-page',

  components: {
    Generator,
    ScheduleView,
  },

  data() {
    return {
      output: null,
      settings: {
        locked: [],
        hidden: [],
      },
    };
  },

  computed: {
    term() {
      return this.$route.params.term;
    },

    classIds() {
      if (!this.output) return '';
      return this.output.schedule.map(s => s.section.id).join('\n');
    },
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

<style lang="scss" scoped>
.sidebar {
  flex: 0 0 24em !important;
  background: white;
}
</style>
