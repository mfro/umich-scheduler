<template>
    <div class="root">
        <div class="add-form">
            <h3>Add a course:</h3>

            <input type="text" class="course-input" v-model="courseInput"/>
            <button class="submit" @click="onCourseSubmit">Add</button>
        </div>

        <div class="course-list">
            <schedule-course v-for="course in courses" :key="course.id" :course="course"/>
        </div>

        <div class="nav">
            <span class="nav-button" @click="nav(-1)">{{ '<' }}</span>

            <span class="display">{{ currentIndex + 1 }} of {{ schedules.length }}</span>

            <span class="nav-button" @click="nav(+1)">{{ '>' }}</span>
        </div>

        <div class="calendar-container">
            <calendar-view :schedule="current"/>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import * as scheduler from './scheduler';
import CalendarView from './calendar-view.vue';
import ScheduleCourse from './schedule-course.vue';

export default {
    components: {
        CalendarView,
        ScheduleCourse,
    },

    data() {
        return {
            currentIndex: 0,
            courseInput: 'EECS 281',
        };
    },

    computed: {
        ...mapGetters({
            schedules: 'schedule/generated',
            courses: 'schedule/courses',
            previews: 'preview/active'
        }),

        current() {
            if (!this.previews)
                return this.schedules[this.currentIndex] || [];

            let list;
            if (this.schedules.length > 0)
                list = this.schedules[0].filter(a => a.isLock);
            else
                list = [];

            list = list.concat(this.previews.filter(a => {
                if (list.find(a2 => a2.section.id == a.section.id))
                    return false;

                return true;
            }));

            return list;
        },
    },

    created() {
        window.addEventListener('keydown', this.onKeyDown);
    },

    destroyed() {
        window.removeEventListener('keydown', this.onKeyDown);
    },

    methods: {
        onCourseSubmit() {
            let id = this.courseInput;

            this.$store.dispatch('schedule/addCourse', { id }).then(() => {
                this.courseInput = '';
                this.$store.dispatch('schedule/generate');
            });
        },

        nav(offset) {
            if (this.schedules.length == 0) {
                this.currentIndex = 0;
                return;
            }

            this.currentIndex = (this.currentIndex + offset) % this.schedules.length;
            while (this.currentIndex < 0)
                this.currentIndex += this.schedules.length;
        },

        onKeyDown(e) {
            if (e.keyCode == 37)
                this.nav(-1);

            else if (e.keyCode == 39)
                this.nav(+1);
        },
    }
};
</script>

<style scoped lang="less">
.root {
    display: flex;
    flex-direction: column;
}

.add-form {
    padding: 10px;

    .course-input {
        margin-right: 10px;
    }
}

.nav {
    display: flex;
    align-self: center;
    align-items: center;
    padding: 10px;

    .nav-button {
        user-select: none;
        -webkit-user-select: none;

        cursor: pointer;
        padding: 5px 10px;
        border-radius: 5px;

        &:hover {
            background: #efefef;
        }
    }
    .display {
        padding: 5px 10px;
    }
}

.calendar-container {
    display: flex;
    justify-content: center;
}
</style>

