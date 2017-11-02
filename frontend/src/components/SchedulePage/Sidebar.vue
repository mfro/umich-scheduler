<template>
    <div class="schedule-view-sidebar">
        <md-card class="options">
            <md-toolbar class="md-dense md-transparent">
                <div class="md-title">Schedule options</div>
            </md-toolbar>

            <md-card-content>
                <md-input-container>
                    <label>Name</label>
                    <md-input v-model="schedule.name" @input="setName($event.target.value)"/>
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

        async modify() {
            await this.$store.dispatch('generator/reset');

            let done = new Set();
            for (let block of this.schedule.blocks) {
                let course = block.section.getCourse();

                if (!done.has(course)) {
                    done.add(course);
                    await this.$store.dispatch('generator/addCourse', course);
                }

                await this.$store.dispatch('generator/lockSection', block.section);
            }

            await this.$store.dispatch('generator/generate');
            this.$router.push('/');
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
    margin: 16px;
}

.schedule-view-sidebar {
    display: flex;
    flex-direction: column;
}

.back {
    margin: 20px 10px 10px 10px;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
}

.contents {
    padding-bottom: 6px;
}

.option {
    display: flex;
    flex-direction: column;
    margin: 8px 6px 0 6px;

    span {
        margin-bottom: 6px;
    }

    input {
        font-size: inherit;
    }
}

.button {
    margin: 8px 0 0 6px;
}
</style>
