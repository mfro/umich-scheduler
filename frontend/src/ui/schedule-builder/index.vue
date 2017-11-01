<template>
    <div class="schedule-builder">
        <schedule-courses/>
        
        <saved-schedules/>
    </div>
</template>

<script>
import SavedSchedules from './saved.vue';
import ScheduleCourses from './courses.vue';

export default {
    name: 'schedule-builder',

    components: {
        SavedSchedules,
        ScheduleCourses,
    },
};
</script>

<style lang="less" scoped>
.add-form {
    padding: 10px;

    .course-input {
        margin-right: 10px;
    }
}
</style>

