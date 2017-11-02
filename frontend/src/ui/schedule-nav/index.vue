<template>
    <uikit-toolbox>
        <span slot="header">View schedules</span>

        <saved-schedule/>

        <saved-schedule v-for="(schedule, i) in saved" :key="i" :schedule="schedule"/>
    </uikit-toolbox>
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
    margin: 8px;

    border: 1px solid lightgray;
}

.link {
    margin-left: 6px;

    display: block;
    cursor: pointer;
    padding: 5px 0;
    margin-top: 5px;
    display: flex;
    align-items: center;

    color: inherit;
    text-decoration: none;
}
</style>

