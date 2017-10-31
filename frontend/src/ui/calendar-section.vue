<template>
    <div class="section" :class="{ lock: block.isLock, hidden: block.isHidden }" :style="style" @mouseup="onClick" @contextmenu.prevent="onContextMenu">
        <div class="sideline" :style="sidelineStyle"/>

        <div class="content">
            <div class="background" :style="backgroundStyle"/>

            <div class="text">
                <div class="id">
                    <span>{{ id }}</span>
                </div>

                <div class="title">
                    <span>{{ block.section.title }}</span>
                </div>

                <div class="row">
                    <div class="spacer"/>

                    <div class="location">
                        <span>{{ block.section.location }}</span>
                    </div>

                    <div class="occurences">
                        <span v-if="block.occurences">{{ block.occurences }}</span>
                    </div>
                </div>

                <!-- <div class="instructor">
                    <span>{{ instructor }}</span>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script>
import * as util from '@/util';
import * as config from './config';

export default {
    props: {
        block: Object
    },

    computed: {
        subject() {
            let match = /\((\D+)\)/.exec(this.block.section.subject);
            return match[1];
        },

        id() {
            let sec = this.block.section.sectionId.toString();
            while (sec.length < 3) sec = '0' + sec;

            let course = this.block.section.courseId.toString();
            while (course.length < 3) course = '0' + course;

            return `${this.subject} ${course} - ${this.block.section.component} ${sec}`;
        },

        style() {
            let time = util.parseTime(this.block.section.time);

            let top = (time.start - config.dayStart) / config.dayLength;
            let bot = (time.end - config.dayStart) / config.dayLength;
            let height = bot - top;

            return {
                width: `calc(100% - ${10 * (this.block.groupSize - 1)}px)`,
                height: 100 * height + 'vh',
                marginTop: 100 * top + 'vh',
                marginLeft: `${8 * this.block.groupIndex}px`,
            };
        },

        color() {
            if (this.block.occurences === 0)
                return 'gray';

            return this.block.color;
        },

        backgroundStyle() {
            return {
                backgroundColor: this.color,
            };
        },

        sidelineStyle() {
            return {
                backgroundColor: this.color,
            };
        }
    },

    mounted() {
        this.$el.onmousedown = e => {
            if (e.button == 1) {
                e.preventDefault();
                return false;
            }
        }
    },

    methods: {
        onContextMenu(e) {
            this.$store.dispatch('schedule/hideSection', this.block.section).then(() => {
                this.$store.dispatch('schedule/generate');
            });
        },

        onClick(e) {
            if (e.button == 0) {
                this.$store.dispatch('schedule/lockSection', this.block.section).then(() => {
                    this.$store.dispatch('schedule/generate');
                });;
                if (!this.block.isLock) {
                    this.$store.commit('preview/setTarget', null);
                }
            } else if (e.button == 1) {
                this.$store.commit('preview/setTarget', this.block);
            }
        },

        onMouseEnter(e) {
            this.$store.commit('preview/setTarget', this.block);
        },

        onMouseLeave(e) {
            this.$store.commit('preview/setTarget', this.block);
        },
    },
};
</script>

<style lang="less" scoped>
.section {
    display: flex;
    cursor: pointer;

    position: absolute;
    box-sizing: border-box;
    background-color: white;

    border: 1px solid lightgray;

    &.lock .sideline {
        width: 0;
    }

    &.hidden {
        .sideline, .content {
            opacity: 0.33;
        }
    }

    &:hover {
        z-index: 1;
    }
}

.sideline {
    width: 6px;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
}

.content {
    flex: 1;
    position: relative;
}

.background {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.3;
}

.text {
    position: absolute;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    
    padding: 6px;
    box-sizing: border-box;
    
    line-height: 1.3em;

    .id {
        font-weight: bold;
    }

    .row {
        width: 100%;
        display: flex;

        >* {
            flex: 0 0 auto;
        }

        >:first-child, >:last-child {
            flex: 1;
        } 
    }

    .occurences {
        text-align: end;
    }
}
</style>

