<template>
    <v-layout column px-3>
        <v-text-field label="Name" v-model="nameInput"/>

        <v-layout justify-end>
            <v-btn @click="save()" :disabled="!isValid">Save</v-btn>
        </v-layout>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import Block from '@/workers/block';

export default {
    name: 'generator-save',

    data() {
        return {
            nameInput: '',
        };
    },

    computed: {
        ...mapGetters({
            current: 'generator/current',
        }),

        isValid() {
            return this.nameInput && this.current && this.current.length > 0;
        },
    },

    methods: {
        save() {
            const schedule = {
                name: this.nameInput,
                blocks: [].concat(...this.current.map((s) => {
                    return s.section.blocks.map((b) => {
                        return new Block.Course(s.color, s.section, b);
                    });
                })),
            };

            this.$store.commit('schedules/save', schedule);
        },
    },
};
</script>

<style module lang="less">
</style>
