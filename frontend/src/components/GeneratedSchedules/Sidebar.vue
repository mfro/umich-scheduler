<template>
    <div class="generated-schedules-sidebar">
        <schedule-courses/>
        
        <div class="save-form">
            <h3>Save schedule:</h3>

            <input type="text" class="name-input" v-model="nameInput"/>
            <button class="submit" :disabled="!isValid" @click="onSave">Save</button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ScheduleCourses from './courses';

export default {
    name: 'save-schedule-form',

    components: {
        ScheduleCourses,
    },

    data() {
        return {
            nameInput: 'Untitled',
        };
    },

    computed: {
        ...mapGetters({
            current: 'generator/current',
            saved: 'schedules/saved',
        }),

        isValid() {
            return this.nameInput && this.current && this.current.length > 0;
        },
    },

    methods: {
        onSave() {
            const schedule = {
                name: this.nameInput,
                blocks: this.current.map((b) => ({
                    color: b.color,
                    course: { id: b.course.id },
                    section: b.section,
                })),
            };

            this.$store.commit('schedules/save', schedule);
        },
    },
};
</script>

<style lang="less" scoped>
.save-form {
    padding: 10px;
    
    .name-input {
        margin-right: 10px;
    }
}
</style>

