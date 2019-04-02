if ('WorkerGlobalScope' in self) {
    let messageFlag = false;
    async function flushMessage() {
        return new Promise(resolve => {
            function next() {
                if (messageFlag) {
                    messageFlag = false;
                    setTimeout(next, 1);
                } else {
                    resolve();
                }
            }

            messageFlag = false;
            setTimeout(next, 1);
        });
    }

    const context = self as unknown as Worker;

    let instance: Generator | null = null;

    async function tick(nonce: any, gen: Generator) {
        while (true) {
            await flushMessage();

            if (gen != instance) return;

            let limit = performance.now() + 50;
            let paused = gen.next(() => {
                return limit < performance.now();
            });

            context.postMessage({
                type: 'progress',
                body: {
                    nonce,
                    complete: !paused,
                    occurrences: gen.occurrences,
                    scheduleCount: gen.schedules.length,
                },
            });

            if (!paused) {
                break;
            }
        }
    }

    context.addEventListener('message', async e => {
        messageFlag = true;
        switch (e.data.type) {
            case 'get': {
                let index = e.data.body as number;

                let result;
                if (!instance || index < 0 || index >= instance.schedules.length)
                    result = null;
                else
                    result = instance.schedules[index];

                context.postMessage({
                    type: 'get',
                    body: result,
                });
                break;
            }
            case 'run': {
                let args = e.data.body as {
                    nonce: any,
                    input: TimeBlock[][][],
                };

                instance = new Generator(args.input);
                tick(args.nonce, instance);
                break;
            }
        }
    });
}

export interface TimeBlock {
    day: string;
    start: number;
    end: number;
}

export function hasOverlap(a: TimeBlock | TimeBlock[], b: TimeBlock | TimeBlock[]) {
    if (!(a instanceof Array)) a = [a];
    if (!(b instanceof Array)) b = [b];

    for (let i = 0; i < a.length; ++i) {
        for (let j = 0; j < b.length; ++j) {
            if (a[i].day == b[j].day &&
                a[i].end > b[j].start &&
                b[j].end > a[i].start) {
                return true;
            }
        }
    }
}

export class Generator {
    lookup: number[] = [];
    compatibility = new Set<number>();

    segments: { index: number, options: number[] }[] = [];

    schedules: number[][] = [];
    occurrences: number[][];

    permutation: number[];

    /**
     * @param segments Each segment is an array of options. Each option is an array of time blocks that option occupies
     */
    constructor(segments: TimeBlock[][][]) {
        this.occurrences = segments.map(s => s.map(() => 0));

        let permute = segments.map((_, i) => i);
        permute.sort((a, b) => segments[a].length - segments[b].length);

        this.permutation = segments.map((_, i) => permute.indexOf(i));

        segments.sort((a, b) => a.length - b.length);

        for (let i = 0; i < segments.length; ++i) {
            let seg = segments[i];

            let indices = seg.map((_, j) => j);
            let options = seg.map((_, j) => this.lookup.length + j);

            this.lookup.push(...indices);
            this.segments.push({ index: 0, options });
        }

        for (let i = 0; i < this.segments.length; ++i) {
            for (let o1 of this.segments[i].options) {
                for (let j = i + 1; j < this.segments.length; ++j) {
                    for (let o2 of this.segments[j].options) {
                        let i2 = this.lookup[o1];
                        let j2 = this.lookup[o2];

                        if (hasOverlap(segments[i][i2], segments[j][j2]))
                            continue;

                        this.compatibility.add(this.dualId(o1, o2));
                    }
                }
            }
        }
    }

    next(stop: () => boolean) {
        if (this.segments.length == 0) return true;

        return !this.buildHelper([], 0, stop);
    }

    buildHelper(schedule: number[], index: number, stop: () => boolean): boolean {
        let segment = this.segments[index];

        for (; segment.index < segment.options.length; ++segment.index) {
            let id = segment.options[segment.index];
            if (!this.isValid(schedule, id)) {
                if (stop())
                    return false;
                continue;
            }

            let build = schedule.concat([id]);

            if (index + 1 == this.segments.length) {

                let compiled = this.permutation.map(i => this.lookup[build[i]]);

                this.schedules.push(compiled);
                for (let i = 0; i < compiled.length; ++i) {
                    this.occurrences[i][compiled[i]]++;
                }

                if (stop()) {
                    ++segment.index;
                    return false;
                }
            } else if (!this.buildHelper(build, index + 1, stop))
                return false;
        }

        segment.index = 0;
        return true;
    }

    /**
     * Checks if it is valid to add a section to a schedule
     * @param schedule Existing schedule to compare
     * @param section Potential addition
     */
    isValid(schedule: number[], id: number) {
        for (let existing of schedule) {
            if (!this.compatibility.has(this.dualId(existing, id))) {
                return false;
            }
        }

        return true;
    }

    private dualId(a: number, b: number) {
        if (a < b)
            return a * this.lookup.length + b;
        return b * this.lookup.length + a;
    }
}
