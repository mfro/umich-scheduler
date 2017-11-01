<template>
    <div class="schedule-page">
        <div class="calendar-container" v-if="schedule">
            <calendar-view :blocks="schedule.blocks"/>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import CalendarView from '@/ui/calendar-view';

export default {
    components: {
        CalendarView,
    },

    props: {
        name: String,
    },

    computed: {
        ...mapGetters({
            saved: 'schedules/saved',
        }),

        schedule() {
            return this.saved.find((s) => s.name == this.name);
        },
    },

    created() {
        if (!this.schedule) {
            this.$router.push('/');
        }
    },
};
</script>

<style lang="less" scoped>
.schedule-page {
    display: flex;
    flex-direction: column;
}

.calendar-container {
    display: flex;
    justify-content: center;
}
</style>
