<template>
    <v-card>
        <v-card-title>
            <span class="title">Schedule generator</span>
        </v-card-title>

        <v-list class="list">
            <schedule-course v-for="course in courses" :key="course.id" :course="course"/>
        </v-list>

        <v-layout px-3 align-center>
            <v-text-field label="Course ID" v-model="rawInput" @keydown.native="onKeyDown"/>

            <v-btn flat icon :disabled="!course" @click="submit()">
                <v-icon>add</v-icon>
            </v-btn>
        </v-layout>

        <v-card-actions class="nav-area" :class="{ active: isReady }">
            <v-btn icon @click="nav(-1)">
                <v-icon>chevron_left</v-icon>
            </v-btn>

            <span class="display">{{ index + 1 }}</span>
            <span class="display">of</span>
            <span class="display">{{ total }}</span>

            <v-btn icon @click="nav(1)">
                <v-icon>chevron_right</v-icon>
            </v-btn>
        </v-card-actions>

        <v-progress-linear class="progress" :class="{ active: isLoading }" indeterminate/>
    </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

import Course from '@mfro/umich-scheduler-common/course';
import ScheduleCourse from './course.vue';

import * as keyboard from '@/lib/keyboard';

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
            index: 'generator/currentIndex',
            total: 'generator/total',
            isLoading: 'generator/isLoading',
        }),

        isReady() {
            return !this.isLoading && this.total > 0;
        },

        course() {
            return Course.tryParse(this.rawInput);
        },
    },

    created() {
        this.$use(keyboard.onPress(keyboard.LEFT_ARROW, () => {
            this.nav(-1);
        }));

        this.$use(keyboard.onPress(keyboard.RIGHT_ARROW, () => {
            this.nav(1);
        }));
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

        nav(offset) {
            let index = this.index + offset;
            this.$store.dispatch('generator/setIndex', index);
        },
    },
};
</script>

<style module lang="less">
.nav-area {
    opacity: 0;
    pointer-events: none;

    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    .display {
        flex: 0 0 10%;
        text-align: center;
    }

    &.active {
        opacity: 1;
        pointer-events: initial;
    }
}

.progress {
    opacity: 0;
    bottom: 0;
    position: absolute;

    &.active {
        opacity: 1;
    }
}
</style>

