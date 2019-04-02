import { Course } from './course';
import { Section, days } from './section';
import { SectionMeeting } from './sectionmeeting';

export { days, Course, Section, SectionMeeting };

export function parseCSV(csv: string, courses: Map<string, Course>) {
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
