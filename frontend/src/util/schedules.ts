// import Section from '@/common/section';

// /**
//  * Matches a course id against a section
//  * @param myId Section id in the format 'SUBJECT COURSE'
//  * @param section Section to compare against
//  * @returns {boolean} true if the section is in the specified course, false otherwise
//  */
// export function matchSection(myId: string, section: Section): boolean {
//     let id = parseId(myId);
//     return section.courseId == id.courseId
//         && section.subject.includes(`(${id.subject})`);
// }

// /**
//  * Creates a course id from a section
//  * @param section The section
//  * @returns {string} Section id in the format 'SUBJECT COURSE'
//  */
// export function makeId(section: Section): string {
//     let match = /\(([A-Z]+)\)/.exec(section.subject);
//     if (!match) throw new Error('Invalid subject: ' + section.subject);

//     return `${match[1]} ${section.courseId}`;
// }

// export function getFlag(section: Section) {
//     for (let flag of ['P', 'A', 'S'])
//         if (section.flags.includes(flag))
//             return flag;
// }

// /**
//  * Parses a section id into its components
//  * @param myId Section id in the format 'SUBJECT COURSE'
//  * @returns {object} Contents
//  */
// export function parseId(myId: string): { subject: string, courseId: number } {
//     let match = /([A-Za-z]+)\s*(\d+)/.exec(myId);
//     if (!match) throw new Error('Invalid id: ' + myId);

//     let subj = match[1];
//     let course = parseInt(match[2]);

//     return { subject: subj, courseId: course };
// }

// /**
//  * Parses a section time
//  * @param time The time in the format 'START-ENDTYPE'
//  * @returns {object} start and end
//  */
// export function parseTime(time: string): { start: number, end: number } {
//     if (time == 'ARR')
//         return { start: 0, end: 0 };

//     let match = /(\d\d?)(30)?-(\d\d?)(30)?(\D+)/.exec(time);

//     if (!match) {
//         console.warn('Failed to parse time: ' + time);
//         return { start: 0, end: 0 };
//     }

//     let start = parseInt(match[1]);
//     if (match[2]) start += parseInt(match[2]) / 60;

//     let end = parseInt(match[3]);
//     if (match[4]) end += parseInt(match[4]) / 60;

//     let id = match[5];

//     if (id != 'AM' && id != 'PM') {
//         console.warn('Failed to parse time: ' + time);
//         return { start: 0, end: 0 };
//     }

//     if (id == 'PM' && end < 12) {
//         end += 12;

//         if (end - start > 4)
//             start += 12;
//     }

//     if (start > end)
//         debugger;

//     return { start: start, end: end };
// }

// export function areCompatible(a: Section, b: Section): boolean {
//     if (overlap(a, b))
//         return false;

//     let flag = 
// }

// /**
//  * Checks if two sections overlap
//  * @param a The first section
//  * @param b The second section
//  * @returns {boolean} true if the sections overlap, false otherwise
//  */
// export function overlap(a: Section, b: Section): boolean {
//     let days = ['M', 'T', 'W', 'TH', 'F', 'S', 'SU'];

//     for (let day of days) {
//         if (a.days.indexOf(day) < 0 ||
//             b.days.indexOf(day) < 0)
//             continue;

//         let aTime = parseTime(a.time);
//         let bTime = parseTime(b.time);

//         if (bTime.start >= aTime.start && bTime.start < aTime.end)
//             return true;

//         if (aTime.start >= bTime.start && aTime.start < bTime.end)
//             return true;

//         return false;
//     }

//     return false;
// }