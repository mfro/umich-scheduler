<template>
    <div class="course" @click="toggle()">
        <input type="checkbox" :checked="course.enabled"/>
        <span class="id">{{ course.id }}</span>
    </div>
</template>

<script>
export default {
    name: 'schedule-course',

    props: {
        course: Object,
    },

    methods: {
        toggle() {
            this.$store.commit('generator/setEnabled', {
                course: this.course,
                enabled: !this.course.enabled,
            });

            this.$store.dispatch('generator/generate');
        },
    },
};
</script>

<style lang="less" scoped>
.course {
    cursor: pointer;
    padding: 5px 0;
    margin-top: 5px;
    display: flex;
    align-items: center;
}

input {
    width: 1.4em;
    height: 1.4em;
    margin: 3px 8px 4px 8px;
}
</style>

