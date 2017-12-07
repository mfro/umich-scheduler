<template>
    <v-card class="schedule-nav">
        <v-card-title>
            <span class="title">View schedules</span>
        </v-card-title>

        <v-card-text class="pa-0">
            <v-list>
                <v-list-tile @click="select(null)">
                    <span>Generated</span>
                </v-list-tile>

                <v-list-tile v-for="schedule in saved" :key="schedule.id" @click="select(schedule)">
                    <span>{{ schedule.name }}</span>
                </v-list-tile>
            </v-list>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'schedules-nav',

    props: {
        value: Object,
    },

    computed: {
        ...mapGetters({
            saved: 'schedules/saved',
        }),
    },

    methods: {
        select(schedule) {
            this.$emit('input', schedule);
        },
    },
};
</script>

<style module lang="less">
</style>

