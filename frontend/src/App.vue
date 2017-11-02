<template>
    <div class="root">
        <div class="sidebar">
            <schedule-nav/>
            <router-view name="sidebar"/>
        </div>

        <div class="center">
            <router-view/>
        </div>

        <div class="sidebar">
            <settings-pane/>
        </div>
    </div>
</template>

<script>
import SettingsPane from '@/ui/settings-pane';
import ScheduleNav from '@/ui/schedule-nav';

export default {
    components: {
        SettingsPane,
        ScheduleNav,
    },
};
</script>

<style scoped lang="less">
.root {
    display: flex;
}

.sidebar {
    flex: 1 0;
}

.center {
    flex: 0 0 70%;
    display: flex;
    flex-direction: column;
}
</style>

<style lang="less">
body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
