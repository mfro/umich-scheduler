<template>
    <v-card v-if="schedule">
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
</template>

<script>
export default {
    name: 'schedule-edit',

    props: {
        schedule: Object,
    },

    methods: {
        del() {
            this.$store.commit('schedules/delete', this.schedule.id);
            this.$emit('done');
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
                this.$emit('done');
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
</style>
