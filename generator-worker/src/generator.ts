import Section from '@mfro/umich-scheduler-common/section';

const maximum_size = 5000;

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

export type Action = (index: number, schedule: Block[], status: GeneratorResponse) => void;

interface Context {
    action: Action | null;
    request: GeneratorRequest;
    response: GeneratorResponse;
}

export interface GeneratorRequest {
    courses: Section[][];
    hidden: number[];
    locked: number[];
}

export interface GeneratorResponse {
    schedules: Block[][];
    occurences: { [id: number]: number };
}

export interface Block {
    color: string;
    locked: boolean;
    section: Section;
}

export function generate(request: GeneratorRequest, action?: Action): GeneratorResponse {
    let context = {
        action: action || null,
        request,
        response: {
            schedules: [],
            occurences: {},
        },
    }

    buildHelper([], context, 0);

    return context.response;
}

function buildHelper(base: Block[], context: Context, index: number) {
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

        return context.response.schedules.length < maximum_size;
    }

    let sections = context.request.courses[index];
    let locked = sections.filter(s => context.request.locked.indexOf(s.id) != -1);

    let pLock = locked.find(s => s.flags.includes('P'));
    let aLocks = locked.filter(s => s.flags.includes('A'));
    let sLock = locked.find(c => c.flags.includes('S'));

    let primaries;
    if (pLock)
        primaries = [pLock];
    else
        primaries = findPrimaries(sections, aLocks);

    let secondaries;
    if (sLock)
        secondaries = [sLock];
    else
        secondaries = sections.filter(s => s.flags.includes('S'));

    for (let primary of primaries) {
        if (!fits(base, primary, context))
            continue;

        let withPrimary = add(base, color, primary, context);

        let autos = findAutoEnrolls(sections, primary);
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
        if (a.component != s.component || a.sectionId >= s.sectionId)
            return best;
        if (!best || (s.sectionId < best.sectionId))
            return s;
        return best;
    }, <Section><any>null));

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

function findAutoEnrolls(sections: Section[], primary: Section) {
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

function fits(schedule: Block[], section: Section, context: Context) {
    if (context.request.hidden.indexOf(section.id) != -1)
        return false;

    for (let existing of schedule) {
        if (!section.isCompatible(existing.section)) {
            return false;
        }
    }

    return true;
}

function add(schedule: Block[], color: string, section: Section, context: Context) {
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
