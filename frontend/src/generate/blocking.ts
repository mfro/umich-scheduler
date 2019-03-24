import { Course, Section } from '@/model';

const MAX_COUNT = 1000000;

const courses = new Map<string, Course>();
const work = self as unknown as Worker;

work.addEventListener('message', async e => {
    switch (e.data.type) {
        case 'courses': {
            let args = e.data.body as Course[];
            for (let course of args) {
                courses.set(Course.id(course), course);
            }
            break;
        }
        case 'run': {
            let args = e.data.body as {
                courses: string[],
                hidden: number[],
                locked: number[],
            }

            let input = {
                courses: args.courses.map(id => courses.get(id)).filter(c => c) as Course[],
                hidden: args.hidden,
                locked: args.locked,
            };

            let start = performance.now();

            let instance = new Generator(input);
            instance.run(MAX_COUNT);

            let end = performance.now();
            console.log(`generated ${instance.schedules.length} in ${end - start} (${start} -> ${end})`);

            work.postMessage({
                type: 'run',
                body: {
                    occurrences: instance.occurrences,
                    schedules: instance.schedules.map(s => s.map(e => e.id)),
                },
            });
            break;
        }
    }
});

interface Input {
    courses: Course[];
    hidden: number[];
    locked: number[];
}

export class Generator {
    locked: Set<number>;
    hidden: Set<number>;

    segments: Section[][][] = [];

    schedules: Section[][] = [];
    occurrences: { [id: number]: number } = {};

    constructor(
        readonly input: Input,
    ) {
        this.locked = new Set(input.locked);
        this.hidden = new Set(input.hidden);

        for (let course of input.courses) {
            let locked = course.sections.filter(s => this.locked.has(s.id));

            let lockedPrimary = locked.find(s => s.flags.includes('P'));
            let lockedAutos = locked.filter(s => s.flags.includes('A'));
            let lockedSecondary = locked.find(c => c.flags.includes('S'));

            let primaries;
            if (lockedPrimary)
                primaries = [lockedPrimary];
            else
                primaries = findPrimaries(course, lockedAutos);

            let secondaries;
            if (lockedSecondary)
                secondaries = [lockedSecondary];
            else
                secondaries = course.sections.filter(s => s.flags.includes('S'));

            console.log(`${Course.name(course)}: ${primaries.length} primary`)
            this.segments.push(primaries.map(p => {
                let autos = findAutoEnrolls(course, p);
                return [p, ...autos];
            }));

            if (secondaries.length > 0) {
                console.log(`${Course.name(course)}: ${secondaries.length} secondary`)
                this.segments.push(secondaries.map(s => [s]));
            }
        }
    }

    run(limit: number) {
        this.buildHelper([], 0, limit);
    }

    buildHelper(schedule: Section[], index: number, limit: number): boolean {
        if (index == this.segments.length) {
            this.schedules.push(schedule);
            for (let section of schedule)
                this.occurrences[section.id] = (this.occurrences[section.id] || 0) + 1;
            return this.schedules.length < limit;
        }

        let segment = this.segments[index];

        optionLoop:
        for (let group of segment) {
            let build = schedule.slice();

            for (let section of group) {
                if (!this.isValid(build, section))
                    continue optionLoop;

                build.push(section);
            }

            if (!this.buildHelper(build, index + 1, limit))
                return false;
        }

        return true;
    }

    /**
     * Checks if it is valid to add a section to a schedule
     * @param schedule Existing schedule to compare
     * @param section Potential addition
     */
    isValid(schedule: Section[], section: Section) {
        if (this.hidden.has(section.id))
            return false;

        for (let existing of schedule) {
            if (!Section.isCompatible(section, existing)) {
                return false;
            }
        }

        return true;
    }
}

/*
 * a valid 'course' must contain 1 primary, 1 secondary.
 * The auto-enrolls are chosen as follows:
 *  - 1 of each 'component'
 *  - the highest section number that is less than the primary-enroll
 */

/**
 * Returns a list of valid primary-enroll sections for a course
 * @param autos locked auto-enroll sections
 */
function findPrimaries(course: Course, autos: Section[]) {
    // finds the 'next' auto-enroll for each locked auto-enroll
    let nexts = autos.map(a => course.sections.reduce((best, s) => {
        if (!s.flags.includes('A'))
            return best;
        if (a.component != s.component || a.num >= s.num)
            return best;
        if (!best || (s.num < best.num))
            return s;
        return best;
    }, <Section><any>null));

    return course.sections.filter(s => {
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
function findAutoEnrolls(course: Course, primary: Section) {
    let bests = new Map<string, Section>();

    for (let section of course.sections) {
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
