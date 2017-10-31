<template>
    <div class="day">
        <calendar-section v-for="block in blocks" :key="block.section.id" :block="block"/>
    </div>
</template>

<script>
import * as util from '@/util';

import CalendarSection from './calendar-section.vue';

export default {
    components: {
        CalendarSection,
    },

    props: {
        day: String,
        schedule: Array,
    },

    computed: {
        // sections() {
        //     return this.schedule.filter(s => {
        //         return s.section.days.includes(this.day);
        //     });
        // },

        blocks() {
            let list = this.schedule.filter(s => {
                return s.section.days.includes(this.day);
            }).map(s => ({
                ...s,
                time: util.parseTime(s.section.time),
            })).sort((a, b) => {
                if (a.time.start != b.time.start)
                    return a.time.start - b.time.start;
                return a.time.end - b.time.end;
            });

            let currentGroupEnd = -1;
            let currentGroup = [];
            for (let item of list) {
                if (currentGroupEnd <= item.time.start) {
                    for (let i = 0; i < currentGroup.length; i++) {
                        currentGroup[i].groupSize = currentGroup.length;
                        currentGroup[i].groupIndex = i;
                    }

                    currentGroup = [];
                }

                currentGroup.push(item);
                currentGroupEnd = item.time.end;
            }

            for (let i = 0; i < currentGroup.length; i++) {
                currentGroup[i].groupSize = currentGroup.length;
                currentGroup[i].groupIndex = i;
            }

            return list;
        },
    },
};
</script>

<style lang="less" scoped>
.day {
    flex: 1 1;
    position: relative;
}
</style>
