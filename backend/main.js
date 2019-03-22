'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs-extra'));
var https = _interopDefault(require('https'));
var readline = _interopDefault(require('readline'));
var express = _interopDefault(require('express'));
var perf_hooks = require('perf_hooks');

const app = express();
const cacheExpirations = new Map();

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

function fetchSchedule(term, outPath) {
    return new Promise((resolve, reject) => {
        const req = https.request({
            method: (outPath ? 'GET' : 'HEAD'),
            protocol: 'https:',
            hostname: 'ro.umich.edu',
            path: `/sites/default/files/timesched/pdf/${term}.csv`
        }, res => {
            if (outPath) {
                const dst = fs.createWriteStream(outPath, 'utf8');
                res.pipe(dst);
                res.on('end', () => resolve(res.headers.etag));
            } else {
                resolve(res.headers.etag);
            }

            res.on('error', reject);

        });

        req.on('error', reject);

        req.end();
    });
}

function filterSchedule(src, subjectId, courseId) {
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

app.get('/term/:term/course/:id', wrap(async (req, res, next) => {
    let id = req.params.id;
    let match = /([A-Za-z]+)\s*(\d+)/.exec(id);
    if (!match)
        throw { code: 400, error: 'invalid course id' };

    let subject = match[1].toUpperCase();
    let courseId = parseInt(match[2]);

    let term = req.params.term;

    let basePath = `data/${term}`;
    let csvPath = basePath + '.csv';
    let etagPath = basePath + '.etag';

    let now = perf_hooks.performance.now();
    let expiration = cacheExpirations.get(basePath) || 0;

    let currentTag = null;
    try { currentTag = await fs.readFile(etagPath, 'utf8'); } catch (e) { }

    if (!currentTag || !await fs.exists(csvPath)) {
        console.log(`no data found for '${term}', fetching`);
        let correctTag = await fetchSchedule(term, csvPath);
        await fs.writeFile(etagPath, correctTag, 'utf8');
    } else if (expiration <= now) {
        console.log(`cache expired, checking etag`);
        let correctTag = await fetchSchedule(term);
        if (currentTag != correctTag) {
            console.log(`etag invalid, fetching`);
            await fetchSchedule(term, csvPath);
            await fs.writeFile(etagPath, correctTag, 'utf8');
        } else {
            console.log(`etag valid`);
        }
    }

    cacheExpirations.set(basePath, now + 60 * 1000);

    let raw = fs.createReadStream(csvPath, 'utf8');
    let src = readline.createInterface({ input: raw });

    let list = await filterSchedule(src, subject, courseId);
    res.statusCode = 200;
    res.set('content-type', 'text/plain');
    res.send(list);
}));

app.listen(parseInt(process.argv[2] || 8081));
//# sourceMappingURL=main.js.map
