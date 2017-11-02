import Section from '@/common/section';

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

export interface GenerateRequest {
    courses: Section[][];
    hidden: number[];
    locked: number[];
}

export interface GBlock {
    color: string;
    locked: boolean;
    section: Section;
}

export function generate(request: GenerateRequest) {
    let list: GBlock[][] = [];

    buildHelper([], request, 0, list);

    let sim = list.map(l => l.map(b => ({
        id: b.section.id,
        color: b.color,
        locked: b.locked,
    })));

    return Promise.resolve(sim);
}

function buildHelper(base: GBlock[], request: GenerateRequest, index: number, target: GBlock[][]) {
    if (index == request.courses.length) {
        target.push(base);

        return target.length < 1000;
    }

    let sections = request.courses[index];
    let locked = sections.filter(s => request.locked.indexOf(s.id) != -1);

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
        if (!fits(base, primary, request))
            continue;

        let withPrimary = add(base, primary, request);

        let autos = findAutoEnrolls(sections, primary);
        let isValid = true;

        for (let auto of autos) {
            if (!fits(withPrimary, auto, request)) {
                isValid = false;
                break;
            }

            withPrimary = add(withPrimary, auto, request);
        }

        if (!isValid) {
            continue;
        }

        if (secondaries.length == 0) {
            if (!buildHelper(withPrimary, request, index + 1, target))
                return false;
            continue;
        }

        for (let secondary of secondaries) {
            if (!fits(withPrimary, secondary, request))
                continue;

            let withSecondary = add(withPrimary, secondary, request);
            if (!buildHelper(withSecondary, request, index + 1, target))
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

function fits(schedule: GBlock[], section: Section, request: GenerateRequest) {
    if (request.hidden.indexOf(section.id) != -1)
        return false;

    for (let existing of schedule) {
        if (!section.isCompatible(existing.section)) {
            return false;
        }
    }

    return true;
}

function add(schedule: GBlock[], section: Section, request: GenerateRequest) {
    if (!fits(schedule, section, request))
        throw new Error('Section does not fit');

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
        color: color,
        locked: request.locked.indexOf(section.id) != -1,
        section: section,
    });

    return copy;
}
