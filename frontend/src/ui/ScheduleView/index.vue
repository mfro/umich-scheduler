<template>
  <div class="schedule-view">
    <div class="sidebar">
      <div class="sidebar-spacer"/>

      <div class="time-button top">
        <v-btn flat icon @click="display.dayStart--" :disabled="display.dayStart == 1" class="ma-0">
          <v-icon>expand_less</v-icon>
        </v-btn>
      </div>
      <div class="time-button bot">
        <v-btn flat icon @click="display.dayEnd++" :disabled="display.dayEnd == 24" class="ma-0">
          <v-icon>expand_more</v-icon>
        </v-btn>
      </div>

      <div
        class="time"
        v-for="time in timeLabels"
        :key="time.value"
        :style="timeStyle"
        :class="time.class"
      >
        <div
          class="time-click top"
          v-if="time != timeLabels[0]"
          @click="display.dayStart = time.value"
          @mouseenter="displayPreview.dayStart = time.value"
          @mouseleave="displayPreview.dayStart = null"
        />
        <div
          class="time-click bot"
          v-if="time != timeLabels[timeLabels.length - 1]"
          @click="display.dayEnd = time.value + 1"
          @mouseenter="displayPreview.dayEnd = time.value + 1"
          @mouseleave="displayPreview.dayEnd = null"
        />
        <span style="position: relative; pointer-events: none">{{ time.label }}</span>
      </div>
    </div>

    <div class="body">
      <div class="day-labels">
        <div class="label" v-for="day in days" :key="day.id">
          <span>{{ day.name }}</span>
        </div>
      </div>

      <div class="calendar">
        <div class="lines">
          <div class="line" v-for="time in timeLabels" :key="time.value" :style="lineStyle"/>
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

      displayPreview: { dayStart: null, dayEnd: null, },

      previewTarget: null,
    };
  },

  computed: {
    timeLabels() {
      let labels = [];
      for (let t = this.display.dayStart; t < this.display.dayEnd; t++) {
        let label;
        if (t == 12) label = '12 PM';
        else if (t < 12) label = `${t} AM`;
        else label = `${t % 12} PM`;

        let fade = false;
        if (this.displayPreview.dayStart && t < this.displayPreview.dayStart)
          fade = true;
        else if (this.displayPreview.dayEnd && t >= this.displayPreview.dayEnd)
          fade = true;

        labels.push({
          value: t,
          label,
          class: { fade },
        });
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

    increaseHour() {
      this.display.dayEnd++;
    },

    decreaseHour() {
      this.display.dayStart--;
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
}

.sidebar {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  position: relative;

  .sidebar-spacer {
    flex: 0 0 3em;
  }

  .time-button {
    position: absolute;
    width: 100%;
    height: 3em;
    display: flex;
    align-items: center;
    justify-content: center;
    left: 0;
    z-index: 1;

    &.top {
      top: 0;
    }

    &.bot {
      bottom: 0;
    }
  }

  .time {
    position: relative;
    padding-left: 1.5em;
    padding-right: 8px;

    &.fade {
      color: rgba(0,0,0,.5)
    }
  }

  .time-click {
    position: absolute;
    width: 100%;
    height: 50%;
    left: 0;
    cursor: pointer;

    &:hover {
      background-color: #efefef;
    }

    &.top {
      top: 0;
    }

    &.bot {
      bottom: 0;
    }
  }
}

.header {
  display: flex;
}

.day-labels {
  flex: 0 0 3em;
  display: flex;
  align-items: center;

  .label {
    flex: 1;
    text-align: center;
  }
}

.body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
