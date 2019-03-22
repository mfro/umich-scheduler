import { Section } from './section';

export interface Course {
    readonly subjectId: string;
    readonly courseId: number;

    readonly title: string;

    readonly sections: Section[];
}

export namespace Course {
    export function parse(fields: string[]): Course {
        return {
            courseId: parseInt(fields[5]),
            subjectId: /\(([A-Z]+)\)/.exec(fields[4])![1],

            title: fields[7],

            sections: [],
        };
    }
}
