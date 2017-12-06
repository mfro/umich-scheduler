<template>
    <v-card class="schedule-nav mt-3">
        <v-card-title>
            <span class="title">View schedules</span>
        </v-card-title>

        <v-card-text class="pa-0">
            <v-list>
                <v-list-tile to="/schedules/generated">
                    <span>Generated</span>
                </v-list-tile>

                <v-list-tile v-for="schedule in saved" :key="schedule.id" :to="'/schedules/' + schedule.id">
                    <span>{{ schedule.name }}</span>
                </v-list-tile>
            </v-list>
            <!-- <md-list>
                <md-list-item class="schedule">
                    <router-link to="/schedules/generated">
                        <span>Generated</span>
                    </router-link>
                </md-list-item>

                <md-list-item v-for="schedule in saved" :key="schedule.id" class="schedule">
                    <router-link :to="'/schedules/' + schedule.id">
                        <span>{{ schedule.name }}</span>
                    </router-link>
                </md-list-item>
            </md-list> -->
        </v-card-text>
    </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'schedules-nav',

    computed: {
        ...mapGetters({
            saved: 'schedules/saved',
        }),
    },
};
</script>

<style module lang="less">
.schedule .router-link-active {
    background-color: #efefef;
}
</style>

