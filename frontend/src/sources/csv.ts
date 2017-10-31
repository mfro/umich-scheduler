import winter18 from './WN2018.csv';

import Section from './section';

const contents = new Promise<string[]>(resolve => {
    let req = new XMLHttpRequest();
    req.open('GET', winter18);
    req.send();

    req.addEventListener('load', e => {
        let lines = req.responseText.split('\n');
        resolve(lines.slice(1).filter(l => l != ''));
    });
});

function load(predicate: (section: Section) => boolean) {
    return contents.then(lines => {
        let matches = [];

        for (let line of lines) {
            let regex = /"([^"]*)",/g;
            let match;

            let cols = [];
            while (match = regex.exec(line)) {
                cols.push(match[1].trim());
            }

            let section = {
                term: cols[0],
                session: cols[1],
                academicGroup: cols[2],
                id: parseInt(cols[3]),
                subject: cols[4],

                courseId: parseInt(cols[5]),
                sectionId: parseInt(cols[6]),

                title: cols[7],
                component: cols[8],
                flags: cols[9],

                days: cols.slice(10, 17).filter(d => d != ''),
                startDate: cols[17],
                endDate: cols[18],
                time: cols[19],
                location: cols[20],
                instructor: cols[21],
                credits: cols[22],
            };

            if (!predicate(section))
                continue;

            matches.push(section);
        }

        return matches;
    })
}

export function bySubject(subject: string) {
    return load(section => {
        return section.subject.includes(subject);
    });
}

export function byCourse(subject: string, courseId: number) {
    return load(section => {
        return section.subject.includes(subject) &&
            section.courseId == courseId;
    });
}
