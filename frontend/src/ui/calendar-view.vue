<template>
    <div class="schedule-view">
        <div class="header">
            <div class="sidebar-spacer"/>

            <div class="day-labels">
                <div class="label" v-for="day in days" :key="day.id">
                    <span>{{ day.name }}</span>
                </div>
            </div>
        </div>

        <div class="body">
            <div class="sidebar">
                <div class="time" v-for="time in timeLabels" :key="time" :style="timeStyle">
                    <span>{{ time }}</span>
                </div>
            </div>

            <div class="calendar">
                <div class="lines">
                    <div class="line" v-for="time in timeLabels" :key="time" :style="lineStyle"/>
                </div>

                <calendar-day v-for="day in days" :key="day.id" :day="day.id" :schedule="schedule"/>
            </div>
        </div>
    </div>
</template>

<script>
import * as config from './config';

import CalendarDay from './calendar-day.vue';

const days = [
    { name: 'Monday', id: 'M', },
    { name: 'Tuesday', id: 'T', },
    { name: 'Wednesday', id: 'W', },
    { name: 'Thursday', id: 'TH', },
    { name: 'Friday', id: 'F', },
];

export default {
    components: {
        CalendarDay,
    },

    props: {
        schedule: Array,
    },

    data() {
        return {
            days: days,
        };
    },

    computed: {
        timeLabels() {
            let labels = [];
            for (let t = config.dayStart; t < config.dayEnd; t++) {
                labels.push(t + ':00');
            }
            return labels;
        },

        timeStyle() {
            let part = 100 / config.dayLength;
            return {
                flex: `0 0 ${part}vh`,
            };
        },

        lineStyle() {
            let part = 100 / config.dayLength;
            return {
                marginBottom: `calc(${part}vh - 1px)`,
            };
        }
    },
};

</script>

<style lang="less" scoped>
.schedule-view {
    margin: 0 15%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-self: flex-start;
}

.sidebar, .sidebar-spacer {
    flex: 0 0 100px;
    box-sizing: border-box;
}

.header {
    display: flex;
}

.day-labels {
    flex: 1;
    display: flex;

    .label {
        flex: 1;
        padding: 10px 0;
        text-align: center;
    }
}

.body {
    flex: 0 0 100vh;
    display: flex;
}

.sidebar {
    padding-right: 10px;
    display: flex;
    flex-direction: column;
}

.time {
    text-align: right;
}

.calendar {
    flex: 1;
    display: flex;
    position: relative;
}

.lines {
    position: absolute;
    width: 100%;
    height: 100%;

    .line {
        background: lightgray;
        height: 1px;
    }
}
</style>
