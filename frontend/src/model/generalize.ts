import { Course, Section, SectionMeeting } from '.';
import { TimeBlock } from '@/generate/general';

function getBlocks(sections: Section[]): TimeBlock[] {
    let blocks = [];

    for (let section of sections) {
        for (let meeting of section.meetings) {
            let time = SectionMeeting.getTime(meeting);
            for (let day of meeting.days) {
                blocks.push({ day, ...time });
            }
        }
    }

    return blocks;
}

export interface Translation {
    segments: TimeBlock[][][];
    sections: Section[][][];
}

function generalize(t: Translation, course: Course, lockedIds: number[], hiddenIds: number[]) {
    let sections = course.sections.filter(s => !hiddenIds.includes(s.id));
    let locked = sections.filter(s => lockedIds.includes(s.id));

    let lockedPrimary = locked.find(s => s.flags.includes('P'));
    let lockedAutos = locked.filter(s => s.flags.includes('A'));
    let lockedSecondary = locked.find(c => c.flags.includes('S'));

    let primaries;
    if (lockedPrimary)
        primaries = [lockedPrimary];
    else
        primaries = findPrimaries(sections, lockedAutos);

    let secondaries;
    if (lockedSecondary)
        secondaries = [lockedSecondary];
    else
        secondaries = sections.filter(s => s.flags.includes('S'));

    t.sections.push(primaries.map(p => {
        let autos = findAutoEnrolls(sections, p);
        return [p, ...autos];
    }));

    if (secondaries.length > 0) {
        t.sections.push(secondaries.map(s => [s]));
    }
}

export function translate(courses: Course[], lockedIds: number[], hiddenIds: number[]) {
    let t: Translation = {
        segments: [],
        sections: [],
    };

    for (let course of courses)
        generalize(t, course, lockedIds, hiddenIds);

    t.segments = t.sections.map(options => {
        return options.map(option => getBlocks(option));
    });

    return t;
}

/*
 * a valid 'course' must contain 1 primary, 1 secondary.
 * The auto-enrolls are chosen as follows:
 *  - 1 of each 'component'
 *  - the highest section number that is less than the primary-enroll
 * therefore each auto-enroll is attached to the 'next' primary-enroll
 */

/**
 * Returns a list of valid primary-enroll sections for a course
 * @param autos locked auto-enroll sections
 */
function findPrimaries(sections: Section[], autos: Section[]) {
    // finds the 'next' auto-enroll for each locked auto-enroll
    let nexts = autos.map(a => sections.reduce((best, s) => {
        if (!s.flags.includes('A'))
            return best;
        if (a.component != s.component || a.num >= s.num)
            return best;
        if (!best || (s.num < best.num))
            return s;
        return best;
    }, <Section><any>null));

    return sections.filter(s => {
        if (!s.flags.includes('P'))
            return false;

        for (let auto of autos)
            if (s.num < auto.num)
                return false;

        // if this is greater than a 'next', then it would
        // be invalid combined with one of the locked autos
        for (let next of nexts)
            if (next && s.num > next.num)
                return false;

        return true;
    });
}

/**
 * 
 * Returns a list of valid auto-enroll sections for a course
 * @param primary locked primary-enroll sections
 */
function findAutoEnrolls(sections: Section[], primary: Section) {
    let bests = new Map<string, Section>();

    for (let section of sections) {
        if (!section.flags.includes('A'))
            continue;
        if (section.num > primary.num)
            continue;
        if (Math.floor(section.course.courseId / 10) != Math.floor(primary.course.courseId / 10))
            continue;

        let best = bests.get(section.component);
        if (!best || (section.num > best.num))
            bests.set(section.component, section);
    }

    return [...bests.values()];
}

