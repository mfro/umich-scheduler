<template>
    <div class="schedule-view-sidebar">
        <md-card class="options" v-if="schedule">
            <md-toolbar class="md-dense md-transparent">
                <div class="md-title">Schedule options</div>
            </md-toolbar>

            <md-card-content>
                <md-input-container>
                    <label>Name</label>
                    <md-input :value="schedule.name" @input="setName($event)"/>
                </md-input-container>
            </md-card-content>

            <md-card-actions>
                <md-button class="md-icon-button" @click="modify()"><md-icon>edit</md-icon></md-button>
                <md-button class="md-icon-button" @click="del()"><md-icon>delete</md-icon></md-button>
            </md-card-actions>
        </md-card>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'schedule-view-sidebar',

    computed: {
        ...mapGetters({
            saved: 'schedules/saved',
        }),

        schedule() {
            let id = this.$route.params.id;
            return this.saved.find((s) => s.id == id);
        },
    },

    methods: {
        del() {
            this.$store.commit('schedules/delete', this.schedule.id);
        },

        modify() {
            let done = new Set();

            this.$store.dispatch('generator/reset').then(() => {
                return this.schedule.blocks;
            }).each((block) => {
                let course = block.section.getCourse();

                let first;
                if (!done.has(course)) {
                    done.add(course);
                    first = this.$store.dispatch('generator/toggleCourse', course);
                } else {
                    first = Promise.resolve();
                }

                return first.then(() => {
                    return this.$store.dispatch('generator/lockSection', block.section);
                });
            }).then(() => {
                return this.$store.dispatch('generator/generate');
            }).then(() => {
                this.$router.push('/');
            });
        },

        setName(name) {
            this.$store.commit('schedules/setName', {
                id: this.schedule.id,
                name: name,
            });
        },
    },
};
</script>

<style lang="less" scoped>
.options {
    margin-top: 16px;
}
</style>
