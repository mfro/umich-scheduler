import Section from './section';

const courses = new Map<string, Course>();

class Course {
    private constructor(
        readonly subject: string,
        readonly id: number
    ) { }

    isSection(section: Section) {
        return section.getCourse() == this;
    }

    toString() {
        return `${this.subject} ${this.id}`;
    }

    serialize() {
        return {
            id: this.id,
            subject: this.subject,
        };
    }

    static get(subj: string, id: number) {
        let course = courses.get(subj + id);
        if (!course) {
            course = new Course(subj, id);
            courses.set(subj + id, course);
        }
        return course;
    }

    static parse(id: string) {
        let match = /([A-Za-z]+)\s*(\d+)/.exec(id);
        if (!match) throw new Error('Invalid id: ' + id);

        let subj = match[1];
        let course = parseInt(match[2]);

        return Course.get(subj, course);
    }

    static deserialize(raw: any) {
        return Course.get(raw.subject, raw.id);
    }
}

export default Course;
