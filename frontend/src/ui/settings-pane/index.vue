<template>
    <div class="settings">
        <div class="setting">
            <span>Day start:</span>
            <input type="number" :value="dayStart" @input="setDayStart(+$event.target.value)"/>
        </div>
        
        <div class="setting">
            <span>Day end:</span>
            <input type="number" :value="dayEnd" @input="setDayEnd(+$event.target.value)"/>
        </div>
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
.settings {
    display: flex;
    flex-direction: column;
    padding: 10px;
}

.setting {
    display: flex;
    flex-direction: column;
    margin-top: 10px;

    span {
        margin-bottom: 6px;
    }

    input {
        font-size: inherit;
    }
}
</style>
