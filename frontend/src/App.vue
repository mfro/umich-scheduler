<template>
    <v-app>
        <v-layout column class="root">
            <v-layout>
                <v-flex class="sidebar" pl-3 pr-2>
                    <router-view name="sidebar"/>
                </v-flex>

                <v-layout class="sidebar" column pr-2 pl-2>
                    <schedule-nav/>
                    <settings-pane/>
                </v-layout>
                
                <v-layout column class="sidebar" pr-3 pl-2>
                    <help-pane/>
                </v-layout>
            </v-layout>

            <v-flex mt-3>
                <router-view/>
            </v-flex>
        </v-layout>
    </v-app>
</template>

<script>
import SettingsPane from '@/ui/settings-pane';
import ScheduleNav from '@/ui/schedule-nav';
import HelpPane from '@/ui/help-pane';

export default {
    components: {
        SettingsPane,
        ScheduleNav,
        HelpPane,
    },
};
</script>

<style module lang="less">
.root {
    height: 100%;
}

.sidebar {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
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
