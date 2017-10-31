import Section from './sources/section';

export function matchSection(myId: string, section: Section) {
    let id = parseId(myId);

    return section.courseId == id.courseId
        && section.subject.includes(`(${id.subject})`)
}

export function parseId(myId: string) {
    let match = /([A-Za-z]+)\s*(\d+)/.exec(myId);
    if (!match) throw new Error('Invalid id: ' + myId);
    
    let subj = match[1];
    let course = parseInt(match[2]);

    return { subject: subj, courseId: course };
}

export function parseTime(time: string) {
    if (time == 'ARR')
        return { start: 0, end: 0 };

    let match = /(\d\d?)(30)?-(\d\d?)(30)?(\D+)/.exec(time);

    if (!match) {
        console.warn('Failed to parse time: ' + time);
        return { start: 0, end: 0 };
    }

    let start = parseInt(match[1]);
    if (match[2]) start += parseInt(match[2]) / 60;

    let end = parseInt(match[3]);
    if (match[4]) end += parseInt(match[4]) / 60;

    let id = match[5];

    if (id != 'AM' && id != 'PM') {
        console.warn('Failed to parse time: ' + time);
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