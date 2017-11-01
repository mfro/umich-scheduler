import * as express from 'express';

import * as terms from './terms';
import * as schedule from './schedule';

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/terms/:term/courses/:id', (req, res, next) => {
    let id: string = req.params.id;
    let match = /(\D+)\s*(\d+)/.exec(id)!;

    let termId = req.params.term;
    let courseId = parseInt(match[2]);
    let subject = match[1];

    let term = terms.parse(termId);

    if (term == null) {
        res.statusCode = 404;
        res.json({ error: 'term not found' });
        return;
    }

    schedule.find(term, s => {
        return s.courseId == courseId
            && s.subject.includes(`(${subject})`);
    }).then(list => {
        res.statusCode = 200;
        res.json(list);
    }).catch(e => {
        console.log(e);
        res.statusCode = 500;
        res.json({ error: e });
    });
});

export function start(port: number) {
    app.listen(port);
}
