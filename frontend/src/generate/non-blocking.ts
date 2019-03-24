import { Course, Section } from '@/model';

if ('WorkerGlobalScope' in self) {
    const courses = new Map<string, Course>();
    const context = self as unknown as Worker;

    let instance: Generator | null = null;

    function tick(gen: Generator) {
        if (gen != instance) return;

        let limit = performance.now() + 50;
        let paused = gen.next(() => {
            return limit < performance.now();
        });

        context.postMessage({
            type: 'progress',
            body: {
                complete: !paused,
                occurrences: gen.occurrences,
                scheduleCount: gen.schedules.length,
            },
        });

        if (paused) {
            setTimeout(tick.bind(null, gen), 1);
        }
    }

    context.addEventListener('message', async e => {
        switch (e.data.type) {
            case 'courses': {
                let args = e.data.body as Course[];
                for (let course of args) {
                    courses.set(Course.id(course), course);
                }
                break;
            }
            case 'get': {
                let index = e.data.body as number;

                let result;
                if (!instance || index < 0 || index >= instance.schedules.length)
                    result = null;
                else
                    result = instance.schedules[index].map(s => s.id);

                context.postMessage({
                    type: 'get',
                    body: result,
                });
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

                instance = new Generator(input);
                tick(instance);
                break;
            }
        }
    });
}

export interface Input {
    courses: Course[];
    hidden: number[];
    locked: number[];
}

function dualId(a: Section, b: Section) {
    if ((a.id & 0xFFFF) != a.id)
        console.warn(`large section id: ${a.id}`);
    if ((b.id & 0xFFFF) != b.id)
        console.warn(`large section id: ${b.id}`);
    if (a.id < b.id)
        return (a.id << 16) | b.id;
    return (b.id << 16) | a.id;
}


export class Generator {
    locked: Set<number>;
    hidden: Set<number>;

    segments: { index: number, options: Section[][] }[] = [];

    schedules: Section[][] = [];
    occurrences: { [id: number]: number } = {};

    compatibility = new Set<number>();

    constructor(
        readonly input: Input,
    ) {
        for (let c1 of input.courses) {
            for (let s1 of c1.sections) {
                for (let c2 of input.courses) {
                    for (let s2 of c2.sections) {
                        if (Section.isCompatible(s1, s2)) {
                            this.compatibility.add(dualId(s1, s2));
                        }
                    }
                }
            }
        }

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

            this.segments.push({
                index: 0,
                options: primaries.map(p => {
                    let autos = findAutoEnrolls(course, p);
                    return [p, ...autos];
                }),
            });

            if (secondaries.length > 0) {
                this.segments.push({
                    index: 0,
                    options: secondaries.map(s => [s]),
                });
            }
        }
    }

    next(stop: () => boolean) {
        if (this.segments.length == 0) return true;

        return !this.buildHelper([], 0, stop);
    }

    buildHelper(schedule: Section[], index: number, stop: () => boolean): boolean {
        if (index == this.segments.length) {
            this.schedules.push(schedule);
            for (let section of schedule)
                this.occurrences[section.id] = (this.occurrences[section.id] || 0) + 1;
            return !stop();
        }

        let segment = this.segments[index];

        primaryLoop:
        for (; segment.index < segment.options.length; ++segment.index) {
            let build = schedule.slice();

            for (let section of segment.options[segment.index]) {
                if (!this.isValid(build, section)) {
                    continue primaryLoop;
                }

                build.push(section);
            }

            if (!this.buildHelper(build, index + 1, stop))
                return false;
        }

        segment.index = 0;
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
            if (!this.compatibility.has(dualId(section, existing))) {
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
