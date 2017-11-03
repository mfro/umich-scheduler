<template>
    <div class="generated-schedules-sidebar">
        <md-card class="options">
            <md-toolbar class="md-dense md-transparent">
                <div class="md-title">Schedule generator</div>
            </md-toolbar>

            <md-card-area class="md-inset">
                <md-tabs md-fixed class="tabs md-transparent">
                    <md-tab md-icon="edit">
                        <generator-input/>
                    </md-tab>

                    <md-tab md-icon="save">
                        <generator-save/>
                    </md-tab>
                </md-tabs>
            </md-card-area>

            <md-card-actions class="nav-area" :class="{ active: isReady }">
                <md-button class="md-icon-button" @click="nav(-1)" ref="leftArrow">
                    <md-icon>chevron_left</md-icon>
                </md-button>

                <span class="display">{{ index + 1 }}</span>
                <span class="display">of</span>
                <span class="display">{{ total }}</span>

                <md-button class="md-icon-button" @click="nav(1)" ref="rightArrow">
                    <md-icon>chevron_right</md-icon>
                </md-button>
            </md-card-actions>

            <md-progress class="progress" :class="{ active: isLoading }" md-indeterminate/>
        </md-card>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import GeneratorInput from './generator-input';
import GeneratorSave from './generator-save';

import * as keyboard from '@/workers/keyboard';

export default {
    name: 'generated-schedules-sidebar',

    components: {
        GeneratorInput,
        GeneratorSave,
    },

    computed: {
        ...mapGetters({
            index: 'generator/currentIndex',
            total: 'generator/total',
            isLoading: 'generator/isLoading',
        }),

        isReady() {
            return !this.isLoading && this.total > 0;
        },
    },

    created() {
        this.$use(keyboard.onPress(keyboard.LEFT_ARROW, () => {
            this.nav(-1);
        }));

        this.$use(keyboard.onPress(keyboard.RIGHT_ARROW, () => {
            this.nav(1);
        }));
    },

    methods: {
        nav(offset) {
            let index = this.index + offset;
            this.$store.dispatch('generator/setIndex', index);
        },
    },
};
</script>

<style lang="less" scoped>
.options {
    margin-top: 16px;
}

.nav-area {
    opacity: 0;
    pointer-events: none;

    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    .display {
        flex: 0 0 10%;
        text-align: center;
    }

    &.active {
        opacity: 1;
        pointer-events: initial;
    }
}

.progress {
    opacity: 0;
    position: absolute;
    bottom: 0;

    &.active {
        opacity: 1;
    }
}

</style>
