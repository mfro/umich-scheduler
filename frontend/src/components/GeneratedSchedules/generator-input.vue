<template>
    <v-layout column>
        <v-list class="list">
            <schedule-course v-for="course in courses" :key="course.id" :course="course"/>
        </v-list>

        <v-layout px-3 align-center>
            <v-text-field label="Course ID" v-model="rawInput" @keydown.native="onKeyDown"/>

            <v-btn flat icon :disabled="!course" @click="submit()">
                <v-icon>add</v-icon>
            </v-btn>
        </v-layout>

        <!-- <v-card-actions class="actions">
            <v-button class="reset-button" @click="reset()">
                Reset
            </v-button>
        </v-card-actions> -->
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import Course from '@mfro/umich-scheduler-common/course';
import ScheduleCourse from './course.vue';

export default {
    name: 'generator-input',

    components: {
        ScheduleCourse,
    },

    data() {
        return {
            rawInput: '',
        };
    },

    computed: {
        ...mapGetters({
            courses: 'generator/courses',
        }),

        course() {
            return Course.tryParse(this.rawInput);
        },
    },

    methods: {
        submit() {
            if (!this.course) return;

            this.$store.dispatch('courses/load', this.course, { root: true }).then(() => {
                return this.$store.dispatch('generator/toggleCourse', this.course).then(() => {
                    this.rawInput = '';
                    return this.$store.dispatch('generator/generate');
                });
            });
        },

        reset() {
            this.$store.dispatch('generator/reset');
        },

        onKeyDown(e) {
            if (e.keyCode != 13 || !this.course) {
                return;
            }

            this.submit();
        },
    },
};
</script>

<style module lang="less">
.actions {
    margin: -16px;
}
</style>

