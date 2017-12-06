<template>
    <div class="schedule-view-sidebar">
        <v-card class="options" v-if="schedule">
            <v-card-title>
                <span class="title">Schedule options</span>
            </v-card-title>

            <v-card-text>
                <v-text-field label="Name" :value="schedule.name" @input="setName($event)"/>
            </v-card-text>

            <v-card-actions>
                <v-btn flat icon @click="modify()"><v-icon>edit</v-icon></v-btn>
                <v-btn flat icon @click="del()"><v-icon>delete</v-icon></v-btn>
            </v-card-actions>
        </v-card>
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

<style module lang="less">
.options {
    margin-top: 16px;
}
</style>
