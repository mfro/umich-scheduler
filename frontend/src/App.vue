<template>
    <v-app v-resize="resize">
        <v-layout justify-center v-if="isCompact">
            <v-layout column class="root">
                <v-layout pa-3>
                    <v-flex class="column" mr-3>
                        <generator-input v-if="isGenerator"/>
                        <schedule-edit v-else :schedule="viewing" @done="viewing = null"/>
                    </v-flex>

                    <v-layout class="column" column mr-3>
                        <schedule-nav v-model="viewing"/>
                        <generator-save v-if="isGenerator"/>
                    </v-layout>

                    <v-layout column class="column" mr-3>
                        <settings-pane/>
                    </v-layout>
                    
                    <v-layout column class="column">
                        <help-pane/>
                    </v-layout>
                </v-layout>

                <v-layout justify-center mt-3>
                    <calendar-view :blocks="current" interactive/>
                </v-layout>
            </v-layout>
        </v-layout>

        <v-layout v-else>
            <div class="sidebar ma-3">
                <v-layout column>
                    <generator-input v-if="isGenerator"/>
                    <schedule-edit v-else :schedule="viewing"/>
                </v-layout>
            </div>

            <v-layout column class="root arg">
                <v-layout py-3>
                    <v-layout column class="column" mr-3>
                        <settings-pane/>
                    </v-layout>
                    
                    <v-layout column class="column">
                        <help-pane/>
                    </v-layout>
                </v-layout>

                <v-layout justify-center mt-3>
                    <calendar-view :blocks="current" interactive/>
                </v-layout>
            </v-layout>

            <div class="sidebar ma-3">
                <v-layout column>
                    <schedule-nav v-model="viewing"/>
                    <generator-save v-if="isGenerator" @done="viewing = null"/>
                </v-layout>
            </div>
        </v-layout>
    </v-app>
</template>

<script>
import { mapGetters } from 'vuex';

import SettingsPane from '@/ui/settings-pane';
import ScheduleNav from '@/ui/schedule-nav';
import HelpPane from '@/ui/help-pane';

import GeneratorInput from '@/ui/generator-input';
import GeneratorSave from '@/ui/generator-save';

import ScheduleEdit from '@/ui/schedule-edit';
import CalendarView from '@/ui/calendar-view';

export default {
    components: {
        GeneratorInput,
        GeneratorSave,
        SettingsPane,
        ScheduleNav,
        HelpPane,
        ScheduleEdit,
        CalendarView,
    },

    data() {
        return {
            isCompact: window.innerWidth < 1850,
            viewing: null,
            sidebarStyle: {
                willChange: 'transform',
            },
        };
    },

    created() {
        window.addEventListener('scroll', (e) => {
            let offset = pageYOffset;
            this.sidebarStyle = {
                willChange: 'transform',
                transform: `translateY(${offset}px)`,
            };
        });
    },

    computed: {
        ...mapGetters({
            generated: 'generator/current',
        }),

        current() {
            if (this.viewing) {
                return this.viewing.blocks;
            }

            return this.generated || [];
        },

        isGenerator() {
            return this.viewing == null;
        },
    },

    methods: {
        resize() {
            this.isCompact = window.innerWidth < 1850;
        },
    },
};
</script>

<style module lang="less">
.root {
    height: 100%;
    margin: auto;
    max-width: 1440px;
}

.column {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
}

.sidebar {
    flex: 0 0 280px;
    display: flex;
    flex-direction: column;

    > div {
        width: 280px;
        position: fixed;
    }
}

.center {
    flex: 0 0 70%;
    display: flex;
    flex-direction: column;

    height: 100vh;
    overflow: hidden;
}
</style>

<style lang="less">
body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
