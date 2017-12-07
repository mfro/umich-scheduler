<template>
    <v-list-tile @click="toggle()" class="course">
        <v-list-tile-action>
            <v-checkbox class="checkbox" v-model="course.enabled"/>
        </v-list-tile-action>

        <v-list-tile-content>
            <v-list-tile-title>{{ course.course.toString() }}</v-list-tile-title>
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

<style module lang="less">
.course:hover .delete {
    opacity: 1;
}

.checkbox {
    pointer-events: none;
}

.delete {
    opacity: 0;
}
</style>

