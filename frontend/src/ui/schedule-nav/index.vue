<template>
    <div class="schedules-nav">
        <saved-schedule v-for="(schedule, i) in saved" :key="i" :schedule="schedule"/>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import SavedSchedule from './schedule.vue';

export default {
    name: 'schedules-nav',

    components: {
        SavedSchedule,
    },

    computed: {
        ...mapGetters({
            // current: 'generator/current',
            saved: 'schedules/saved',
        }),
    },
};
</script>

<style lang="less" scoped>
.schedules-nav {
    display: flex;
    flex-direction: column;
    padding: 10px;
}
</style>

