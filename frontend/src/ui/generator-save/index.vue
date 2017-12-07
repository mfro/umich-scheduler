<template>
    <v-card class="options">
        <v-card-title>
            <span class="title">Save schedule</span>
        </v-card-title>

        <v-card-text>
            <v-text-field label="Name" v-model="nameInput"/>
        </v-card-text>

        <v-card-actions>
            <v-btn @click="save()" :disabled="!isValid">Save</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

import Block from '@/lib/block';

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
.options {
    margin-top: 16px;
}
</style>
