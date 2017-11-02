<template>
    <div class="generated-schedules-sidebar">
        <md-card class="options">
            <md-toolbar class="md-dense md-transparent">
                <div class="md-title">Schedule generator</div>
            </md-toolbar>

            <md-card-area>
                <md-tabs md-fixed class="tabs md-transparent">
                    <md-tab md-icon="edit">
                        <generator-input/>
                    </md-tab>

                    <md-tab md-icon="save">
                        <generator-save/>
                    </md-tab>
                </md-tabs>
            </md-card-area>
        </md-card>
    </div>
</template>

<script>
import GeneratorInput from './generator-input';
import GeneratorSave from './generator-save';

export default {
    name: 'generated-schedules-sidebar',

    components: {
        GeneratorInput,
        GeneratorSave,
    },
};
</script>

<style lang="less" scoped>
.options {
    margin: 16px;
}

.tabs {
}
</style>
