import store from '@/store';
import { Course } from '@/model';

import GeneratorWorker from 'worker-loader!./non-blocking';

type Callback<T> = (status: T) => void;

const worker = new GeneratorWorker();
const gets: Callback<number[]>[] = [];
const listening = new Set<Callback<Progress>>();

store.subscribe((m) => {
    if (m.type == 'ADD_COURSE') {
        let added = m.payload as Course | Course[];
        if (!(added instanceof Array)) added = [added];

        worker.postMessage({ type: 'courses', body: added });
    }
});

worker.addEventListener('message', e => {
    let m = e.data;
    if (m.type == 'progress') {
        for (let cb of listening)
            cb(m.body);
    } else if (m.type == 'get') {
        gets.shift()!(m.body);
    }
});

export interface Input {
    courses: string[];
    hidden: number[];
    locked: number[];
}

export interface Progress {
    complete: boolean;
    scheduleCount: number;
    occurences: { [id: number]: number };
}

export function start(input: Input) {
    worker.postMessage({ type: 'run', body: input });
}

export function get(index: number) {
    return new Promise((resolve, reject) => {
        gets.push(resolve);
        worker.postMessage({ type: 'get', body: index });
    });
}

export function listen(cb: Callback<Progress>) {
    listening.add(cb);

    return () => listening.delete(cb);
}
