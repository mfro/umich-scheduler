import { Term } from './terms';
import Section from '@/common/section';

import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import * as http from 'http';
import * as mkdirp from 'mkdirp';
import * as readline from 'readline';

function getFiles(term: Term) {
    const base = path.join('courses', term.id);

    return {
        csv: base + '.csv',
        cache: base + '.cache',
    };
}

const cache = new Map<string, Date>();

export function find(term: Term, predicate: (section: Section) => boolean) {
    return getSchedule(term).then(src => {
        return new Promise<Section[]>((resolve, reject) => {
            let match = new Array<Section>();

            let total = 0;

            src.on('line', line => {
                total++;
                let section = parseSection(line);

                if (!section) return;
                if (!predicate(section)) return;

                match.push(section);
            });

            src.on('close', () => {
                resolve(match);
            });
        });
    });
}

function parseSection(line: string): Section | null {
    let regex = /"([^"]*)",/g;
    let match;

    let cols = [];
    while (match = regex.exec(line)) {
        cols.push(match[1].trim());
    }

    if (cols.length == 0) return null;

    return {
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
}

function getSchedule(term: Term) {
    const files = getFiles(term);

    return new Promise<boolean>((resolve, reject) => {
        fs.readFile(files.cache, 'utf8', (err, data) => {
            if (data)
                resolve(isStale(term, data));
            else
                resolve(true);
        });
    }).then(isStale => {
        if (isStale)
            return download(term);
    }).then(() => {
        const src = fs.createReadStream(files.csv);
        const reader = readline.createInterface({
            input: src
        });

        return reader;
    });
}

function isStale(term: Term, etag: string) {
    const files = getFiles(term);

    const expires = cache.get(term.id);
    const now = new Date();
    if (expires && expires.valueOf() > now.valueOf())
        return Promise.resolve(false);

    console.log('Checking ETag...');

    return new Promise<boolean>((resolve, reject) => {
        let args = url.parse(`http://www.ro.umich.edu/timesched/pdf/${term.registrarId}_open.csv`);

        const req = http.request({
            method: 'HEAD',
            ...<any>args,
        }, res => {
            if (res.headers.etag == etag) {
                let expires = new Date();
                expires.setMinutes(expires.getMinutes() + 5);
                cache.set(term.id, expires);
            }

            resolve(res.headers.etag != etag);
        });

        req.on('error', reject);

        req.end();
    });
}

function download(term: Term) {
    const files = getFiles(term);
    const dir = path.dirname(files.csv);

    console.log('Downloading ETag...');
    
    return new Promise<void>((resolve, reject) => {
        mkdirp(dir, (err, made) => {
            if (err) return reject(err);

            let args = url.parse(`http://www.ro.umich.edu/timesched/pdf/${term.registrarId}_open.csv`);

            const req = http.request({
                method: 'GET',
                ...<any>args,
            }, res => {
                const dst = fs.createWriteStream(files.csv);
                dst.on('open', () => res.pipe(dst));

                res.on('error', reject);
                res.on('end', () => {
                    let expires = new Date();
                    expires.setMinutes(expires.getMinutes() + 5);
                    cache.set(term.id, expires);

                    const etag = res.headers.etag;
                    fs.writeFile(files.cache, etag, err => {
                        if (err) return reject(err);

                        resolve();
                    });
                });
            });

            req.on('error', reject);

            req.end();
        });
    });
}
