import fs from 'fs-extra';
import https from 'https';
import readline from 'readline';

import { performance } from 'perf_hooks';

function pipe(src, dst) {
    return new Promise((resolve, reject) => {
        src.pipe(dst);
        src.on('end', () => resolve());
    });
}

async function fetch(term, currentTag) {
    let headers = {};
    if (currentTag)
        headers['if-none-match'] = currentTag;

    return new Promise((resolve, reject) => {
        const req = https.request({
            method: 'GET',
            protocol: 'https:',
            hostname: 'ro.umich.edu',
            path: `/sites/default/files/timesched/pdf/${term}.csv`,
            headers,
        }, res => {
            if (res.statusCode == 304) {
                resolve(null)
            } else if (res.statusCode == 200) {
                resolve({
                    tag: res.headers.etag,
                    data: res,
                });
            } else {
                reject({ code: 404, error: 'term not found' })
            }
        });

        req.on('error', reject);

        req.end();
    });
}

async function filterSchedule(src, subjectId, courseId) {
    return new Promise((resolve, reject) => {
        let filtered = ``;

        src.on('line', line => {
            let regex = /"([^"]*)",/g;
            let match;

            let fields = [];
            while (match = regex.exec(line)) {
                fields.push(match[1].trim());
            }

            if (fields.length != 23) return;

            let thisSubjectId = /\(([A-Z]+)\)/.exec(fields[4])[1];
            let thisCourseId = parseInt(fields[5]);

            if (thisCourseId != courseId || thisSubjectId != subjectId)
                return;

            filtered += line + '\n';
        });

        src.on('close', () => {
            resolve(filtered);
        });
    });
}

let pending = null;
const cacheExpirations = new Map();

async function update(term) {
    let basePath = `data/${term}`;
    let csvPath = basePath + '.csv';
    let tagPath = basePath + '.tag';

    let now = performance.now();
    let expiration = cacheExpirations.get(term) || 0;

    let currentTag = null;
    try { currentTag = await fs.readFile(tagPath, 'utf8'); } catch (e) { }

    let result = null;

    if (!currentTag || !await fs.exists(csvPath)) {
        console.log(`no data found for '${term}'. fetching`)
        result = await fetch(term);
    } else if (expiration < now) {
        console.log(`cache expired. fetching`);
        result = await fetch(term, currentTag);
    }

    if (result) {
        console.log(`new data found. downloading`);
        const dst = fs.createWriteStream(csvPath, 'utf8');
        await pipe(result.data, dst);
        await fs.writeFile(tagPath, result.tag, 'utf8');
    }

    cacheExpirations.set(term, now + 60 * 1000);
    pending = null;

    return csvPath;
}

export async function findCourses(term, subjectId, courseId) {
    if (!pending) pending = update(term);
    let filePath = await pending;

    let raw = fs.createReadStream(filePath, 'utf8');
    let src = readline.createInterface({ input: raw });

    return await filterSchedule(src, subjectId, courseId);
}
