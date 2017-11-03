<template>
    <md-card class="help-pane">
        <md-card-area class="area">
            <md-boards class="md-clean">
                <md-board>
                    <md-toolbar class="md-dense md-transparent header">
                        <div class="md-title">Adding courses</div>
                    </md-toolbar>

                    <p>Add courses at the left side of the screen. Example: <pre>MATH 215</pre></p>
                    
                    <p>Courses can be toggled off to exclude them from the schedule.</p>
                </md-board>
                
                <md-board>
                    <md-toolbar class="md-dense md-transparent header">
                        <div class="md-title">Customizing schedule</div>
                    </md-toolbar>

                    <p>Use the calendar view to select and custmize sections.</p>
                    
                    <p>- Left click 'locks' a section</p>
                    
                    <p>- Middle click previews alternatives to a section</p>
                    
                    <p>- Right click 'hides' a section</p>
                </md-board>
                
                <md-board>
                    <md-toolbar class="md-dense md-transparent header">
                        <div class="md-title">Saving schedules</div>
                    </md-toolbar>

                    <p>Use the <md-icon>save</md-icon> tab to save a schedule.</p>
                    
                    <p>Access saved schedules on the right side of the screen.</p>
                        
                    <p>
                        While viewing a schedule, click the <md-icon>edit</md-icon> button
                        to load it into the generator.
                    </p>
                </md-board>
            </md-boards>


            <!-- <md-list class="md-dense">
                <md-list-item>
                    <span>1. Add courses at the left side of the screen. Example: <pre>MATH 215</pre></span>
                </md-list-item>
                
                <md-list-item>
                    2. Customize schedule using the calendar view
                </md-list-item>
                    
                <md-list-item>
                    <md-list class="md-dense sublist">
                        <md-list-item>
                            - Left click 'locks' a section
                        </md-list-item>
                        
                        <md-list-item>
                            - Middle click previews alternatives to a section
                        </md-list-item>
                        
                        <md-list-item>
                            - Right click 'hides' a section
                        </md-list-item>
                    </md-list>
                </md-list-item>
            </md-list> -->
        </md-card-area>
    </md-card>
</template>

<script>
export default {

};
</script>

<style scoped lang="less">
.help-pane {
    flex: 1;
    margin-top: 16px;
}

.area {
    height: 100% !important;
}

.header {
    margin: -16px -16px 0 -16px;
}

.help-pane :global(.md-boards-content) {
    flex: 1;
}

p {
    margin: 0;
    margin-bottom: 1em;
}

pre {
    margin: 0;
    font-size: inherit;
    display: inline;
}
</style>