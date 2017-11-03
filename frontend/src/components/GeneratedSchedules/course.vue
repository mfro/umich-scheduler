<template>
    <md-list-item @click="toggle()">
        <md-checkbox class="checkbox" :value="course.enabled"/>
        <span class="id">{{ course.course.toString() }}</span>
    </md-list-item>
    <!-- <div class="course" @click="toggle()">
        <md-checkbox class="checkbox" :value="course.enabled"/>
        <span class="id">{{ course.course.toString() }}</span>
    </div> -->
</template>

<script>
export default {
    name: 'schedule-course',

    props: {
        course: Object,
    },

    methods: {
        toggle() {
            this.$store.commit('generator/TOGGLE_ENABLED', this.course.course);

            this.$store.dispatch('generator/generate');
        },
    },
};
</script>

<style lang="less" scoped>
.course {
    cursor: pointer;
    display: flex;
    align-items: center;
}

.checkbox {
    pointer-events: none;
}

.id {
    flex: 1 1;
}
</style>

