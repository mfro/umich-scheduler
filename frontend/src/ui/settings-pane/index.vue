<template>
    <div class="settings">
        <md-card class="calendar">
            <md-toolbar class="md-dense md-transparent">
                <div class="md-title">Calendar Settings</div>
            </md-toolbar>

            <md-card-content>
                <md-input-container>
                    <label>Day start</label>
                    <md-input type="number" :value="dayStart" @input="setDayStart(+$event)"/>
                </md-input-container>
                
                <md-input-container>
                    <label>Day end</label>
                    <md-input type="number" :value="dayEnd" @input="setDayEnd(+$event)"/>
                </md-input-container>
            </md-card-content>
        </md-card>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
    name: 'settings-pane',

    computed: {
        ...mapGetters('settings', {
            dayStart: 'dayStart',
            dayEnd: 'dayEnd',
        }),
    },

    methods: {
        ...mapMutations('settings', {
            setDayStart: 'setDayStart',
            setDayEnd: 'setDayEnd',
        }),
    },
};
</script>

<style lang="less" scoped>
.calendar {
    margin-top: 16px;
}
</style>
