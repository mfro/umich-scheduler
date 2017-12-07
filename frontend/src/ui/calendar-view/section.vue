<template>
    <v-layout class="section" :class="classes" :style="style"
        @mouseenter="hover = true" @mouseleave="hover = false"
        @mouseup="onClick" @contextmenu.prevent="onContextMenu">
        <div class="sideline" :style="sidelineStyle"/>

        <v-flex class="content">
            <div class="background" :style="backgroundStyle"/>

            <v-layout column class="text">
                <span class="id">{{ id }}</span>

                <div>
                    <span>{{ block.section.title }}</span>
                </div>

                <div class="row">
                    <div class="number">
                        <span>{{ block.section.id }}</span>
                    </div>

                    <div class="location">
                        <span>{{ block.section.location }}</span>
                    </div>

                    <div class="occurences">
                        <span v-if="interactive && block.isPreview">{{ block.occurences }}</span>
                    </div>
                </div>
            </v-layout>
        </v-flex>
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import * as keyboard from '@/lib/keyboard';

export default {
    name: 'calendar-section',

    props: {
        block: Object,
        group: Object,
        interactive: Boolean,
    },

    data() {
        return {
            ready: false,
            hover: false,
        };
    },

    computed: {
        ...mapGetters('settings', {
            dayStart: 'dayStart',
            dayEnd: 'dayEnd',
        }),

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

        classes() {
            return {
                lock: this.block.isGenerated && this.block.isLocked,
                hidden: this.block.isPreview && this.block.isHidden,
                interactive: this.interactive,
            };
        },

        color() {
            if (this.interactive && this.block.isPreview && this.block.occurences == 0) {
                return 'gray';
            }

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
        },

        style() {
            if (!this.ready) return {};

            let size = this.$parent.$el.getBoundingClientRect();

            let height = (this.block.end - this.block.start) / (this.dayEnd - this.dayStart);
            let top = (this.block.start - this.dayStart) / (this.dayEnd - this.dayStart);

            return {
                width: `calc(100% - ${8 * (this.group.size - 1)}px)`,
                height: `${size.height * height}px`,
                top: `${size.height * top}px`,
                marginLeft: `${8 * this.group.index}px`,
            };
        },
    },

    created() {
        this.$use(keyboard.onPress(keyboard.Q, () => this.hover && this.lock()));
        this.$use(keyboard.onPress(keyboard.W, () => this.hover && this.preview()));
        this.$use(keyboard.onPress(keyboard.E, () => this.hover && this.hide()));
    },

    mounted() {
        this.ready = true;

        this.$el.onmousedown = (e) => {
            if (e.button == 1) {
                e.preventDefault();
                return false;
            }
        };
    },

    methods: {
        lock() {
            this.$emit('lock', this.block);
        },

        preview() {
            this.$emit('preview', this.block);
        },

        hide() {
            this.$emit('hide', this.block);
        },

        onContextMenu(e) {
            if (!this.interactive) return;

            this.hide();
        },

        onClick(e) {
            if (e.button == 0) {
                if (!this.interactive) return;

                this.lock();
            } else if (e.button == 1) {
                this.preview();
            }
        },
    },
};
</script>

<style module lang="less">
.section {
    cursor: default;

    position: absolute;
    background-color: white;

    border: 1px solid lightgray;

    &.interactive {
        cursor: pointer;
    }

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
