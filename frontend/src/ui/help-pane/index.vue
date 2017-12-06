<template>
    <v-card class="root">
        <template v-if="page == 1">
            <v-card-title>
                <span class="title">Adding courses</span>
            </v-card-title>

            <v-card-text class="text">
                <p>Add courses at the left side of the screen. Example: <pre>MATH 215</pre></p>
                
                <p>Courses can be toggled off to exclude them from the schedule.</p>
                
                <p>Find courses using the <a href="https://www.lsa.umich.edu/cg/" target="_blank">course guide</a>.</p>
            </v-card-text>
        </template>

        <template v-if="page == 2">
            <v-card-title>
                <span class="title">Customizing schedule</span>
            </v-card-title>

            <v-card-text class="text">
                <p>Use the calendar view to select and custmize sections.</p>
                
                <p>- Left click or Q 'locks' a section</p>
                
                <p>- Middle click or W previews alternatives to a section</p>
                
                <p>- Right click or E 'hides' a section</p>
            </v-card-text>
        </template>

        <template v-if="page == 3">
            <v-card-title>
                <span class="title">Saving schedules</span>
            </v-card-title>

            <v-card-text class="text">
                <p>Use the <v-icon>save</v-icon> tab to save a schedule.</p>
                
                <p>Access saved schedules on the right side of the screen.</p>
                    
                <p>
                    While viewing a schedule, click the <v-icon>edit</v-icon> button
                    to load it into the generator.
                </p>
            </v-card-text>
        </template>

        <div>
            <v-layout justify-center pa-2>
                <v-pagination :length="3" v-model="page"/>
            </v-layout>
        </div>
    </v-card>
</template>

<script>
export default {
    data() {
        return {
            page: 1,
        };
    },
};
</script>

<style scoped lang="less">
.root {
    flex: 1 1;
    display: flex;
    flex-direction: column;
    margin-top: 16px;
}

.text {
    flex: 1 1;
}

pre {
    margin: 0;
    font-size: inherit;
    display: inline;
}
</style>