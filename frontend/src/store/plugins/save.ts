import * as Vuex from 'vuex';

import * as json from '@/lib/json';

import Course from '@common/course';

// import { Course } from '@/store/modules/generator';

// interface SaveFile {
//     hidden: number[];
//     locked: number[];
//     courses: { id: string, enabled: boolean }[];
// }

interface SaveFile2 {
    contents: { path: string, value: any }[];
}

// const save_key = 'mfro/umich-scheduler/save';
const save_key2 = 'mfro/umich-scheduler/save-v2';
const courses_key = 'mfro/umich-scheduler/courses-v1';

const paths = new Array<string>();
const coursesCbs = new Array<(store: Vuex.Store<any>) => Course[]>();

let is_loading = false;

export function add(path: string) {
    paths.push(path);
}

export function courses(cb: (store: Vuex.Store<any>) => Course[]) {
    coursesCbs.push(cb);
}

export default function init(store: Vuex.Store<any>) {
    store.subscribe((mut, state) => {
        save(store);
    });

    load(store).catch(console.error);
}

function load(store: Vuex.Store<any>) {
    let courses: string[];

    try {
        let raw = localStorage.getItem(courses_key);
        if (!raw) return Promise.resolve();
        courses = json.deserialize(store, raw);
        if (!courses) return Promise.resolve();
    } catch (e) {
        return Promise.reject(e);
    }

    is_loading = true;

    return Promise.each(courses, raw => {
        let course = Course.parse(raw);
        return store.dispatch('courses/load', course);
    }).then(() => {
        let save: SaveFile2;
        
        try {
            let raw = localStorage.getItem(save_key2);
            if (!raw) return Promise.resolve();
            save = json.deserialize(store, raw);
            if (!save) return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }

        for (let item of save.contents) {
            let keys = item.path.split('.');

            let node = store.state;

            for (let i = 0; i < keys.length - 1; i++) {
                node = node[keys[i]];

                if (node == null) {
                    console.warn('Invalid save path: ' + item.path);
                    break;
                }
            }
            
            node[keys[keys.length - 1]] = item.value;
        }
    }).then(() => {
        return store.dispatch('generator/generate');
    }).then(() => {
        is_loading = false;
    });
}

function save(store: Vuex.Store<any>) {
    if (is_loading) return;

    let courses = new Array<string>();

    for (let cb of coursesCbs) {
        for (let id of cb(store)) {
            if (courses.indexOf(id.toString()) != -1)
                continue;

            courses.push(id.toString());
        }
    }

    try {
        localStorage.setItem(courses_key, json.serialize(courses));
    } catch (e) { }

    const save: SaveFile2 = {
        contents: [],
    };

    for (let path of paths) {
        let keys = path.split('.');

        let node = store.state;


        for (let i = 0; i < keys.length - 1; i++) {
            node = node[keys[i]];

            if (node == null) {
                console.warn('Invalid save path: ' + path);
                break;
            }
        }

        save.contents.push({
            path: path,
            value: node[keys[keys.length - 1]],
        });
    }

    try {
        localStorage.setItem(save_key2, json.serialize(save));
    } catch (e) { }
}
