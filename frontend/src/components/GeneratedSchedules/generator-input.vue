<template>
    <div>
        <md-list class="list">
            <schedule-course v-for="course in courses" :key="course.id" :course="course"/>
        </md-list>

        <div class="row">
            <md-input-container>
                <label>Course ID</label>
                <md-input v-model="rawInput" @keydown.native="onKeyDown"/>
            </md-input-container>

            <md-button class="md-icon-button" :disabled="!course" @click="submit()">
                <md-icon>add</md-icon>
            </md-button>
        </div>

        <md-card-actions class="actions">
            <md-button class="reset-button" @click="reset()">
                Reset
            </md-button>
        </md-card-actions>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Course from '@/common/course';
import ScheduleCourse from './course.vue';

export default {
    name: 'generator-save',

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

<style lang="less" scoped>
.list {
    margin: 0 -16px;
}

.row {
    margin-top: -8px;

    display: flex;
    align-items: center;
}

.actions {
    margin: -16px;
}
</style>

