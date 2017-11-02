<template>
    <div>
        <md-input-container>
            <label>Name</label>
            <md-input v-model="nameInput"/>
        </md-input-container>

        <md-card-actions class="actions">
            <md-button @click="save()" :disabled="!isValid">Save</md-button>
        </md-card-actions>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Block from '@/workers/block';

export default {
    name: 'generator-save',

    data() {
        return {
            nameInput: 'Untitled',
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
                blocks: this.current.map((b) => {
                    return new Block.Course(b.color, b.section);
                }),
            };

            this.$store.commit('schedules/save', schedule);
        },
    },
};
</script>

<style lang="less" scoped>
.actions {
    margin: -16px;
}
</style>
