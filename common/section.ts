import Course from './course';

const sections = new Map<number, Section>();
const days = ['M', 'T', 'W', 'TH', 'F', 'S', 'SU'];

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

    readonly days: string[]
    readonly startDate: string;
    readonly endDate: string;
    readonly time: string;
    readonly location: string;
    readonly instructor: string;
    readonly credits: string;

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

            this.days = parts.slice(10, 17).filter(d => d != '');
            this.startDate = parts[17];
            this.endDate = parts[18];
            this.time = parts[19];
            this.location = parts[20];
            this.instructor = parts[21];
            this.credits = parts[22];
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

            this.days = parts.days;
            this.startDate = parts.startDate;
            this.endDate = parts.endDate;
            this.time = parts.time;
            this.location = parts.location;
            this.instructor = parts.instructor;
            this.credits = parts.credits;
        }
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
        for (let day of days) {
            if (this.days.indexOf(day) < 0 ||
                other.days.indexOf(day) < 0)
                continue;

            let aTime = this.getTime();
            let bTime = other.getTime();

            if (bTime.start >= aTime.start && bTime.start < aTime.end)
                return true;

            if (aTime.start >= bTime.start && aTime.start < bTime.end)
                return true;

            return false;
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
        }

        return section;
    }

    static deserialize(raw: any) {
        return new Section(raw);
    }
}

export default Section;
// export default interface Section {
//     term: string;
//     session: string;
//     academicGroup: string;
//     id: number;
//     subject: string;

//     courseId: number;
//     sectionId: number;

//     title: string;
//     component: string;
//     flags: string;

//     days: string[]
//     startDate: string;
//     endDate: string;
//     time: string;
//     location: string;
//     instructor: string;
//     credits: string;
// }

