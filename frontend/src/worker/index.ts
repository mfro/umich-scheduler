import { Course } from '@/model';

import wGenerate from 'worker-loader!./generate';

export const generate = new wGenerate();

export namespace generate {
    export interface args {
        courses: Course[];
        locked: number[];
        hidden: number[];
    }
}
