<template>
    <md-list-item @click="toggle()" class="course">
        <md-checkbox class="checkbox" :value="course.enabled"/>
        <span class="id">{{ course.course.toString() }}</span>

        <md-button class="md-icon-button delete" @click="remove()">
            <md-icon>delete</md-icon>
        </md-button>
    </md-list-item>
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

        remove() {
            this.$store.dispatch('generator/toggleCourse', this.course.course).then(() => {
                this.$store.dispatch('generator/generate');
            });
        },
    },
};
</script>

<style lang="less" scoped>
.course {
    &:hover .delete {
        opacity: 1;
    }
}

.checkbox {
    pointer-events: none;
}

.id {
    flex: 1 1;
}

.delete {
    opacity: 0;
}
</style>

