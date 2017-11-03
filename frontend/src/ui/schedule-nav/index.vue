<template>
    <md-card class="schedule-nav">
        <md-toolbar class="md-dense md-transparent">
            <div class="md-title">View schedules</div>
        </md-toolbar>

        <md-card-area class="contents">
            <md-list>
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
            </md-list>
        </md-card-area>
    </md-card>
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

<style lang="less" scoped>
.schedule-nav {
    margin-top: 16px;
}

.schedule .router-link-active {
    background-color: #efefef;
}
</style>

