<template>
  <div class="schedule-view">
    <div class="header">
      <div class="sidebar-spacer"/>

      <div class="day-labels">
        <div class="label" v-for="day in days" :key="day.id">
          <span>{{ day.name }}</span>
        </div>
      </div>
    </div>

    <div class="body">
      <div class="sidebar">
        <div class="time" v-for="time in timeLabels" :key="time" :style="timeStyle">
          <span>{{ time }}</span>
        </div>
      </div>

      <div class="calendar">
        <div class="lines">
          <div class="line" v-for="time in timeLabels" :key="time" :style="lineStyle"/>
        </div>

        <calendar-day
          v-for="day in days"
          :key="day.id"
          :day="day.id"
          :blocks="activeBlocks"
          :display="display"
          :interactive="interactive"
          @hide="onHide"
          @lock="onLock"
          @preview="onPreview"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import CalendarDay from './day.vue';
import * as blocks from './blocks';

const days = [
  { name: 'Monday', id: 'M' },
  { name: 'Tuesday', id: 'T' },
  { name: 'Wednesday', id: 'W' },
  { name: 'Thursday', id: 'TH' },
  { name: 'Friday', id: 'F' },
];

export default {
  name: 'calendar-view',

  components: {
    CalendarDay,
  },

  props: {
    settings: Object,
    schedule: Array,
    interactive: { default: true },
  },

  data() {
    return {
      days: days,

      display: {
        dayStart: 8,
        dayEnd: 18,
      },

      previewTarget: null,
    };
  },

  computed: {
    timeLabels() {
      let labels = [];
      for (let t = this.display.dayStart; t < this.display.dayEnd; t++) {
        if (t == 12) labels.push('12 PM');
        else if (t < 12) labels.push(`${t} AM`);
        else labels.push(`${t % 12} PM`);
      }
      return labels;
    },

    timeStyle() {
      let part = 100 / (this.display.dayEnd - this.display.dayStart);
      return {
        flex: `0 0 ${part}vh`,
      };
    },

    lineStyle() {
      let part = 100 / (this.display.dayEnd - this.display.dayStart);
      return {
        marginBottom: `calc(${part}vh - 1px)`,
      };
    },

    activeBlocks() {
      let base = [].concat(...this.schedule.map(s => blocks.generated(s)));
      let target = this.previewTarget;
      if (!target) return base;

      let flag;
      if (target.section.flags.includes('P')) {
        flag = 'P';
      } else if (target.section.flags.includes('A')) {
        flag = 'A';
      } else if (target.section.flags.includes('S')) {
        flag = 'S';
      } else {
        throw new Error('???: ' + target.section.flags);
      }

      let sections = target.section.course.sections.filter((s) => {
        return s.component == target.section.component &&
          s.flags.includes(flag);
      });

      let previewing = [].concat(...sections.map((s) => {
        let isHidden = this.settings.hidden.includes(s.id);
        let occurences = 1;

        return blocks.preview(s, target.color, isHidden, occurences);
      }));

      let locked = base.filter((a) => a.isLocked);
      return locked.concat(previewing.filter((a) => {
        if (locked.find((a2) => a2.section.id == a.section.id)) {
          return false;
        }

        return true;
      }));
    },
  },

  methods: {
    onHide(block) {
      if (!this.interactive) return;
      if (!block.isCourse) return;

      this.$emit('hide', block.section.id);
    },

    onLock(block) {
      if (!this.interactive) return;
      if (!block.isCourse) return;

      if (this.previewTarget && !block.isLocked) {
        this.previewTarget = null;
      }

      this.$emit('lock', block.section.id);
    },

    onPreview(block) {
      if (this.previewTarget) {
        this.previewTarget = null;
      } else {
        this.previewTarget = block;
      }
    },
  },
};

</script>

<style scoped lang="scss">
.schedule-view {
  height: 100vh;
  min-height: 800px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}

.sidebar,
.sidebar-spacer {
  flex: 0 0 75px;
  box-sizing: border-box;
}

.header {
  display: flex;
}

.day-labels {
  flex: 1;
  display: flex;

  .label {
    flex: 1;
    padding: 10px 0;
    text-align: center;
  }
}

.body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  padding-right: 10px;
  display: flex;
  flex-direction: column;
}

.time {
  text-align: right;
  flex: 1 1 !important;
}

.calendar {
  flex: 1;
  display: flex;
  position: relative;
}

.lines {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .line {
    flex: 1 1 !important;
    margin: 0 !important;
    border-top: 1px solid lightgray;
    // background: lightgray;
    // height: 1px;
  }
}
</style>
