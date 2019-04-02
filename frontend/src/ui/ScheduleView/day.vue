<template>
  <div class="day">
    <div class="custom-target"></div>
    <calendar-section
      v-for="a in sorted"
      :key="a.block.id"
      :block="a.block"
      :group="a.group"
      :display="display"
      :interactive="interactive"
      @hide="$emit('hide', $event)"
      @lock="$emit('lock', $event)"
      @preview="$emit('preview', $event)"
    />
  </div>
</template>

<script>
import Input from '@/util/input';

import CalendarSection from './section.vue';
import * as blocks from './blocks';

export default {
  name: 'calendar-day',

  components: {
    CalendarSection,
  },

  props: {
    day: String,
    blocks: Array,
    interactive: Boolean,
    display: Object,
  },

  data() {
    return {
      dragOrigin: null,
      customPreview: null,
    };
  },

  computed: {
    sorted() {
      let src = [...this.blocks];
      // if (this.customPreview) src.push(this.customPreview);
      let list = src.filter((s) => {
        return s.days.includes(this.day);
      }).map((s) => ({
        block: s,
        group: {},
      })).sort((a, b) => {
        if (a.block.start != b.block.start) {
          return a.block.start - b.block.start;
        }
        return a.block.end - b.block.end;
      });

      let currentGroupEnd = -1;
      let currentGroup = [];
      for (let item of list) {
        if (currentGroupEnd <= item.block.start) {
          for (let i = 0; i < currentGroup.length; i++) {
            currentGroup[i].group.size = currentGroup.length;
            currentGroup[i].group.index = i;
          }

          currentGroup = [];
        }

        currentGroup.push(item);
        currentGroupEnd = item.block.end;
      }

      for (let i = 0; i < currentGroup.length; i++) {
        currentGroup[i].group.size = currentGroup.length;
        currentGroup[i].group.index = i;
      }

      return list;
    },
  },

  watch: {
    customPreview(value, oldValue) {
      if (oldValue)
        this.$emit('custom', oldValue);
      if (value)
        this.$emit('custom', value);
    },
  },

  created() {
    this.$use(Input.onPress(Input.A, () => {
      this.onDrag(true, Input.mouse());
    }));

    this.$use(Input.onMouse((m, cancel) => {
      this.onDrag(false, m);
    }));

    this.$use(Input.onRelease(Input.A, () => {
      this.onRelease();
    }));
  },

  methods: {
    onDrag(isPress, position) {
      let box = this.$el.getBoundingClientRect();
      let dragPos = position[1] - box.top;

      if (isPress) {
        if (position[0] < box.left || position[0] >= box.right) return;
        if (position[1] < box.top || position[1] >= box.bottom) return;
        this.dragOrigin = dragPos;
      } else if (!this.dragOrigin) {
        return;
      }

      Input.consume();
      let blockHeight = box.height / 2 / (this.display.dayEnd - this.display.dayStart);

      let a = this.display.dayStart + Math.floor(this.dragOrigin / blockHeight) / 2;
      let b = this.display.dayStart + Math.floor(dragPos / blockHeight) / 2;

      let start = Math.min(a, b);
      let end = Math.max(a, b) + 0.5;

      if (end <= start) return;

      if (this.customPreview &&
        start == this.customPreview.start &&
        end == this.customPreview.end)
        return;

      this.customPreview = blocks.custom([this.day], start, end, 'lightgray');
    },
    onRelease() {
      if (!this.customPreview) return;

      Input.consume();
      this.$emit('custom', this.customPreview);
      this.dragOrigin = null;
      this.customPreview = null;
    },
  },
};
</script>

<style scoped lang="scss">
.day {
  flex: 1 1;
  position: relative;
}

.custom-target {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
