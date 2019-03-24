'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var express = _interopDefault(require('express'));
var fs = _interopDefault(require('fs-extra'));
var https = _interopDefault(require('https'));
var readline = _interopDefault(require('readline'));
var perf_hooks = require('perf_hooks');

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
                resolve(null);
            } else {
                resolve({
                    tag: res.headers.etag,
                    data: res,
                });
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

    let now = perf_hooks.performance.now();
    let expiration = cacheExpirations.get(term) || 0;

    let currentTag = null;
    try { currentTag = await fs.readFile(tagPath, 'utf8'); } catch (e) { }

    let result = null;

    if (!currentTag || !await fs.exists(csvPath)) {
        console.log(`no data found for '${term}'. fetching`);
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

async function findCourses(term, subjectId, courseId) {
    if (!pending) pending = update(term);
    let filePath = await pending;

    let raw = fs.createReadStream(filePath, 'utf8');
    let src = readline.createInterface({ input: raw });

    return await filterSchedule(src, subjectId, courseId);
}

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

function wrap(fn) {
    const p = Promise.resolve();
    return function (req, res, next) {
        p.then(() => {
            return fn(req, res, next);
        }).catch(err => {
            let code, error;
            if (err instanceof Error) {
                code = 500;
                error = err.message;
            } else {
                code = err.code;
                error = err.error;
            }

            res.statusCode = code;
            res.json({ error });
        });
    };
}

app.get('/term/:term/course/:id', wrap(async (req, res, next) => {
    let id = req.params.id;
    let match = /([A-Za-z]+)\s*(\d+)/.exec(id);
    if (!match)
        throw { code: 400, error: 'invalid course id' };

    let subject = match[1].toUpperCase();
    let courseId = parseInt(match[2]);

    let term = req.params.term;

    let content = await findCourses(term, subject, courseId);
    res.statusCode = 200;
    res.set('content-type', 'text/plain');
    res.send(content);
}));

app.listen(parseInt(process.argv[2] || 8081));
//# sourceMappingURL=main.js.map
