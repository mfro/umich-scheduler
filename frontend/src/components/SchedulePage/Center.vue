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

    computed: {
        ...mapGetters({
            saved: 'schedules/saved',
        }),

        schedule() {
            let id = this.$route.params.id;
            return this.saved.find((s) => s.id == id);
        },
    },

    created() {
        if (!this.schedule) {
            this.$router.push('/');
        }
    },

    watch: {
        schedule(s) {
            if (!this.schedule) {
                this.$router.push('/');
            }
        },
    },
};
</script>

<style lang="less" scoped>
.schedule-page {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.calendar-container {
    flex: 1;
    display: flex;
    justify-content: center;
}
</style>
