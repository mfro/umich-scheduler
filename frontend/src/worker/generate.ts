import { generate } from '.';

import { Course, Section } from '@/model';

let work = self as unknown as Worker;

work.addEventListener('message', e => {
    let args = e.data as generate.args;

    let context = {
        action: null,
        request: {
            courses: args.courses,
            hidden: args.hidden,
            locked: args.locked,
        },
        response: {
            schedules: [],
            occurences: {},
        },
    };

    buildHelper([], context, 0);

    work.postMessage(context.response);
});

const MAXIMUM_SIZE = 5000;

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

export type Action = (index: number, schedule: ResultBlock[], status: GeneratorResponse) => void;

interface Context {
    action: Action | null;
    request: GeneratorRequest;
    response: GeneratorResponse;
}

export interface GeneratorRequest {
    courses: Course[];
    hidden: number[];
    locked: number[];
}

export interface GeneratorResponse {
    schedules: ResultBlock[][];
    occurences: { [id: number]: number };
}

export interface ResultBlock {
    color: string;
    locked: boolean;
    section: Section;
}

function buildHelper(base: ResultBlock[], context: Context, index: number) {
    let color = 'gray';

    for (let check of colors) {
        if (base.find(c => c.color == check))
            continue;

        color = check;
        break;
    }

    if (index == context.request.courses.length) {
        for (let block of base) {
            if (!context.response.occurences[block.section.id])
                context.response.occurences[block.section.id] = 1;
            else
                context.response.occurences[block.section.id]++;
        }

        let resultIndex = context.response.schedules.length;

        context.response.schedules.push(base);
        context.action && context.action(resultIndex, base, context.response);

        return context.response.schedules.length < MAXIMUM_SIZE;
    }

    let course = context.request.courses[index];
    let locked = course.sections.filter(s => context.request.locked.indexOf(s.id) != -1);

    let pLock = locked.find(s => s.flags.includes('P'));
    let aLocks = locked.filter(s => s.flags.includes('A'));
    let sLock = locked.find(c => c.flags.includes('S'));

    let primaries;
    if (pLock)
        primaries = [pLock];
    else
        primaries = findPrimaries(course.sections, aLocks);

    let secondaries;
    if (sLock)
        secondaries = [sLock];
    else
        secondaries = course.sections.filter(s => s.flags.includes('S'));

    for (let primary of primaries) {
        if (!fits(base, primary, context))
            continue;

        let withPrimary = add(base, color, primary, context);

        let autos = findAutoEnrolls(course.sections, primary);
        let isValid = true;

        for (let auto of autos) {
            if (!fits(withPrimary, auto, context)) {
                isValid = false;
                break;
            }

            withPrimary = add(withPrimary, color, auto, context);
        }

        if (!isValid) {
            continue;
        }

        if (secondaries.length == 0) {
            if (!buildHelper(withPrimary, context, index + 1))
                return false;
            continue;
        }

        for (let secondary of secondaries) {
            if (!fits(withPrimary, secondary, context))
                continue;

            let withSecondary = add(withPrimary, color, secondary, context);
            if (!buildHelper(withSecondary, context, index + 1))
                return false;
        }
    }

    return true;
}

function findPrimaries(sections: Section[], autos: Section[]) {
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

        for (let next of nexts)
            if (next && s.num > next.num)
                return false;

        return true;
    });
}

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

function fits(schedule: ResultBlock[], section: Section, context: Context) {
    if (context.request.hidden.indexOf(section.id) != -1)
        return false;

    for (let existing of schedule) {
        if (!Section.isCompatible(section, existing.section)) {
            return false;
        }
    }

    return true;
}

function add(schedule: ResultBlock[], color: string, section: Section, context: Context) {
    if (!fits(schedule, section, context))
        throw new Error('Section does not fit');

    let copy = schedule.slice();

    copy.push({
        color: color,
        locked: context.request.locked.indexOf(section.id) != -1,
        section: section,
    });

    return copy;
}
