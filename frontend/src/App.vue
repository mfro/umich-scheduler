<template>
    <div class="root">
        <div class="sidebar">
            <router-view name="sidebar"/>
            <schedule-nav/>
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
.nav {
    display: flex;
    align-self: center;
    align-items: center;
    padding: 10px;

    .nav-button {
        user-select: none;
        -webkit-user-select: none;

        cursor: pointer;
        padding: 5px 10px;
        border-radius: 5px;

        &:hover {
            background: #efefef;
        }
    }
    .display {
        padding: 5px 10px;
    }
}

.calendar-container {
    display: flex;
    justify-content: center;
}
</style>

<style lang="less">
body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
