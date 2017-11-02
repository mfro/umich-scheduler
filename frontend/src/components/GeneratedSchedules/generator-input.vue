<template>
    <div class="generator-input">
        <div class="course-list">
            <schedule-course v-for="course in courses" :key="course.id" :course="course"/>
        </div>

        <div class="row">
            <md-input-container>
                <label>Course ID</label>
                <md-input v-model="courseInput"/>
            </md-input-container>

            <md-button class="md-icon-button" :disabled="!courseInput" @click="submit()">
                <md-icon>add</md-icon>
            </md-button>
        </div>
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
            courseInput: '',
        };
    },

    computed: {
        ...mapGetters({
            courses: 'generator/courses',
        }),
    },

    methods: {
        submit() {
            let id = this.courseInput;
            let course = Course.parse(id);

            this.$store.dispatch('generator/addCourse', course).then(() => {
                this.courseInput = '';
                this.$store.dispatch('generator/generate');
            });
        },

        reset() {
            this.$store.dispatch('generator/reset');
        },
    },
};
</script>

<style lang="less" scoped>
.generator-input {
    display: flex;
    flex-direction: column;
}

.row {
    margin-top: -8px;
    margin-bottom: -22px;

    display: flex;
    align-items: center;
}
</style>

