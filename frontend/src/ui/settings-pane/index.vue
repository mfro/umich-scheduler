<template>
    <v-card class="mt-3">
        <v-card-title>
            <span class="title">Calendar settings</span>
        </v-card-title>

        <v-card-text>
            <v-text-field type="number" label="Day start" :value="dayStart" @input="setDayStart(+$event)"/>
            <v-text-field type="number" label="Day end" :value="dayEnd" @input="setDayEnd(+$event)"/>
        </v-card-text>
    </v-card>
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

<style module lang="less">
.calendar {
    margin-top: 16px;
}
</style>
