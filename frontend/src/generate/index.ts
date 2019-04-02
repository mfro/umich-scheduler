import store from '@/store';
import { Course } from '@/model';

// import GeneratorWorker from 'worker-loader!./non-blocking';
import GeneratorWorker from 'worker-loader!./general';
import { TimeBlock } from './general';

type Callback<T> = (status: T) => void;

const worker = new GeneratorWorker();
const gets: Callback<number[]>[] = [];
const listening = new Set<Callback<Progress>>();

let currentNonce = 0;

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
        if (m.body.complete)
            console.log('complete', performance.now());
        if (m.body.nonce != currentNonce)
            return;
        for (let cb of listening)
            cb(m.body);
    } else if (m.type == 'get') {
        gets.shift()!(m.body);
    }
});

export interface Progress {
    complete: boolean;
    scheduleCount: number;
    occurences: number[][];
}

export function start(input: TimeBlock[][][]) {
    console.log('start', performance.now());
    worker.postMessage({
        type: 'run', body: {
            nonce: ++currentNonce,
            input: input
        },
    });
}

export function get(index: number) {
    console.log('get', performance.now());
    return new Promise((resolve, reject) => {
        gets.push(resolve);
        worker.postMessage({ type: 'get', body: index });
    });
}

export function listen(cb: Callback<Progress>) {
    listening.add(cb);

    return () => listening.delete(cb);
}
