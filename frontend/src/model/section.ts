import { Course } from './course';
import { SectionMeeting } from './sectionmeeting';

const days = ['M', 'T', 'W', 'TH', 'F', 'S', 'SU'];

export interface Section {
    readonly id: number;

    readonly num: number;

    readonly flags: string;
    readonly component: string;

    readonly course: Course;
    readonly meetings: SectionMeeting[];
}

export namespace Section {
    export function parse(course: Course, fields: string[]) {
        let value = {
            id: parseInt(fields[3]),
            component: fields[8],
            flags: fields[9],
            num: parseInt(fields[6]),

            course: course,
            meetings: [],
        };

        course.sections.push(value);

        return value;
    }

    export function hasOverlap(lhs: Section, rhs: Section) {
        for (let block of lhs.meetings) {
            for (let otherBlock of rhs.meetings) {
                for (let day of days) {
                    if (block.days.indexOf(day) < 0 ||
                        otherBlock.days.indexOf(day) < 0)
                        continue;

                    let aTime = SectionMeeting.getTime(block);
                    let bTime = SectionMeeting.getTime(otherBlock);

                    if (bTime.start >= aTime.start && bTime.start < aTime.end)
                        return true;

                    if (aTime.start >= bTime.start && aTime.start < bTime.end)
                        return true;

                    return false;
                }
            }
        }

        return false;
    }

    export function isCompatible(lhs: Section, rhs: Section): any {
        if (hasOverlap(lhs, rhs))
            return false;

        return lhs.course != rhs.course ||
            lhs.flags != rhs.flags ||
            lhs.component != rhs.component;
    }
}
