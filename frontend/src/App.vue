<template>
    <div class="root">
        <div class="sidebar">
            <router-view name="sidebar"/>
        </div>

        <div class="center">
            <router-view/>
        </div>

        <div class="sidebar">
            <schedule-nav/>
            <settings-pane/>
            <help-pane/>
        </div>
    </div>
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

<style scoped lang="less">
.root {
    display: flex;
}

.sidebar {
    flex: 1 0;
    display: flex;
    flex-direction: column;
    padding: 0 16px 16px 16px;
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
