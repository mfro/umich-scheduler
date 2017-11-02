<template>
    <router-link :to="path" class="saved-schedule">
        <span class="name">{{ name }}</span>
    </router-link>
</template>

<script>
export default {
    name: 'saved-schedule',

    props: {
        schedule: { type: Object, default: null },
    },

    computed: {
        path() {
            if (!this.schedule) {
                return `/schedules/generated`;
            }

            return `/schedules/${this.schedule.id}`;
        },

        name() {
            if (!this.schedule) {
                return 'Generated';
            }

            return this.schedule.name;
        },
    },
};
</script>

<style lang="less" scoped>
.saved-schedule {
    display: block;
    cursor: pointer;
    padding: 8px 5px 6px 5px;
    margin-top: 4px;
    display: flex;
    align-items: center;

    color: inherit;
    text-decoration: none;

    &.router-link-active {
        background: lightblue;
    }
}
</style>

