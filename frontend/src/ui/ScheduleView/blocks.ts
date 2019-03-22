import { Section, SectionMeeting } from '@/model';
import { ResultBlock } from '@/worker/generate';

export function preview(src: Section, color: string, isHidden: boolean, occurrences: number): PreviewCourseBlock[] {
    return src.meetings.map<PreviewCourseBlock>((m, i) => {
        let time = SectionMeeting.getTime(m);

        return {
            isCourse: true,
            isPreview: true,

            id: `${src.id}:${i}`,

            days: m.days,
            start: time.start,
            end: time.end,

            color: color,
            section: src,
            meeting: m,

            isHidden: isHidden,
            occurrences: occurrences,
        };
    });
}

export function generated(src: ResultBlock): GeneratedCourseBlock[] {
    return src.section.meetings.map<GeneratedCourseBlock>((m, i) => {
        let time = SectionMeeting.getTime(m);

        return {
            isCourse: true,
            isGenerated: true,

            id: `${src.section.id}:${i}`,

            days: m.days,
            start: time.start,
            end: time.end,

            color: src.color,
            section: src.section,
            meeting: m,

            isLocked: src.locked,
        };
    })
}

export interface Block {
    readonly id: string | number;

    readonly days: string[];
    readonly end: number;
    readonly start: number;

    readonly color: string;
}

export interface CourseBlock extends Block {
    readonly isCourse: true;
    readonly section: Section;
    readonly meeting: SectionMeeting;
}

export interface PreviewCourseBlock extends CourseBlock {
    readonly isPreview: true;
    readonly isHidden: boolean;
    readonly occurrences: number;
}

export interface GeneratedCourseBlock extends CourseBlock {
    readonly isGenerated: true;
    readonly isLocked: boolean;
}
