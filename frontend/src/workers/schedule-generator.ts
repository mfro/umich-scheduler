import * as util from '@/util';

import Section from '@/common/section';

import * as store from '@/store';

export interface Course {
    id: string;
    enabled: boolean;
}

export interface Block {
    isLock: boolean;

    color: string;
    course: Course;
    section: Section;
}

const colors = [
    '#16a765',
    '#4986e7',
    '#f83a22',
    '#ffad46',
    '#d06b64',
    '#9a9cff',
    '#ff7537',
    '#7bd148',
    '#ac725e',
    '#42d692',
    '#cabdbf',
];

export function generate(courses: Course[]) {
    let enabled = courses.filter(c => c.enabled);

    let list: Block[][] = [];

    buildHelper([], enabled, 0, list);

    return Promise.resolve(list);
}

function buildHelper(base: Block[], courses: Course[], index: number, target: Block[][]) {
    if (index == courses.length) {
        target.push(base);

        return target.length < 1000;
    }

    let course = courses[index];

    let sections = getSections(course.id);
    let locked = (<Section[]>store.default.getters['generator/locked']).filter(s => {
        return util.matchSection(course.id, s);
    });

    let pLock = locked.find(s => s.flags.includes('P'));
    let aLocks = locked.filter(s => s.flags.includes('A'));
    let sLock = locked.find(c => c.flags.includes('S'));

    let primaries;
    if (pLock)
        primaries = [pLock];
    else
        primaries = findPrimaries(course.id, aLocks);

    let secondaries;
    if (sLock)
        secondaries = [sLock];
    else
        secondaries = sections.filter(s => s.flags.includes('S'));

    for (let primary of primaries) {
        if (!fits(base, primary))
            continue;

        let withPrimary = add(base, primary, course);

        let autos = findAutoEnrolls(course.id, primary);
        let isValid = true;

        for (let auto of autos) {
            if (!fits(withPrimary, auto)) {
                isValid = false;
                break;
            }

            withPrimary = add(withPrimary, auto, course);
        }

        if (!isValid) {
            continue;
        }

        if (secondaries.length == 0) {
            if (!buildHelper(withPrimary, courses, index + 1, target))
                return false;
            continue;
        }

        for (let secondary of secondaries) {
            if (!fits(withPrimary, secondary))
                continue;

            let withSecondary = add(withPrimary, secondary, course);
            if (!buildHelper(withSecondary, courses, index + 1, target))
                return false;
        }
    }

    return true;
}

function getSections(courseId: string) {
    let list = <Section[]>store.default.getters['courses/byCourse'](courseId);

    return list;
}

function findPrimaries(courseId: string, autos: Section[]) {
    let sections = getSections(courseId);

    let nexts = autos.map(a => sections.reduce((best, s) => {
        if (!s.flags.includes('A'))
            return best;
        if (a.component != s.component || a.sectionId >= s.sectionId)
            return best;
        if (!best || (s.sectionId < (<any>best).sectionId))
            return s;
        return best;
    }, null));

    return sections.filter(s => {
        if (!s.flags.includes('P'))
            return false;

        for (let auto of autos)
            if (s.sectionId < auto.sectionId)
                return false;

        for (let next of nexts)
            if (next && s.sectionId > next.sectionId)
                return false;

        return true;
    });
}

function findAutoEnrolls(courseId: string, primary: Section) {
    let sections = getSections(courseId);

    let bests = new Map<string, Section>();

    for (let section of sections) {
        if (!section.flags.includes('A'))
            continue;
        if (section.sectionId > primary.sectionId)
            continue;
        if (Math.floor(section.courseId / 10) != Math.floor(primary.courseId / 10))
            continue;

        let best = bests.get(section.component);
        if (!best || (section.sectionId > best.sectionId))
            bests.set(section.component, section);
    }

    return [...bests.values()];
}

function fits(schedule: Block[], section: Section) {
    let hidden = <Section[]>store.default.getters['generator/hidden'];

    if (hidden.indexOf(section) != -1)
        return false;

    for (let existing of schedule) {
        if (overlap(section, existing.section)) {
            return false;
        }
    }

    return true;
}

function add(schedule: Block[], section: Section, course: Course) {
    if (!fits(schedule, section))
        throw new Error('Section does not fit');

    let locked = <Section[]>store.default.getters['generator/locked'];

    let color;

    for (let check of colors) {
        if (schedule.find(c => c.color == check))
            continue;
        color = check;
        break;
    }
    if (!color) color = 'gray';

    let copy = schedule.slice();
    copy.push({
        isLock: locked.indexOf(section) != -1,

        color: color,

        course: course,
        section: section,
    });

    return copy;
}

function overlap(a: Section, b: Section) {
    let days = ['M', 'T', 'W', 'TH', 'F', 'S', 'SU'];

    for (let day of days) {
        if (a.days.indexOf(day) < 0 ||
            b.days.indexOf(day) < 0)
            continue;

        let aTime = util.parseTime(a.time);
        let bTime = util.parseTime(b.time);

        if (bTime.start >= aTime.start && bTime.start < aTime.end)
            return true;

        if (aTime.start >= bTime.start && aTime.start < bTime.end)
            return true;

        return false;
    }

    return false;
}