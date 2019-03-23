const fs = require('fs-extra');
const readline = require('readline');

function run() {
    let data = fs.createReadStream('data/FA2019.csv');
    let src = readline.createInterface({ input: data });

    let subjects = new Set;
    let courses = new Set;

    src.on('line', line => {
        let regex = /"([^"]*)",/g;
        let match;

        let fields = [];
        while (match = regex.exec(line)) {
            fields.push(match[1].trim());
        }

        if (fields.length != 23) return;

        let subject = /\(([A-Z]+)\)/.exec(fields[4])[1];
        let course = parseInt(fields[5]);

        let id = `${subject} ${course.toString().padStart(3, '0')}`;

        if (!subjects.has(subject)) {
            console.log(fields[4]);
            subjects.add(subject);
        }

        courses.add(id);
    });

    src.on('close', () => {
        // console.log(subjects.size);
        // console.log(courses.size);
        // for (let subject of subjects) {
        //     console.log(subject);
        // }
    });
}

run();
