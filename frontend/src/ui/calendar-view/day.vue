<template>
    <div class="day">
        <calendar-section v-for="a in sorted" :key="a.block.section.id" :block="a.block" :group="a.group" :interactive="interactive"
            @hide="onHide" @lock="onLock" @preview="onPreview"/>
    </div>
</template>

<script>
import CalendarSection from './section.vue';

export default {
    name: 'calendar-day',

    components: {
        CalendarSection,
    },

    props: {
        day: String,
        blocks: Array,
        interactive: Boolean,
    },

    computed: {
        sorted() {
            let list = this.blocks.filter((s) => {
                return s.section.days.includes(this.day);
            }).map((s) => ({
                block: s,
                group: {},
            })).sort((a, b) => {
                if (a.block.start != b.block.start) {
                    return a.block.start - b.block.start;
                }
                return a.block.end - b.block.end;
            });

            let currentGroupEnd = -1;
            let currentGroup = [];
            for (let item of list) {
                if (currentGroupEnd <= item.block.start) {
                    for (let i = 0; i < currentGroup.length; i++) {
                        currentGroup[i].group.size = currentGroup.length;
                        currentGroup[i].group.index = i;
                    }

                    currentGroup = [];
                }

                currentGroup.push(item);
                currentGroupEnd = item.block.end;
            }

            for (let i = 0; i < currentGroup.length; i++) {
                currentGroup[i].group.size = currentGroup.length;
                currentGroup[i].group.index = i;
            }

            return list;
        },
    },

    methods: {
        onHide(block) {
            this.$emit('hide', block);
        },

        onLock(block) {
            this.$emit('lock', block);
        },

        onPreview(block) {
            this.$emit('preview', block);
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
