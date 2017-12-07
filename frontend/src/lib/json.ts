import * as Vuex from 'vuex';

import Block from './block';
import Course from '@mfro/umich-scheduler-common/course';

const discriminant = '_is';

const block_key = 'BLOCK';
const course_key = 'COURSE';

export function serialize(value: any) {
    return JSON.stringify(value, (key, value) => {
        if (value instanceof Block) {
            value = value.serialize();
            value[discriminant] = block_key;
        } else if (value instanceof Course) {
            value = value.serialize();
            value[discriminant] = course_key;
        }

        return value;
    });
}

export function deserialize(store: Vuex.Store<any>, str: string) {
    return JSON.parse(str, (key, value) => {
        let type = value[discriminant];

        if (!type)
            return value;

        if (type == block_key)
            return Block.deserialize(store, value);

        if (type == course_key)
            return Course.deserialize(value);

        throw new Error('??');
    });
}
