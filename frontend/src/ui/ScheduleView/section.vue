<template>
  <v-layout
    class="section"
    :class="classes"
    :style="style"
    v-hover="hover"
  >
    <div class="sideline" :style="sidelineStyle"/>

    <v-flex class="content">
      <div class="background" :style="backgroundStyle"/>


      <v-layout column class="text" v-if="block.isCustom">
        <span class="id">{{ block.id }}</span>
      </v-layout>

      <v-layout column class="text" v-else-if="block.isCourse">
        <span class="id">{{ id }}</span>

        <div>
          <span>{{ block.section.title }}</span>
        </div>

        <v-layout px-1 justify-space-around class="row">
          <div class="number">
            <span class="tooltip" title="Section ID">{{ block.section.id }}</span>
          </div>

          <div class="location" style="flex: 0 0 auto">
            <span>{{ block.meeting.location }}</span>
          </div>

          <div class="occurrences">
            <span class="tooltip" title="Schedules that include this section" v-if="interactive && block.isPreview">{{ block.occurrences }}</span>
          </div>
        </v-layout>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import * as keyboard from '@/util/keyboard';
import Input from '@/util/input';

export default {
  name: 'calendar-section',

  props: {
    block: Object,
    group: Object,
    interactive: Boolean,
    display: Object,
  },

  data() {
    return {
      ready: false,
      hover: false,
    };
  },

  computed: {
    subject() {
      return this.block.section.course.subjectId;
    },

    id() {
      let sec = this.block.section.num.toString();
      while (sec.length < 3) sec = '0' + sec;

      let course = this.block.section.course.courseId.toString();
      while (course.length < 3) course = '0' + course;

      return `${this.subject} ${course} - ${this.block.section.component} ${sec}`;
    },

    classes() {
      return {
        lock: (this.block.isGenerated && this.block.isLocked) || (this.block.isCustom),
        hidden: this.block.isPreview && this.block.isHidden,
        interactive: this.interactive,
      };
    },

    color() {
      if (this.interactive && this.block.isPreview && this.block.occurrences == 0) {
        return 'gray';
      }

      return this.block.color;
    },

    backgroundStyle() {
      return {
        backgroundColor: this.color,
      };
    },

    sidelineStyle() {
      return {
        backgroundColor: this.color,
      };
    },

    style() {
      if (!this.ready) return {};

      let size = this.$parent.$el.getBoundingClientRect();

      let height = (this.block.end - this.block.start) / (this.display.dayEnd - this.display.dayStart);
      let top = (this.block.start - this.display.dayStart) / (this.display.dayEnd - this.display.dayStart);

      return {
        width: `calc(100% - ${8 * (this.group.size)}px)`,
        height: `${size.height * height}px`,
        top: `${size.height * top}px`,
        marginLeft: `${8 * this.group.index}px`,
      };
    },
  },

  created() {
    this.$use(Input.onPress(Input.A, m => {
      if (!this.hover) return;
      Input.consume();
      this.lock();
    }));

    this.$use(Input.onPress(Input.B, m => {
      console.log('x', this.hover);
      if (!this.hover) return;
      Input.consume();
      this.hide();
    }));

    this.$use(Input.onPress(Input.C, m => {
      if (!this.hover) return;
      Input.consume();
      this.preview();
    }));
  },

  mounted() {
    this.ready = true;

    this.$el.onmousedown = (e) => {
      if (e.button == 1) {
        e.preventDefault();
        return false;
      }
    };
  },

  methods: {
    lock() {
      if (this.block.isCustom) return;
      this.$emit('lock', this.block);
    },

    preview() {
      if (this.block.isCustom) return;
      this.$emit('preview', this.block);
    },

    hide() {
      this.$emit('hide', this.block);
    },
  },
};
</script>

<style scoped lang="scss">
.tooltip {
  cursor: help;
}

.section {
  cursor: default;

  position: absolute;
  background-color: white;

  border: 1px solid lightgray;

  &.interactive {
    cursor: pointer;
  }

  &.lock .sideline {
    width: 0;
  }

  &.hidden {
    .sideline,
    .content {
      opacity: 0.33;
    }
  }

  &:hover {
    z-index: 1;
  }
}

.sideline {
  width: 6px;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
}

.content {
  position: relative;
}

.background {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.text {
  position: absolute;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 6px;
  box-sizing: border-box;

  line-height: 1.3em;

  .id {
    font-weight: bold;
  }

  .row {
    width: 100%;

    > * {
      flex: 0 0 auto;
    }

    > :first-child,
    > :last-child {
      flex: 1;
    }
  }

  .occurrences {
    text-align: end;
  }
}
</style>
