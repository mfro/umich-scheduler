<template>
    <div class="toolbox">
        <div class="header">
            <slot name="header"/>
        </div>

        <!-- <div class="contents"> -->
            <slot/>
        <!-- </div> -->
    </div>
</template>

<script>
export default {
    name: 'tool-box',
};
</script>

<style lang="less" scoped>
.toolbox {
    display: flex;
    flex-direction: column;
    margin: 8px 8px 0 8px;

    border: 1px solid lightgray;
}

.header {
    padding: 5px 6px 3px;
    border-bottom: 1px solid lightgray;

    font-weight: bold;
}
</style>

