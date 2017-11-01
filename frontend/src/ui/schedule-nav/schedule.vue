<template>
    <router-link class="saved-schedule" :to="'/schedules/' + schedule.name">
        <span class="name">{{ schedule.name }}</span>
    </router-link>
</template>

<script>
export default {
    name: 'saved-schedule',

    props: {
        schedule: Object,
    },
};
</script>

<style lang="less" scoped>
.saved-schedule {
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

