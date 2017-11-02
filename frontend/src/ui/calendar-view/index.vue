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

                <calendar-day v-for="day in days" :key="day.id" :day="day.id" :blocks="activeBlocks" :interactive="interactive"
                    @hide="onHide" @lock="onLock" @preview="onPreview"/>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import CalendarDay from './day.vue';
import Block from '@/workers/block';

const days = [
    { name: 'Monday', id: 'M' },
    { name: 'Tuesday', id: 'T' },
    { name: 'Wednesday', id: 'W' },
    { name: 'Thursday', id: 'TH' },
    { name: 'Friday', id: 'F' },
];

export default {
    name: 'calendar-view',

    components: {
        CalendarDay,
    },

    props: {
        blocks: Array,
        interactive: Boolean,
    },

    data() {
        return {
            days: days,

            previewTarget: null,
        };
    },

    computed: {
        ...mapGetters('settings', {
            dayStart: 'dayStart',
            dayEnd: 'dayEnd',
        }),

        timeLabels() {
            let labels = [];
            for (let t = this.dayStart; t < this.dayEnd; t++) {
                labels.push(t + ':00');
            }
            return labels;
        },

        timeStyle() {
            let part = 100 / (this.dayEnd - this.dayStart);
            return {
                flex: `0 0 ${part}vh`,
            };
        },

        lineStyle() {
            let part = 100 / (this.dayEnd - this.dayStart);
            return {
                marginBottom: `calc(${part}vh - 1px)`,
            };
        },

        activeBlocks() {
            let target = this.previewTarget;
            if (!target) return this.blocks;

            let flag;
            if (target.section.flags.includes('P')) {
                flag = 'P';
            } else if (target.section.flags.includes('A')) {
                flag = 'A';
            } else if (target.section.flags.includes('S')) {
                flag = 'S';
            } else {
                throw new Error('???: ' + target.section.flags);
            }

            let hidden = this.$store.getters['generator/hidden'];
            let sections = this.$store.getters['courses/all'].filter((c) => {
                return c.courseId == target.section.courseId &&
                    c.subject == target.section.subject &&
                    c.component == target.section.component &&
                    c.flags.includes(flag);
            });
            let generated = this.$store.getters['generator/all'];

            let previewing = sections.map((s) => {
                let isHidden = hidden.find((s2) => s2.id == s.id) != null;
                let occurences = generated.filter(
                    (list) => list.find((b) => b.section == s)).length;

                return new Block.PreviewCourse(target.color, s, isHidden, occurences);
            });

            let base = this.blocks.filter((a) => a.isLocked);
            return base.concat(previewing.filter((a) => {
                if (base.find((a2) => a2.section.id == a.section.id)) {
                    return false;
                }

                return true;
            }));
        },
    },

    methods: {
        onHide(block) {
            if (!this.interactive) return;
            if (!block.isCourse) return;

            this.$store.dispatch('generator/hideSection', block.section).then(() => {
                this.$store.dispatch('generator/generate');
            });
        },

        onLock(block) {
            if (!this.interactive) return;
            if (!block.isCourse) return;

            if (this.previewTarget && !block.isLocked) {
                this.previewTarget = null;
            }

            this.$store.dispatch('generator/lockSection', block.section).then(() => {
                this.$store.dispatch('generator/generate');
            });
        },

        onPreview(block) {
            if (this.previewTarget) {
                this.previewTarget = null;
            } else {
                this.previewTarget = block;
            }
        },
    },
};

</script>

<style lang="less" scoped>
.schedule-view {
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
