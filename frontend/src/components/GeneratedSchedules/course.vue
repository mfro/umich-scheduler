<template>
    <div class="course" @click="toggle()">
        <md-checkbox class="checkbox" v-model="course.enabled"/>
        <span class="id">{{ course.course.toString() }}</span>
    </div>
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

input {
    width: 1.4em;
    height: 1.4em;
    margin: 3px 8px 4px 8px;
}
</style>

