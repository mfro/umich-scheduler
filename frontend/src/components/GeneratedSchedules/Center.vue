<template>
    <div class="generated-schedules">
        <div class="nav">
            <span class="nav-button" @click="nav(-1)">{{ '<' }}</span>

            <span class="display">{{ index + 1 }} of {{ schedules.length }}</span>

            <span class="nav-button" @click="nav(+1)">{{ '>' }}</span>
        </div>

        <div class="calendar-container">
            <calendar-view :blocks="current" interactive/>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import CalendarView from '@/ui/calendar-view';

export default {
    components: {
        CalendarView,
    },

    computed: {
        ...mapGetters({
            index: 'generator/index',
            generated: 'generator/current',
            schedules: 'generator/generated',
        }),

        current() {
            return this.generated || [];
        },
    },

    created() {
        window.addEventListener('keydown', this.onKeyDown);
    },

    destroyed() {
        window.removeEventListener('keydown', this.onKeyDown);
    },

    methods: {
        nav(offset) {
            this.$store.commit('generator/select', offset);
        },

        onKeyDown(e) {
            if (e.keyCode == 37) {
                this.nav(-1);
            } else if (e.keyCode == 39) {
                this.nav(+1);
            }
        },
    },
};
</script>

<style lang="less" scoped>
.generated-schedules {
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
