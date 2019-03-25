import express from 'express';

import * as schedule from './schedule';

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
            res.json({ code, error });
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

    let content = await schedule.findCourses(term, subject, courseId);
    res.statusCode = 200;
    res.set('content-type', 'text/plain');
    res.send(content);
}));

app.listen(parseInt(process.argv[2] || 8081));
