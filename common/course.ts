import Section from './section';

const courses = new Map<string, Course>();

class Course {
    private constructor(
        readonly subject: string,
        readonly id: number
    ) {
        let other = courses.get(subject + id);
        if (other && other != this) throw new Error('Duplicated sections');
    }

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
        let course = Course.tryParse(id);
        if (course == null)
            throw new Error('Invalid id: ' + id);
        
        return course;
    }

    static tryParse(id: string) {
        let match = /([A-Za-z]+)\s*(\d+)/.exec(id);
        if (!match) return null;

        let subj = match[1].toUpperCase();
        let course = parseInt(match[2]);

        return Course.get(subj, course);
    }

    static deserialize(raw: any) {
        return Course.get(raw.subject, raw.id);
    }
}

export default Course;
