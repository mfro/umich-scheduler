import Course from './course';

const sections = new Map<number, Section>();
const days = ['M', 'T', 'W', 'TH', 'F', 'S', 'SU'];

function arrayEqual<T>(a: T[], b: T[]) {
    if (a.length != b.length)
        return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i])
            return false;
    }

    return true;
}

class Section {
    readonly term: string;
    readonly session: string;
    readonly academicGroup: string;
    readonly id: number;
    readonly subject: string;

    readonly courseId: number;
    readonly sectionId: number;

    readonly title: string;
    readonly component: string;
    readonly flags: string;

    readonly blocks: Section.Block[];
    readonly instructor: string;
    readonly credits: string;

    readonly totalSeats: number;
    readonly remainingSeats: number;
    readonly hasWaitlist: boolean;

    // readonly isDuplicate: boolean;

    private constructor(parts: any | string[]) {
        if (parts instanceof Array) {
            this.term = parts[0];
            this.session = parts[1];
            this.academicGroup = parts[2];
            this.id = parseInt(parts[3]);
            this.subject = parts[4];

            this.courseId = parseInt(parts[5]);
            this.sectionId = parseInt(parts[6]);

            this.title = parts[7];
            this.component = parts[8];
            this.flags = parts[9];

            this.blocks = [new Section.Block(
                parts.slice(10, 17).filter(d => d != ''),
                parts[17],
                parts[18],
                parts[19],
                parts[20],
            )];

            this.instructor = parts[21];

            if (parts.length == 23) {
                this.credits = parts[22];
            } else if (parts.length == 26) {
                this.totalSeats = parseInt(parts[22]);
                this.remainingSeats = parseInt(parts[23]);
                this.hasWaitlist = parts[24] == "Y";
                this.credits = parts[25];
            } else {
                console.warn(`Parsing with ${parts.length} columns`);
            }
        } else {
            this.term = parts.time;
            this.session = parts.session;
            this.academicGroup = parts.academicGroup;
            this.id = parts.id;
            this.subject = parts.subject;

            this.courseId = parts.courseId;
            this.sectionId = parts.sectionId;

            this.title = parts.title;
            this.component = parts.component;
            this.flags = parts.flags;

            this.blocks = parts.blocks.map((raw: any) => new Section.Block(raw));

            this.instructor = parts.instructor;
            this.credits = parts.credits;

            this.totalSeats = parts.totalSeats;
            this.remainingSeats = parts.remainingSeats;
            this.hasWaitlist = parts.hasWaitlist;
        }

        // let other = sections.get(this.id);
        // if (this.id == 11650) debugger;
        // this.isDuplicate = other != null && other != this;
    }

    private merge(other: Section) {
        if (this.id != other.id)
            throw new Error('Merge invalid args');

        for (let block of other.blocks) {
            let found = false;
            for (let existing of this.blocks) {
                if (block.equals(existing)) {
                    found = true;
                    break;
                }
            }
            if (found) continue;

            this.blocks.push(block);
        }
    }

    getFlag() {
        for (let flag of ['P', 'A', 'S'])
            if (this.flags.includes(flag))
                return flag;
    }

    getCourse() {
        let match = /\(([A-Z]+)\)/.exec(this.subject)!;

        return Course.get(match[1], this.courseId);
    }

    isConcurrent(other: Section) {
        for (let block of this.blocks) {
            for (let otherBlock of other.blocks) {
                for (let day of days) {
                    if (block.days.indexOf(day) < 0 ||
                        otherBlock.days.indexOf(day) < 0)
                        continue;

                    let aTime = block.getTime();
                    let bTime = otherBlock.getTime();

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

    isCompatible(other: Section) {
        if (this.isConcurrent(other))
            return false;

        return this.getCourse() != other.getCourse() ||
            this.getFlag() != other.getFlag() ||
            this.component != other.component;
    }

    static parse(line: string) {
        let regex = /"([^"]*)",/g;
        let match;

        let cols = [];
        while (match = regex.exec(line)) {
            cols.push(match[1].trim());
        }

        if (cols.length == 0) return null;
        let id = parseInt(cols[3]);
        let section = sections.get(id);
        if (!section) {
            section = new Section(cols);
            sections.set(id, section);
        } else {
            section.merge(new Section(cols));
        }

        return section;
    }

    static deserialize(raw: any) {
        let id = parseInt(raw.id);
        let section = sections.get(id);
        if (!section) {
            section = new Section(raw);
            sections.set(id, section);
        }

        return section;
    }
}

namespace Section {
    export class Block {
        readonly days: string[];
        readonly startDate: string;
        readonly endDate: string;
        readonly time: string;
        readonly location: string;

        constructor(raw: any)
        constructor(
            days: string[],
            startDate: string,
            endDate: string,
            time: string,
            location: string,
        )
        constructor(...args: any[]) {
            if (arguments.length == 1) {
                const raw = args[0];
                this.days = raw.days;
                this.startDate = raw.startDate;
                this.endDate = raw.endDate;
                this.time = raw.time;
                this.location = raw.location;
            } else {
                this.days = args[0];
                this.startDate = args[1];
                this.endDate = args[2];
                this.time = args[3];
                this.location = args[4];
            }
        }

        equals(other: Block) {
            return this.time == other.time
                && this.location == other.location
                && this.endDate == other.endDate
                && this.startDate == other.startDate
                && arrayEqual(this.days, other.days);
        }

        getTime() {
            if (this.time == 'ARR')
                return { start: 0, end: 0 };

            let match = /(\d\d?)(30)?-(\d\d?)(30)?(\D+)/.exec(this.time);

            if (!match) {
                console.warn('Failed to parse time: ' + this.time);
                return { start: 0, end: 0 };
            }

            let start = parseInt(match[1]);
            if (match[2]) start += parseInt(match[2]) / 60;

            let end = parseInt(match[3]);
            if (match[4]) end += parseInt(match[4]) / 60;

            let id = match[5];

            if (id != 'AM' && id != 'PM') {
                console.warn('Failed to parse time: ' + this.time);
                return { start: 0, end: 0 };
            }

            if (id == 'PM' && end < 12) {
                end += 12;

                if (end - start > 4)
                    start += 12;
            }

            if (start > end)
                debugger;

            return { start: start, end: end };
        }
    }
}

export default Section;
