import * as Vuex from 'vuex';

import Section from '@mfro/umich-scheduler-common/section';

abstract class Base {
    public type: string;

    public days: string[];
    public start: number;
    public end: number;
    public id: string | number;

    constructor(
        public color = 'black',
    ) { }

    serialize(): any {
        return {
            type: this.type,
            color: this.color,
        };
    }
}

namespace Base {
    export function deserialize(store: Vuex.Store<any>, raw: any) {
        switch (raw.type) {
            case 'course':
                return Course.deserialize(store, raw);
            case 'generated-course':
                return GeneratedCourse.deserialize(store, raw);
            case 'preview-course':
                return PreviewCourse.deserialize(store, raw);
            default:
                throw new Error('Unknown type: ' + raw.type);
        }
    }

    export class Course extends Base {
        readonly isCourse = true;

        readonly section: Section;
        readonly block: Section.Block;

        constructor(color: string, section: Section, block: Section.Block) {
            super(color);

            if (color && section && block) {
                this.type = 'course';
                this.section = section;
                this.block = block;

                let time = block.getTime();
                this.days = block.days;
                this.start = time.start;
                this.end = time.end;
                this.id = section.id;
            }
        }

        serialize() {
            return {
                ...super.serialize(),
                id: this.section.id,
                block: this.section.blocks.indexOf(this.block),
            };
        }

        static deserialize(store: Vuex.Store<any>, raw: any): any {
            let section: Section = store.getters['courses/byId'](raw.id);
            let color = raw.color;

            if (typeof raw.block != 'number')
                raw.block = 0;

            let block = section.blocks[raw.block];

            return new Course(color, section, block);
        }
    }

    export class GeneratedCourse extends Course {
        readonly isGenerated = true;

        readonly isLocked: boolean;

        constructor(color: string, section: Section, block: Section.Block, isLocked: boolean) {
            super(color, section, block);

            if (color && section && isLocked !== undefined) {
                this.type = 'generated-course';
                this.isLocked = isLocked;
            }
        }

        serialize() {
            throw new Error('Why are you serializing this');
        }

        static deserialize(store: Vuex.Store<any>, raw: any) {
            throw new Error('Why are you serializing this');
        }
    }

    export class PreviewCourse extends Course {
        readonly isPreview = true;

        readonly isHidden: boolean;
        readonly occurences: number;

        constructor(color: string, section: Section, block: Section.Block, isHidden: boolean, occurences: number) {
            super(color, section, block);

            if (color && section && isHidden !== undefined && occurences !== undefined) {
                this.type = 'preview-course';
                this.isHidden = isHidden;
                this.occurences = occurences;
            }
        }

        serialize() {
            throw new Error('Why are you serializing this');
        }

        static deserialize(store: Vuex.Store<any>, raw: any) {
            throw new Error('Why are you serializing this');
        }
    }
}

export default Base;
