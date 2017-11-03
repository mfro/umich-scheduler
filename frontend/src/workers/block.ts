import * as Vuex from 'vuex';

import Section from '@/common/section';

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

        constructor(color: string, section: Section) {
            super(color);

            if (color && section) {
                this.type = 'course';
                this.section = section;
                
                let time = section.getTime();
                this.days = section.days;
                this.start = time.start;
                this.end = time.end;
                this.id = section.id;
            }
        }

        serialize() {
            return {
                ...super.serialize(),
                id: this.section.id,
            };
        }

        static deserialize(store: Vuex.Store<any>, raw: any): any {
            let section = store.getters['courses/byId'](raw.id);
            let color = raw.color;

            return new Course(color, section);
        }
    }

    export class GeneratedCourse extends Course {
        readonly isGenerated = true;

        readonly isLocked: boolean;

        constructor(color: string, section: Section, isLocked: boolean) {
            super(color, section);

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

        constructor(color: string, section: Section, isHidden: boolean, occurences: number) {
            super(color, section);

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
