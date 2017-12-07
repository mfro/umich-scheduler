<template>
    <div class="generated-schedules-sidebar">
        <v-card class="options">
            <v-card-title>
                <span class="title">Schedule generator</span>
            </v-card-title>

            <v-tabs>
                <v-tabs-bar>
                    <v-tabs-item ripple href="#edit">
                        <v-icon>edit</v-icon>
                    </v-tabs-item>
                    <v-tabs-item ripple href="#save">
                        <v-icon>save</v-icon>
                    </v-tabs-item>
                    <v-tabs-slider color="black"></v-tabs-slider>
                </v-tabs-bar>

                <v-tabs-items>
                    <v-tabs-content id="edit">
                        <generator-input/>
                    </v-tabs-content>

                    <v-tabs-content id="save">
                        <generator-save/>
                    </v-tabs-content>
                </v-tabs-items>
            </v-tabs>

            <v-card-actions class="nav-area" :class="{ active: isReady }">
                <v-btn icon @click="nav(-1)">
                    <v-icon>chevron_left</v-icon>
                </v-btn>

                <span class="display">{{ index + 1 }}</span>
                <span class="display">of</span>
                <span class="display">{{ total }}</span>

                <v-btn icon @click="nav(1)">
                    <v-icon>chevron_right</v-icon>
                </v-btn>
            </v-card-actions>

            <v-progress-linear class="progress" :class="{ active: isLoading }" indeterminate/>
        </v-card>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import GeneratorInput from './generator-input';
import GeneratorSave from './generator-save';

import * as keyboard from '@/lib/keyboard';

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

<style module lang="less">
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
    bottom: 0;
    position: absolute;

    &.active {
        opacity: 1;
    }
}
</style>
