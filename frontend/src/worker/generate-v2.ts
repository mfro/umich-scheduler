import { Course, Section, SectionMeeting } from '@/model';

const courses = new Map<string, Course>();

function parseCSV(csv: string) {
    let sections = new Map<number, Section>();

    for (let line of csv.split('\n')) {
        let regex = /"([^"]*)",/g;
        let match;

        let fields = [];
        while (match = regex.exec(line)) {
            fields.push(match[1].trim());
        }

        if (fields.length != 23) continue;

        let subjectId = /\(([A-Z]+)\)/.exec(fields[4])![1];
        let courseId = parseInt(fields[5]);
        let sectionId = parseInt(fields[3]);

        let course = courses.get(subjectId + courseId);
        if (!course) courses.set(subjectId + courseId, course = Course.parse(fields));

        let section = sections.get(sectionId);
        if (!section) sections.set(sectionId, section = Section.parse(course, fields));

        section.meetings.push(SectionMeeting.parse(fields));
    }
}

// let work = self as unknown as Worker;

// work.addEventListener('message', async e => {
//     parseCSV(e.data);

//     let start = performance.now();
//     console.log('start 2', start);

//     let generator = new Generator({
//         courses: [...courses.keys()],
//         hidden: [],
//         locked: [],
//     });

//     let count = 0;
//     while (true) {
//         let next = generator.next();
//         if (next == null) break;
//         ++count;

//         if (count % 1000 == 0) {
//             let mark = performance.now();
//             console.log('mark 2', count, mark, mark - start);
//         }
//     }

//     let end = performance.now();
//     console.log('end 2', count, end, end - start);
// });

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

export interface Input {
    courses: Course[];
    hidden: number[];
    locked: number[];
}

interface ResultBlock {
    color: string;
    locked: boolean;
    section: Section;
}

export class Generator {
    segments: {
        index: number,
        color: number,
        options: Section[][],
    }[] = [];

    occurences: { [id: number]: number } = {};

    constructor(
        readonly input: Input,
    ) {
        let color = 0;

        for (let course of input.courses) {
            // let course = courses.get(id)!;
            let locked = course.sections.filter(s => input.locked.includes(s.id));

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

            console.log(`${course.subjectId} ${course.courseId}: ${primaries.length} primary`)
            this.segments.push({
                index: 0,
                color,
                options: primaries.map(p => {
                    let autos = findAutoEnrolls(course, p);
                    return [p, ...autos];
                }),
            });

            if (secondaries.length > 0) {
                console.log(`${course.subjectId} ${course.courseId}: ${secondaries.length} secondary`)
                this.segments.push({
                    index: 0,
                    color,
                    options: secondaries.map(s => [s]),
                });
            }

            ++color;
        }
    }

    next() {
        let final = this.buildHelper([], 0);
        if (final == null) return null;

        for (let block of final) {
            if (!this.occurences[block.section.id])
                this.occurences[block.section.id] = 1;
            else
                this.occurences[block.section.id]++;
        }

        return final;
    }

    buildHelper(schedule: ResultBlock[], index: number): ResultBlock[] | null {
        let segment = this.segments[index];

        primaryLoop:
        while (true) {
            if (segment.index == segment.options.length) {
                segment.index = 0;
                return null;
            }

            let build = schedule;

            for (let section of segment.options[segment.index]) {
                if (!this.isValid(build, section)) {
                    ++segment.index;
                    continue primaryLoop;
                }

                build = this.add(build, colors[segment.color], section);
            }

            if (index + 1 == this.segments.length) {
                ++segment.index;
                return build;
            } else {
                let final = this.buildHelper(build, index + 1);
                if (final == null) {
                    ++segment.index;
                    continue primaryLoop;
                }

                return final;
            }
        }
    }

    /**
     * Checks if it is valid to add a section to a schedule
     * @param schedule Existing schedule to compare
     * @param section Potential addition
     */
    isValid(schedule: ResultBlock[], section: Section) {
        if (this.input.hidden.indexOf(section.id) != -1)
            return false;

        for (let existing of schedule) {
            if (!Section.isCompatible(section, existing.section)) {
                return false;
            }
        }

        return true;
    }

    add(schedule: ResultBlock[], color: string, section: Section) {
        if (!this.isValid(schedule, section))
            throw new Error('Section does not fit');

        let copy = schedule.slice();

        copy.push({
            color: color,
            locked: this.input.locked.indexOf(section.id) != -1,
            section: section,
        });

        return copy;
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
