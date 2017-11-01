<template>
    <div class="schedule-courses">
        <div class="add-form">
            <h3>Add a course:</h3>

            <input type="text" class="course-input" v-model="courseInput"/>
            <button class="submit" @click="onCourseSubmit">Add</button>
        </div>

        <div class="course-list">
            <schedule-course v-for="course in courses" :key="course.id" :course="course"/>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ScheduleCourse from './course.vue';

export default {
    name: 'schedule-courses',

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
        onCourseSubmit() {
            let id = this.courseInput;

            this.$store.dispatch('generator/addCourse', { id }).then(() => {
                this.courseInput = '';
                this.$store.dispatch('generator/generate');
            });
        },
    },
};
</script>

<style lang="less" scoped>
.schedule-courses {
    padding: 10px;
}

.add-form {
    .course-input {
        margin-right: 10px;
    }
}
</style>

