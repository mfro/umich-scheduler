<template>
  <v-list-tile @click="toggle()" class="course">
    <v-list-tile-action style="min-width: 44px">
      <v-checkbox class="checkbox" v-model="course.enabled"/>
    </v-list-tile-action>

    <v-list-tile-content>
      <v-list-tile-title>{{ course.label }}</v-list-tile-title>
    </v-list-tile-content>

    <v-btn icon class="delete" @click="remove()">
      <v-icon>delete</v-icon>
    </v-btn>
  </v-list-tile>
</template>

<script>
export default {
  name: 'schedule-course',

  props: {
    course: Object,
  },

  methods: {
    toggle() {
      this.$emit('toggle');
    },

    remove() {
      this.$emit('remove');
    },
  },
};
</script>

<style lang="scss" scoped>
.course:hover .delete {
  opacity: 1;
}

.checkbox {
  pointer-events: none;
  margin-left: 6px !important;
}

.delete {
  opacity: 0;
}
</style>

