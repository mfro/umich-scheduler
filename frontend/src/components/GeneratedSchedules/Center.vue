<template>
    <div class="generated-schedules">
        <div class="calendar-container">
            <calendar-view :blocks="current" interactive/>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import CalendarView from '@/ui/calendar-view';

export default {
    name: 'generated-schedules',

    components: {
        CalendarView,
    },

    computed: {
        ...mapGetters({
            generated: 'generator/current',
        }),

        current() {
            return this.generated || [];
        },
    },
};
</script>

<style lang="less" scoped>
.generated-schedules {
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
