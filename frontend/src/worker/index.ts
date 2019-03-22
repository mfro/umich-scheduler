import { Course } from '@/model';

import wGenerate from 'worker-loader!./generate';

interface Job<T> {
    input: T;
    resolve: (e: any) => void;
}

class WorkerWrapper<T> {
    private instance: Worker;
    private jobs: Job<T>[] = [];

    constructor(instance: Worker) {
        this.instance = instance;
        this.instance.addEventListener('message', (e) => {
            let job = this.jobs.shift()!;
            job.resolve(e.data);
            if (this.jobs.length > 0) {
                this.flush();
            }
        });
    }

    cancel() {
        if (this.jobs.length > 1) {
            this.jobs.splice(1, this.jobs.length - 1);
        }
    }

    enqueue(input: T) {
        return new Promise((resolve, reject) => {
            this.jobs.push({ input, resolve });
            if (this.jobs.length == 1) {
                this.flush();
            }
        });
    }

    private flush() {
        this.instance.postMessage(this.jobs[0].input);
    }
}

const implGenerate = new WorkerWrapper<generate.args>(new wGenerate());

export function generate(args: generate.args) {
    implGenerate.cancel();
    return implGenerate.enqueue(args);
}

export namespace generate {
    export interface args {
        courses: Course[];
        locked: number[];
        hidden: number[];
    }
}
